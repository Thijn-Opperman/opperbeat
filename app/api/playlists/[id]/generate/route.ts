import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * POST /api/playlists/[id]/generate
 * Genereer een playlist op basis van criteria
 * Query params: bpmMin, bpmMax, key, genre, limit
 */
export async function POST(
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

    // Check of playlist bestaat en van gebruiker is
    const { data: playlist, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json(
        { error: 'Playlist niet gevonden' },
        { status: 404 }
      );
    }

    // Haal query parameters op
    const searchParams = request.nextUrl.searchParams;
    const bpmMin = searchParams.get('bpmMin');
    const bpmMax = searchParams.get('bpmMax');
    const key = searchParams.get('key');
    const genre = searchParams.get('genre');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Start query builder voor analyses
    let query = supabaseAdmin
      .from('music_analyses')
      .select('id')
      .eq('user_id', userId);

    // BPM filter (alleen als er criteria zijn)
    if (bpmMin || bpmMax) {
      if (bpmMin && bpmMax) {
        const min = parseInt(bpmMin, 10);
        const max = parseInt(bpmMax, 10);
        if (!isNaN(min) && !isNaN(max)) {
          query = query.gte('bpm', min).lte('bpm', max);
        }
      } else if (bpmMin) {
        const min = parseInt(bpmMin, 10);
        if (!isNaN(min)) {
          query = query.gte('bpm', min);
        }
      } else if (bpmMax) {
        const max = parseInt(bpmMax, 10);
        if (!isNaN(max)) {
          query = query.lte('bpm', max);
        }
      }
    }

    // Key filter
    if (key) {
      query = query.ilike('key', `%${key}%`);
    }

    // Genre filter
    if (genre) {
      query = query.ilike('genre', `%${genre}%`);
    }

    // Haal alleen analyses op die nog niet in de playlist zitten
    const { data: existingTracks } = await supabaseAdmin
      .from('playlist_tracks')
      .select('analysis_id')
      .eq('playlist_id', playlistId);

    const existingAnalysisIds = new Set(
      (existingTracks || []).map((pt: any) => pt.analysis_id)
    );

    // Voer query uit (haal meer op om te filteren op duplicaten)
    const { data: analyses, error: analysesError } = await query
      .order('created_at', { ascending: false })
      .limit(Math.max(limit * 3, 100)); // Haal meer op om te filteren

    if (analysesError) {
      console.error('Error fetching analyses:', analysesError);
      return NextResponse.json(
        { error: 'Fout bij ophalen van tracks', details: analysesError.message },
        { status: 500 }
      );
    }

    // Filter tracks die al in playlist zitten
    const newAnalyses = (analyses || [])
      .filter((a: any) => !existingAnalysisIds.has(a.id))
      .slice(0, limit);

    if (newAnalyses.length === 0) {
      return NextResponse.json(
        { error: 'Geen tracks gevonden die voldoen aan de criteria', warning: true },
        { status: 200 }
      );
    }

    // Haal huidige hoogste position op
    const { data: existingTracksWithPosition } = await supabaseAdmin
      .from('playlist_tracks')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    let nextPosition = 0;
    if (existingTracksWithPosition && existingTracksWithPosition.length > 0) {
      nextPosition = existingTracksWithPosition[0].position + 1;
    }

    // Voeg tracks toe aan playlist
    const tracksToInsert = newAnalyses.map((analysis: any, index: number) => ({
      playlist_id: playlistId,
      analysis_id: analysis.id,
      position: nextPosition + index,
    }));

    const { data: insertedTracks, error: insertError } = await supabaseAdmin
      .from('playlist_tracks')
      .insert(tracksToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting tracks:', insertError);
      return NextResponse.json(
        { error: 'Fout bij toevoegen van tracks', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        added: insertedTracks?.length || 0,
        tracks: insertedTracks,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/playlists/[id]/generate:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
