import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parseFile } from 'music-metadata';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Maak een tijdelijk bestand aan
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}-${file.name}`);
    
    // Schrijf het bestand naar de tijdelijke locatie
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

    try {
      // Parse metadata met music-metadata
      const metadata = await parseFile(tempFilePath);

      // Haal de benodigde informatie op
      const title = metadata.common.title || file.name.replace(/\.[^/.]+$/, '') || 'Onbekend';
      const duration = metadata.format.duration ? Math.round(metadata.format.duration) : 0;
      
      // Formatteer duur als MM:SS
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Probeer eerst BPM en key uit metadata te halen
      let bpm: number | null = null;
      let key: string | null = null;

      if (metadata.common.bpm) {
        bpm = Array.isArray(metadata.common.bpm) 
          ? metadata.common.bpm[0] 
          : metadata.common.bpm;
      }

      if (metadata.common.key) {
        key = Array.isArray(metadata.common.key)
          ? metadata.common.key[0]
          : metadata.common.key;
      }

      // Stuur eerst een partial response met metadata (als streaming mogelijk was)
      // Voor nu gaan we door met de volledige analyse

      // Gebruik de standalone analyzer voor volledige analyse
      let analyzerResult: any = null;
      try {
        console.log('Start music analyzer standalone analyse...');
        const analyzerPath = path.join(process.cwd(), 'app', 'music_analyzer_standalone.py');
        
        // Importeer de analyzer module en roep aan
        const { stdout, stderr } = await execAsync(
          `python3 -c "import sys; sys.path.insert(0, '${path.join(process.cwd(), 'app')}'); from music_analyzer_standalone import analyze_audio_simple; import json; result = analyze_audio_simple('${tempFilePath}', include_waveform=True); print(json.dumps(result))"`
        );
        
        if (stderr && !stderr.includes('FutureWarning')) {
          console.warn('Python stderr:', stderr);
        }
        
        analyzerResult = JSON.parse(stdout);
        console.log('Analyzer resultaat:', analyzerResult);
        
        // Update BPM en key als ze niet in metadata zaten
        if (!bpm && analyzerResult.bpm) {
          bpm = analyzerResult.bpm;
        }
        
        if (!key && analyzerResult.key) {
          key = analyzerResult.key;
        }
        
        // Note: analyzerResult bevat al bpm_confidence en key_confidence
        // Deze worden gebruikt in de response
        
      } catch (analyzerError: any) {
        console.error('Fout bij analyzer:', analyzerError);
        // Als analyzer faalt, gebruik metadata waarden
      }

      // Verwijder het tijdelijke bestand
      await fs.unlink(tempFilePath).catch(() => {});

      // Gebruik analyzer resultaten waar beschikbaar
      // Analyzer retourneert bitrate al in kbps, metadata in bps
      const finalBitrate = analyzerResult?.bitrate || (metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) : null);
      const finalTitle = analyzerResult?.song_name || title;
      const finalDuration = analyzerResult?.duration_formatted || formattedDuration;
      const finalDurationSeconds = analyzerResult?.duration || duration;
      
      return NextResponse.json({
        success: true,
        data: {
          title: finalTitle,
          duration: finalDuration,
          durationSeconds: finalDurationSeconds,
          bpm: bpm || null,
          key: key || null,
          // Voeg confidence scores toe
          confidence: {
            bpm: analyzerResult?.bpm_confidence || null,
            key: analyzerResult?.key_confidence || null,
          },
          metadata: {
            artist: metadata.common.artist || null,
            album: metadata.common.album || null,
            genre: metadata.common.genre ? (Array.isArray(metadata.common.genre) ? metadata.common.genre[0] : metadata.common.genre) : null,
            bitrate: finalBitrate,
            sampleRate: metadata.format.sampleRate || null,
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
        { error: 'Fout bij het analyseren van het audio bestand' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Fout bij het verwerken van de upload:', error);
    return NextResponse.json(
      { error: 'Fout bij het verwerken van de upload' },
      { status: 500 }
    );
  }
}

