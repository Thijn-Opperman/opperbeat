import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { extractArtwork } from '@/lib/extract-artwork';
import { uploadAudioFile, uploadArtwork } from '@/lib/storage-helpers';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * POST /api/analyze/save
 * Sla analyse resultaat op in Supabase (voor grote bestanden die via Railway zijn geanalyseerd)
 * 
 * Body:
 * - file: File (audio bestand)
 * - analysisData: JSON string met analysis resultaat van Railway
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const analysisDataJson = formData.get('analysisData') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    if (!analysisDataJson) {
      return NextResponse.json(
        { error: 'Geen analyse data geüpload' },
        { status: 400 }
      );
    }

    // Parse analysis data
    let analysisData: any;
    try {
      analysisData = JSON.parse(analysisDataJson);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Ongeldige analyse data' },
        { status: 400 }
      );
    }

    // Haal user ID op
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true);
    } catch (authError) {
      // Voor development: gebruik null
      userId = null;
    }

    // Maak tijdelijk bestand aan voor artwork extractie
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}-${file.name}`);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

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
      const title = analysisData.title || 
                   analysisData.song_name || 
                   file.name.replace(/\.[^/.]+$/, '') || 
                   'Onbekend';

      const duration = analysisData.durationSeconds || 
                      analysisData.duration || 
                      0;

      const durationFormatted = analysisData.duration || 
                               analysisData.duration_formatted ||
                               (duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '0:00');

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
          bpm: analysisData.bpm || null,
          bpm_confidence: analysisData.confidence?.bpm || null,
          key: analysisData.key || null,
          key_confidence: analysisData.confidence?.key || null,
          artist: analysisData.metadata?.artist || null,
          album: analysisData.metadata?.album || null,
          genre: analysisData.metadata?.genre || null,
          bitrate: analysisData.metadata?.bitrate || null,
          sample_rate: analysisData.metadata?.sampleRate || null,
          waveform: analysisData.waveform || null,
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('❌ Fout bij opslaan in database:', dbError);
        
        // Cleanup: verwijder uploads
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

        return NextResponse.json(
          { error: 'Fout bij opslaan in database', details: dbError.message },
          { status: 500 }
        );
      }

      console.log('✅ Analyse opgeslagen in database met ID:', dbData.id);

      return NextResponse.json({
        success: true,
        saved: true,
        analysisId: dbData.id,
        message: 'Analyse succesvol opgeslagen',
      });

    } finally {
      // Verwijder temp file
      await fs.unlink(tempFilePath).catch(() => {});
    }

  } catch (error) {
    console.error('Error in save route:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

