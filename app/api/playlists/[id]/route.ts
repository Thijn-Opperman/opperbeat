import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/playlists/[id]
 * Haal een specifieke playlist op met alle tracks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const playlistId = id;

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
            artwork_public_url
          )
        )
      `)
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (error || !playlist) {
      return NextResponse.json(
        { error: 'Playlist niet gevonden' },
        { status: 404 }
      );
    }

    // Sorteer tracks op position
    interface TrackInfo {
      id?: string;
      position: number;
      title?: string;
      artist?: string;
      album?: string;
      genre?: string;
      duration?: string;
      durationSeconds?: number;
      bpm?: number;
      key?: string;
      artwork?: string;
    }

    const sortedTracks: TrackInfo[] = (playlist.playlist_tracks || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((pt: any) => ({
        id: pt.analysis?.id,
        position: pt.position,
        title: pt.analysis?.title,
        artist: pt.analysis?.artist,
        album: pt.analysis?.album,
        genre: pt.analysis?.genre,
        duration: pt.analysis?.duration_formatted,
        durationSeconds: pt.analysis?.duration_seconds,
        bpm: pt.analysis?.bpm,
        key: pt.analysis?.key,
        artwork: pt.analysis?.artwork_public_url,
      }));

    // Bereken totale duur
    const totalDuration = sortedTracks.reduce((sum: number, track: TrackInfo) => sum + (track.durationSeconds || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;
    let durationFormatted = '';
    if (hours > 0) {
      durationFormatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image_url: playlist.image_url,
        image_public_url: playlist.image_public_url,
        tracks: sortedTracks,
        trackCount: sortedTracks.length,
        duration: durationFormatted,
        durationSeconds: totalDuration,
        created_at: playlist.created_at,
        updated_at: playlist.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/playlists/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/playlists/[id]
 * Update een playlist
 * Body: { name?: string, description?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const playlistId = id;
    const body = await request.json();
    const { name, description } = body;

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Playlist naam mag niet leeg zijn' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const { data, error } = await supabaseAdmin
      .from('playlists')
      .update(updateData)
      .eq('id', playlistId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Playlist niet gevonden of update mislukt' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in PUT /api/playlists/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/playlists/[id]
 * Verwijder een playlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const playlistId = id;

    const { error } = await supabaseAdmin
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting playlist:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van playlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Playlist verwijderd',
    });
  } catch (error) {
    console.error('Error in DELETE /api/playlists/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

