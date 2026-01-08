import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from 'music-metadata';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
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
      let metadata: any = null;
      try {
        metadata = await parseFile(tempFilePath);
      } catch (metaError) {
        console.warn('Metadata parsing gefaald, doorgaan met analyzer:', metaError);
      }

      // Roep externe Python analyzer API aan (Railway)
      let analyzerResult: any = null;
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
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              throw new Error('Analyse timeout: Het bestand is te groot of de analyse duurt te lang. Probeer een kleiner bestand of korter nummer.');
            }
            throw fetchError;
          }
        }
        
      } catch (analyzerError: any) {
        console.error('❌ Fout bij Python analyzer API:', analyzerError);
        console.error('Error message:', analyzerError.message);
        // Als analyzer faalt, gebruik metadata waarden als fallback
        // Gooi alleen error als we ook geen metadata hebben
        if (!metadata) {
          throw analyzerError;
        }
        console.warn('⚠️ Gebruik metadata als fallback (geen BPM/key analyse)');
      }

      // Verwijder het tijdelijke bestand
      await fs.unlink(tempFilePath).catch(() => {});

      // Combineer metadata en analyzer resultaten
      // Railway retourneert: bpm, bpm_confidence, key (key_full), key_confidence, song_name, duration, duration_formatted, bitrate, waveform
      const title = analyzerResult?.song_name || 
                   metadata?.common?.title || 
                   file.name.replace(/\.[^/.]+$/, '') || 
                   'Onbekend';
      
      const duration = analyzerResult?.duration || 
                      (metadata?.format?.duration ? Math.round(metadata.format.duration) : 0);
      
      const durationFormatted = analyzerResult?.duration_formatted || 
                               (duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '0:00');
      
      const bpm = analyzerResult?.bpm || 
                 (metadata?.common?.bpm ? (Array.isArray(metadata.common.bpm) ? metadata.common.bpm[0] : metadata.common.bpm) : null);
      
      // Railway retourneert 'key' als key_full (bijv. "C major")
      const key = analyzerResult?.key || 
                 (metadata?.common?.key ? (Array.isArray(metadata.common.key) ? metadata.common.key[0] : metadata.common.key) : null);
      
      const finalBitrate = analyzerResult?.bitrate || 
                          (metadata?.format?.bitrate ? Math.round(metadata.format.bitrate / 1000) : null);
      
      return NextResponse.json({
        success: true,
        data: {
          title: title,
          duration: durationFormatted,
          durationSeconds: duration,
          bpm: bpm,
          key: key,
          // Voeg confidence scores toe
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
          // Voeg waveform toe als beschikbaar
          ...(analyzerResult?.waveform && { waveform: analyzerResult.waveform }),
        },
      });
    } catch (error) {
      // Verwijder het tijdelijke bestand bij fout
      await fs.unlink(tempFilePath).catch(() => {});
      
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

