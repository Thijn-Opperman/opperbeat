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

      // Als BPM of key niet in metadata zit, gebruik librosa voor analyse
      if (!bpm || !key) {
        console.log('BPM of key niet in metadata, start librosa analyse...');
        try {
          // Roep Python script aan met librosa
          const scriptPath = path.join(process.cwd(), 'scripts', 'analyze_audio.py');
          console.log(`Aanroepen Python script: ${scriptPath}`);
          
          const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${tempFilePath}"`);
          
          if (stderr) {
            console.error('Python stderr:', stderr);
          }
          
          const librosaResult = JSON.parse(stdout);
          console.log('Librosa resultaat:', librosaResult);
          
          if (librosaResult.success) {
            if (!bpm && librosaResult.bpm) {
              bpm = librosaResult.bpm;
              console.log(`BPM gedetecteerd met librosa: ${bpm}`);
            }
            
            if (!key && librosaResult.key) {
              key = librosaResult.key;
              console.log(`Key gedetecteerd met librosa: ${key}`);
            }
          } else {
            console.error('Librosa analyse gefaald:', librosaResult.error);
          }
        } catch (librosaError: any) {
          console.error('Fout bij librosa analyse:', librosaError);
          // Als Python/librosa niet beschikbaar is, val terug op oude methode
          if (librosaError.message?.includes('python3') || librosaError.message?.includes('No such file')) {
            console.log('Python/librosa niet beschikbaar, probeer alternatieve methode...');
            // BPM en key blijven null als analyse faalt
          }
        }
      } else {
        console.log('BPM en key al in metadata gevonden');
      }

      // Verwijder het tijdelijke bestand
      await fs.unlink(tempFilePath).catch(() => {});

      return NextResponse.json({
        success: true,
        data: {
          title,
          duration: formattedDuration,
          durationSeconds: duration,
          bpm: bpm || null,
          key: key || null,
          metadata: {
            artist: metadata.common.artist || null,
            album: metadata.common.album || null,
            genre: metadata.common.genre ? (Array.isArray(metadata.common.genre) ? metadata.common.genre[0] : metadata.common.genre) : null,
            bitrate: metadata.format.bitrate || null,
            sampleRate: metadata.format.sampleRate || null,
          },
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

