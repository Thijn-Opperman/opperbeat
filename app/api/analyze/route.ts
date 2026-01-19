import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from 'music-metadata';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { extractArtwork } from '@/lib/extract-artwork';
import { uploadAudioFile, uploadArtwork } from '@/lib/storage-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';
import { MusicMetadata, AnalyzerResult } from '@/lib/types';
import { handleUnknownError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const saveParam = formData.get('save');
    const saveToDatabase = saveParam === 'true'; // Optional: save to database
    
    console.log('📥 API Request ontvangen:');
    console.log('   - File name:', file?.name);
    console.log('   - File size:', file?.size, 'bytes');
    console.log('   - Save parameter:', saveParam, '(saveToDatabase:', saveToDatabase, ')');

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    // Haal user ID op (optioneel - voor development kan anon gebruikt worden)
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true); // allowAnonymous = true voor development
      console.log('📝 User ID:', userId || 'null (anonymous)');
    } catch (authError) {
      // getUserId met allowAnonymous=true zou geen error moeten gooien
      // Maar voor de zekerheid: gebruik null
      console.warn('⚠️ Auth error (using null):', authError);
      userId = null;
    }

    // Maak een tijdelijk bestand aan voor metadata parsing
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}-${file.name}`);
    
    // Schrijf het bestand naar de tijdelijke locatie
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

    try {
      // Parse metadata met music-metadata (voor snelle metadata)
      let metadata: MusicMetadata | null = null;
      try {
        metadata = await parseFile(tempFilePath);
      } catch (metaError) {
        console.warn('Metadata parsing gefaald, doorgaan met analyzer:', metaError);
      }

      // Roep externe Python analyzer API aan (Railway)
      let analyzerResult: AnalyzerResult | null = null;
      try {
        console.log('Roep Python analyzer API aan...');
        
        // Gebruik environment variable voor externe API URL
        const apiUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
        
        if (!apiUrl) {
          console.warn('⚠️ PYTHON_API_URL niet ingesteld in Vercel environment variables');
          console.warn('⚠️ Gebruik alleen metadata (BPM/key analyse niet beschikbaar)');
          console.warn('⚠️ Om analyzer te activeren: voeg PYTHON_API_URL toe in Vercel Settings → Environment Variables');
          // Ga door zonder analyzer, gebruik alleen metadata
          analyzerResult = null;
        } else {
          // Valideer URL format
          try {
            new URL(apiUrl); // Valideer URL format
          } catch (urlError) {
            console.error('❌ Ongeldige PYTHON_API_URL format:', apiUrl);
            throw new Error(`Ongeldige API URL format: ${apiUrl}`);
          }
          
          console.log('API URL:', apiUrl);
          console.log('File size:', buffer.length, 'bytes');
          
          // Gebruik FormData voor efficiënte file upload
          const uploadFormData = new FormData();
          const blob = new Blob([buffer], { type: file.type || 'audio/mpeg' });
          uploadFormData.append('file', blob, file.name);
          // include_waveform moet als string "true" of "false" worden verzonden
          uploadFormData.append('include_waveform', String(true));
          
          console.log('Sending request to Railway...');
          
          // Timeout voor grote bestanden (120 seconden)
          const timeoutMs = 120000; // 2 minuten
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              body: uploadFormData,
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Railway API error response:', errorText);
              throw new Error(`Python API error: ${response.status} - ${errorText}`);
            }

            analyzerResult = await response.json();
            console.log('✅ Analyzer resultaat ontvangen:', analyzerResult);
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error('Analyse timeout: Het bestand is te groot of de analyse duurt te lang. Probeer een kleiner bestand of korter nummer.');
            }
            throw fetchError;
          }
        }
        
      } catch (analyzerError: unknown) {
        const errorMessage = analyzerError instanceof Error ? analyzerError.message : String(analyzerError);
        console.error('❌ Fout bij Python analyzer API:', analyzerError);
        console.error('Error message:', errorMessage);
        // Als analyzer faalt, gebruik metadata waarden als fallback
        // Gooi alleen error als we ook geen metadata hebben
        if (!metadata) {
          throw analyzerError;
        }
        console.warn('⚠️ Gebruik metadata als fallback (geen BPM/key analyse)');
      }

      // VERWIJDER TEMP FILE NIET HIER - we hebben het nog nodig voor artwork extractie!
      // Het wordt verwijderd na de opslag (of in de finally block)

      // Combineer metadata en analyzer resultaten
      // Railway retourneert: bpm, bpm_confidence, key (key_full), key_confidence, song_name, duration, duration_formatted, bitrate, waveform
      const title = analyzerResult?.song_name || 
                   metadata?.common?.title || 
                   file.name.replace(/\.[^/.]+$/, '') || 
                   'Onbekend';
      
      // Prioriteit: gebruik metadata duur (originele duur), anders analyzer resultaat
      // Dit is belangrijk omdat bij grote bestanden alleen 2 minuten worden geanalyseerd,
      // maar we willen wel de volledige originele duur opslaan
      const metadataDuration = metadata?.format?.duration ? Math.round(metadata.format.duration) : null;
      const analyzerDuration = analyzerResult?.duration ? Math.round(analyzerResult.duration) : null;
      
      // Gebruik metadata duur als beschikbaar (meest betrouwbaar voor originele duur)
      // Alleen als metadata geen duur heeft, gebruik analyzer resultaat
      const duration = metadataDuration || analyzerDuration || 0;
      
      console.log(`   - Gebruikte duur: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
      
      const durationFormatted = metadataDuration 
        ? `${Math.floor(metadataDuration / 60)}:${(metadataDuration % 60).toString().padStart(2, '0')}`
        : (analyzerResult?.duration_formatted || 
           (duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '0:00'));
      
      const bpm = analyzerResult?.bpm || 
                 (metadata?.common?.bpm 
                   ? (Array.isArray(metadata.common.bpm) 
                       ? metadata.common.bpm[0] 
                       : (typeof metadata.common.bpm === 'number' ? metadata.common.bpm : null))
                   : null);
      
      // Railway retourneert 'key' als key_full (bijv. "C major")
      const key = analyzerResult?.key || 
                 (metadata?.common?.key 
                   ? (Array.isArray(metadata.common.key) 
                       ? metadata.common.key[0] 
                       : (typeof metadata.common.key === 'string' ? metadata.common.key : null))
                   : null);
      
      const finalBitrate = analyzerResult?.bitrate || 
                          (metadata?.format?.bitrate ? Math.round(metadata.format.bitrate / 1000) : null);

      // Combineer alle data voor response
      const analysisData = {
        title: title,
        duration: durationFormatted,
        durationSeconds: duration,
        bpm: bpm,
        key: key,
        confidence: {
          bpm: analyzerResult?.bpm_confidence || null,
          key: analyzerResult?.key_confidence || null,
        },
        metadata: {
          artist: metadata?.common?.artist || null,
          album: metadata?.common?.album || null,
          genre: metadata?.common?.genre ? (Array.isArray(metadata.common.genre) ? metadata.common.genre[0] : metadata.common.genre) : null,
          bitrate: finalBitrate,
          sampleRate: metadata?.format?.sampleRate || null,
        },
        waveform: analyzerResult?.waveform || null,
        artworkUrl: null as string | null, // Wordt later gevuld als opgeslagen
      };

      // Als saveToDatabase = true, sla alles op in Supabase
      let savedAnalysisId: string | null = null;
      if (saveToDatabase) {
        try {
          // Genereer unieke ID voor deze analyse
          const fileId = randomUUID();
          
          // 1. Extraheer artwork
          let artworkResult = null;
          try {
            const artwork = await extractArtwork(tempFilePath);
            if (artwork) {
              artworkResult = await uploadArtwork(userId, fileId, artwork.buffer, artwork.mimeType);
            }
          } catch (artworkError) {
            console.warn('⚠️ Kon artwork niet extraheren/uploaden:', artworkError);
            // Ga door zonder artwork
          }

          // 2. Upload audio bestand naar storage
          const audioResult = await uploadAudioFile(
            userId,
            fileId,
            buffer,
            file.name,
            file.type || 'audio/mpeg'
          );

          // 3. Sla analyse op in database
          console.log('💾 Opslaan in database...');
          console.log('   - User ID:', userId || 'null');
          console.log('   - Title:', title);
          console.log('   - File size:', buffer.length);
          console.log('   - Audio path:', audioResult.path);
          
          const { data: dbData, error: dbError } = await supabaseAdmin
            .from('music_analyses')
            .insert({
              user_id: userId,
              title: title,
              original_filename: file.name,
              file_size_bytes: buffer.length,
              mime_type: file.type || 'audio/mpeg',
              audio_file_url: audioResult.path,
              audio_file_public_url: audioResult.publicUrl,
              artwork_url: artworkResult?.path || null,
              artwork_public_url: artworkResult?.publicUrl || null,
              duration_seconds: Math.round(duration),
              duration_formatted: durationFormatted,
              bpm: bpm,
              bpm_confidence: analyzerResult?.bpm_confidence || null,
              key: key,
              key_confidence: analyzerResult?.key_confidence || null,
              artist: metadata?.common?.artist || null,
              album: metadata?.common?.album || null,
              genre: metadata?.common?.genre ? (Array.isArray(metadata.common.genre) ? metadata.common.genre[0] : metadata.common.genre) : null,
              bitrate: finalBitrate,
              sample_rate: metadata?.format?.sampleRate || null,
              waveform: analyzerResult?.waveform ? analyzerResult.waveform : null,
            })
            .select('id')
            .single();

          if (dbError) {
            console.error('❌ Fout bij opslaan in database:');
            console.error('   - Error code:', dbError.code);
            console.error('   - Error message:', dbError.message);
            console.error('   - Error details:', dbError.details);
            console.error('   - Error hint:', dbError.hint);
            // Als opslaan faalt, probeer uploads te verwijderen
            try {
              if (audioResult.path) {
                await supabaseAdmin.storage.from('audio-files').remove([audioResult.path]);
              }
              if (artworkResult?.path) {
                await supabaseAdmin.storage.from('album-artwork').remove([artworkResult.path]);
              }
            } catch (cleanupError) {
              console.error('Fout bij cleanup:', cleanupError);
            }
            throw new Error(`Database error: ${dbError.message}`);
          }

          savedAnalysisId = dbData.id;
          console.log('✅ Analyse opgeslagen in database met ID:', savedAnalysisId);
          
          // Haal artwork URL op uit database
          if (artworkResult?.publicUrl) {
            analysisData.artworkUrl = artworkResult.publicUrl;
          }

        } catch (saveError: unknown) {
          const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
          console.error('❌ Fout bij opslaan van analyse:', saveError);
          // Return analysis data maar zonder database ID
          return NextResponse.json({
            success: true,
            data: analysisData,
            warning: 'Analyse voltooid, maar opslaan in database is mislukt',
            error: errorMessage,
          }, { status: 200 });
        } finally {
          // Verwijder temp file na opslag (ook bij errors)
          await fs.unlink(tempFilePath).catch(() => {});
        }
      } else {
        // Verwijder temp file als we niet opslaan
        await fs.unlink(tempFilePath).catch(() => {});
      }
      
      return NextResponse.json({
        success: true,
        data: {
          ...analysisData,
          ...(savedAnalysisId && { id: savedAnalysisId }), // Voeg ID toe als opgeslagen
        },
        ...(saveToDatabase && savedAnalysisId && { saved: true, analysisId: savedAnalysisId }),
      });
    } catch (error) {
      // Verwijder het tijdelijke bestand bij fout
      if (tempFilePath) {
        await fs.unlink(tempFilePath).catch(() => {});
      }
      
      console.error('Fout bij het analyseren van audio:', error);
      return NextResponse.json(
        { error: 'Fout bij het analyseren van het audio bestand', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fout bij het verwerken van de upload:', error);
    return NextResponse.json(
      { error: 'Fout bij het verwerken van de upload', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

