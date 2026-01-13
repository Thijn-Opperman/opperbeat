import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helpers';
import { parseFile } from 'music-metadata';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { extractArtwork } from '@/lib/extract-artwork';
import { uploadAudioFile, uploadArtwork } from '@/lib/storage-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { MusicMetadata, AnalyzerResult, WaveformData } from '@/lib/types';

interface BatchAnalysisResult {
  success: boolean;
  data?: {
    title: string;
    duration: string;
    durationSeconds: number;
    bpm: number | null;
    key: string | null;
    confidence: {
      bpm: number | null;
      key: number | null;
    };
    metadata: {
      artist: string | null;
      album: string | null;
      genre: string | null;
      bitrate: number | null;
      sampleRate: number | null;
    };
    waveform: WaveformData | null;
  };
  analysisId?: string | null;
  error?: string;
}

async function analyzeSingleFile(file: File, saveToDatabase: boolean, userId: string | null): Promise<BatchAnalysisResult> {
  // Maak een tijdelijk bestand aan voor metadata parsing
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `audio-${Date.now()}-${randomUUID()}-${file.name}`);
  
  // Schrijf het bestand naar de tijdelijke locatie
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(tempFilePath, buffer);

  try {
    // Parse metadata met music-metadata
    let metadata: MusicMetadata | null = null;
    try {
      metadata = await parseFile(tempFilePath);
    } catch (metaError) {
      console.warn('Metadata parsing gefaald:', metaError);
    }

    // Roep externe Python analyzer API aan (Railway)
    let analyzerResult: AnalyzerResult | null = null;
    try {
      const apiUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
      
      if (apiUrl) {
        // Gebruik FormData (beschikbaar in Node.js 18+ en Next.js)
        const uploadFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type || 'audio/mpeg' });
        uploadFormData.append('file', blob, file.name);
        uploadFormData.append('include_waveform', String(true));
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: uploadFormData,
        });

        if (response.ok) {
          analyzerResult = await response.json();
        } else {
          console.warn('Railway API error:', response.status);
        }
      }
    } catch (analyzerError) {
      console.warn('Analyzer error:', analyzerError);
    }

    // Combineer metadata en analyzer resultaten
    const title = analyzerResult?.song_name || 
                 metadata?.common?.title || 
                 file.name.replace(/\.[^/.]+$/, '') || 
                 'Onbekend';
    
    // Prioriteit: gebruik metadata duur (originele duur), anders analyzer resultaat
    // Dit is belangrijk omdat bij grote bestanden alleen 2 minuten worden geanalyseerd,
    // maar we willen wel de volledige originele duur opslaan
    const metadataDuration = metadata?.format?.duration ? Math.round(metadata.format.duration) : null;
    const analyzerDuration = analyzerResult?.duration ? Math.round(analyzerResult.duration) : null;
    
    // Debug logging om te zien welke duur wordt gebruikt
    console.log(`📊 Duur voor ${file.name}:`);
    console.log(`   - Metadata duur: ${metadataDuration ? `${Math.floor(metadataDuration / 60)}:${(metadataDuration % 60).toString().padStart(2, '0')}` : 'niet beschikbaar'}`);
    console.log(`   - Analyzer duur: ${analyzerDuration ? `${Math.floor(analyzerDuration / 60)}:${(analyzerDuration % 60).toString().padStart(2, '0')}` : 'niet beschikbaar'}`);
    
    // Gebruik metadata duur als beschikbaar (meest betrouwbaar voor originele duur)
    // Alleen als metadata geen duur heeft, gebruik analyzer resultaat
    const duration = metadataDuration || analyzerDuration || 0;
    
    console.log(`   - Gebruikte duur: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
    
    const durationFormatted = metadataDuration 
      ? `${Math.floor(metadataDuration / 60)}:${(metadataDuration % 60).toString().padStart(2, '0')}`
      : (analyzerResult?.duration_formatted || 
         (duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '0:00'));
    
    const bpm = analyzerResult?.bpm || 
               (metadata?.common?.bpm ? (Array.isArray(metadata.common.bpm) ? metadata.common.bpm[0] : metadata.common.bpm) : null);
    
    const key = analyzerResult?.key || 
               (metadata?.common?.key ? (Array.isArray(metadata.common.key) ? metadata.common.key[0] : metadata.common.key) : null);
    
    const finalBitrate = analyzerResult?.bitrate || 
                        (metadata?.format?.bitrate ? Math.round(metadata.format.bitrate / 1000) : null);

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
    };

    // Als saveToDatabase = true, sla alles op in Supabase
    let savedAnalysisId: string | null = null;
    if (saveToDatabase) {
      try {
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
          console.error('❌ Fout bij opslaan in database:', dbError);
          // Probeer uploads te verwijderen
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
      } catch (saveError: unknown) {
        console.error('❌ Fout bij opslaan van analyse:', saveError);
        throw saveError;
      }
    }

    return {
      success: true,
      data: {
        ...analysisData,
        ...(savedAnalysisId && { id: savedAnalysisId }),
      },
      analysisId: savedAnalysisId,
    };
  } finally {
    // Verwijder temp file
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const saveParam = formData.get('save');
    const saveToDatabase = saveParam === 'true';

    console.log('📥 Batch analyse request ontvangen:');
    console.log('   - Aantal bestanden:', files.length);
    console.log('   - Save parameter:', saveParam, '(saveToDatabase:', saveToDatabase, ')');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Geen bestanden geüpload' },
        { status: 400 }
      );
    }

    // Haal user ID op
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true);
      console.log('📝 User ID:', userId || 'null (anonymous)');
    } catch (authError) {
      console.warn('⚠️ Auth error (using null):', authError);
      userId = null;
    }

    // Valideer bestanden
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/x-m4a'];
    const validatedFiles: File[] = [];
    
    for (const file of files) {
      const fileType = file.type || '';
      const fileName = file.name.toLowerCase();
      const isValidType = validTypes.includes(fileType) || 
        fileName.endsWith('.mp3') || 
        fileName.endsWith('.wav') || 
        fileName.endsWith('.flac') || 
        fileName.endsWith('.m4a');
      
      if (isValidType) {
        validatedFiles.push(file);
      } else {
        console.warn(`⚠️ Bestand overgeslagen (ongeldig type): ${file.name}`);
      }
    }

    if (validatedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Geen geldige audio bestanden gevonden' },
        { status: 400 }
      );
    }

    // Maak een streaming response aan zodat elk voltooid nummer direct teruggestuurd wordt
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Stuur initial metadata
        const initialData = {
          type: 'start',
          totalFiles: validatedFiles.length,
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        let successful = 0;
        let failed = 0;

        // Analyseer elk bestand sequentieel
        for (let i = 0; i < validatedFiles.length; i++) {
          const file = validatedFiles[i];
          console.log(`\n🔄 Analyseren bestand ${i + 1}/${validatedFiles.length}: ${file.name}`);
          
          // Stuur progress update
          const progressData = {
            type: 'progress',
            current: i + 1,
            total: validatedFiles.length,
            filename: file.name,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));
          
          try {
            const analyzeResult = await analyzeSingleFile(file, saveToDatabase, userId);
            
            if (analyzeResult.success && analyzeResult.data) {
              successful++;
              const resultData = {
                type: 'result',
                filename: file.name,
                success: true,
                data: analyzeResult.data,
                analysisId: analyzeResult.analysisId || null,
                current: i + 1,
                total: validatedFiles.length,
                timestamp: new Date().toISOString(),
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(resultData)}\n\n`));
              console.log(`✅ Bestand ${i + 1} succesvol geanalyseerd: ${file.name}`);
            } else {
              throw new Error('Onbekende fout');
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
            failed++;
            console.error(`❌ Fout bij analyseren ${file.name}:`, error);
            const errorData = {
              type: 'result',
              filename: file.name,
              success: false,
              error: errorMessage,
              current: i + 1,
              total: validatedFiles.length,
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          }
        }

        // Stuur completion event
        const completionData = {
          type: 'complete',
          totalFiles: validatedFiles.length,
          successful: successful,
          failed: failed,
          timestamp: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
        
        console.log(`\n📊 Batch analyse voltooid:`);
        console.log(`   - Succesvol: ${successful}`);
        console.log(`   - Gefaald: ${failed}`);
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Fout bij batch analyse:', error);
    return NextResponse.json(
      { 
        error: 'Fout bij het verwerken van de batch analyse', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

