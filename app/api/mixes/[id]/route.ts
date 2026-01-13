import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/mixes/[id]
 * Haal een specifieke mix op met alle tracks
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
    const mixId = id;

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
            artwork_public_url
          )
        )
      `)
      .eq('id', mixId)
      .eq('user_id', userId)
      .single();

    if (error || !mix) {
      return NextResponse.json(
        { error: 'Mix niet gevonden' },
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
      transition_type?: string;
      transition_start_time?: number;
      notes?: string;
    }

    const sortedTracks: TrackInfo[] = (mix.mix_tracks || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((mt: any) => ({
        id: mt.analysis?.id,
        position: mt.position,
        title: mt.analysis?.title,
        artist: mt.analysis?.artist,
        album: mt.analysis?.album,
        genre: mt.analysis?.genre,
        duration: mt.analysis?.duration_formatted,
        durationSeconds: mt.analysis?.duration_seconds,
        bpm: mt.analysis?.bpm,
        key: mt.analysis?.key,
        artwork: mt.analysis?.artwork_public_url,
        transition_type: mt.transition_type,
        transition_start_time: mt.transition_start_time,
        notes: mt.notes,
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

    // Format event date
    let dateFormatted = '';
    if (mix.event_date) {
      const date = new Date(mix.event_date);
      dateFormatted = date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } else if (mix.created_at) {
      const date = new Date(mix.created_at);
      dateFormatted = date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: mix.id,
        name: mix.name,
        description: mix.description,
        venue: mix.venue,
        event_date: mix.event_date,
        date: dateFormatted,
        image_url: mix.image_url,
        image_public_url: mix.image_public_url,
        tracks: sortedTracks,
        trackCount: sortedTracks.length,
        duration: durationFormatted,
        durationSeconds: totalDuration,
        created_at: mix.created_at,
        updated_at: mix.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/mixes/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mixes/[id]
 * Update een mix
 * Body: { name?: string, description?: string, venue?: string, event_date?: string }
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
    const mixId = id;
    const body = await request.json();
    const { name, description, venue, event_date } = body;

    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Mix naam mag niet leeg zijn' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (venue !== undefined) {
      updateData.venue = venue?.trim() || null;
    }
    if (event_date !== undefined) {
      updateData.event_date = event_date || null;
    }

    const { data, error } = await supabaseAdmin
      .from('mixes')
      .update(updateData)
      .eq('id', mixId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Mix niet gevonden of update mislukt' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in PUT /api/mixes/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mixes/[id]
 * Verwijder een mix
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
    const mixId = id;

    const { error } = await supabaseAdmin
      .from('mixes')
      .delete()
      .eq('id', mixId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting mix:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van mix', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mix verwijderd',
    });
  } catch (error) {
    console.error('Error in DELETE /api/mixes/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
