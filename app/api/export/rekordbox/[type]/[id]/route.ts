import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/export/rekordbox/[type]/[id]
 * Export een mix of playlist naar Rekordbox XML formaat
 * 
 * type: 'mix' | 'playlist'
 * id: UUID van de mix of playlist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }
    
    const { type, id } = await params;

    if (type !== 'mix' && type !== 'playlist') {
      return NextResponse.json(
        { error: 'Ongeldig type. Gebruik "mix" of "playlist"' },
        { status: 400 }
      );
    }

    // Haal mix of playlist data op
    let collectionData: any;
    let collectionName: string;
    let tracks: any[];

    if (type === 'mix') {
      const { data: mix, error } = await supabaseAdmin
        .from('mixes')
        .select(`
          *,
          mix_tracks (
            id,
            position,
            transition_type,
            transition_start_time,
            notes,
            analysis:music_analyses (
              id,
              title,
              artist,
              album,
              genre,
              duration_formatted,
              duration_seconds,
              bpm,
              key,
              audio_file_public_url,
              audio_file_url,
              artwork_public_url
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !mix) {
        return NextResponse.json(
          { error: 'Mix niet gevonden' },
          { status: 404 }
        );
      }

      collectionName = mix.name;
      tracks = (mix.mix_tracks || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((mt: any) => ({
          ...mt.analysis,
          position: mt.position,
          transition_type: mt.transition_type,
          transition_start_time: mt.transition_start_time,
          notes: mt.notes,
        }));
    } else {
      const { data: playlist, error } = await supabaseAdmin
        .from('playlists')
        .select(`
          *,
          playlist_tracks (
            id,
            position,
            analysis:music_analyses (
              id,
              title,
              artist,
              album,
              genre,
              duration_formatted,
              duration_seconds,
              bpm,
              key,
              audio_file_public_url,
              audio_file_url,
              artwork_public_url
            )
          )
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !playlist) {
        return NextResponse.json(
          { error: 'Playlist niet gevonden' },
          { status: 404 }
        );
      }

      collectionName = playlist.name;
      tracks = (playlist.playlist_tracks || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((pt: any) => pt.analysis);
    }

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: `${type === 'mix' ? 'Mix' : 'Playlist'} bevat geen tracks` },
        { status: 400 }
      );
    }

    // Genereer Rekordbox XML
    const xml = generateRekordboxXML(collectionName, tracks);

    // Return XML bestand
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(collectionName)}_rekordbox.xml"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/export/rekordbox/[type]/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Genereert Rekordbox XML formaat
 */
function generateRekordboxXML(playlistName: string, tracks: any[]): string {
  const now = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<DJ_PLAYLISTS Version="1.0.0">
  <PRODUCT Name="opperbeat" Version="1.0.0"/>
  <COLLECTION Entries="${tracks.length}">
`;

  // Voeg tracks toe aan collection
  tracks.forEach((track, index) => {
    const trackId = track.id || `track-${index}`;
    const title = escapeXML(track.title || 'Unknown Title');
    const artist = escapeXML(track.artist || 'Unknown Artist');
    const album = escapeXML(track.album || '');
    const genre = escapeXML(track.genre || '');
    const bpm = track.bpm ? Math.round(track.bpm) : 0;
    const key = escapeXML(track.key || '');
    
    // Duration in milliseconden (Rekordbox gebruikt TotalTime in ms)
    const durationMs = track.duration_seconds ? Math.round(track.duration_seconds * 1000) : 0;
    
    // Location - gebruik public URL of plaatshouder
    // Rekordbox verwacht een bestandspad, maar we hebben alleen URLs
    // We gebruiken de public URL of een placeholder
    const location = track.audio_file_public_url 
      ? escapeXML(track.audio_file_public_url)
      : 'file://localhost/' + escapeXML(title + ' - ' + artist + '.mp3');

    xml += `    <TRACK TrackID="${trackId}" Name="${title}" Artist="${artist}" Composer="" Album="${album}" Grouping="" Genre="${genre}" Kind="MP3 File" Size="0" TotalTime="${durationMs}" DiscNumber="0" TrackNumber="0" Year="0" AverageBpm="${bpm}" DateAdded="${now}" BitRate="320" SampleRate="44100" Comments="" PlayCount="0" Rating="0" Location="${location}" Remixer="" Tonality="${key}" Label="" Mix=""></TRACK>
`;
  });

  xml += `  </COLLECTION>
  <PLAYLISTS>
    <NODE Type="0" Name="ROOT" Count="1">
      <NODE Type="1" Name="${escapeXML(playlistName)}" Count="${tracks.length}">
`;

  // Voeg tracks toe aan playlist
  tracks.forEach((track, index) => {
    const trackId = track.id || `track-${index}`;
    xml += `        <TRACK Key="${trackId}"></TRACK>
`;
  });

  xml += `      </NODE>
    </NODE>
  </PLAYLISTS>
</DJ_PLAYLISTS>`;

  return xml;
}

/**
 * Escaped XML special characters
 */
function escapeXML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sanitize filename voor download
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
}
