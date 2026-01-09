import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * POST /api/playlists/[id]/tracks
 * Voeg een track toe aan een playlist
 * Body: { analysisId: string }
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
    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is vereist' },
        { status: 400 }
      );
    }

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

    // Check of analysis bestaat en van gebruiker is
    const { data: analysis, error: analysisError } = await supabaseAdmin
      .from('music_analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Track niet gevonden' },
        { status: 404 }
      );
    }

    // Haal huidige hoogste position op
    const { data: existingTracks } = await supabaseAdmin
      .from('playlist_tracks')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingTracks && existingTracks.length > 0
      ? existingTracks[0].position + 1
      : 0;

    // Voeg track toe
    const { data, error } = await supabaseAdmin
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        analysis_id: analysisId,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      // Check of het een duplicate is
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Track staat al in deze playlist' },
          { status: 400 }
        );
      }
      console.error('Error adding track to playlist:', error);
      return NextResponse.json(
        { error: 'Fout bij toevoegen van track', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in POST /api/playlists/[id]/tracks:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/playlists/[id]/tracks
 * Verwijder een track uit een playlist
 * Body: { trackId: string } of query param ?trackId=...
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
    
    // Haal trackId op uit body of query params
    const searchParams = request.nextUrl.searchParams;
    const trackId = searchParams.get('trackId') || (await request.json().catch(() => ({}))).trackId;

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is vereist' },
        { status: 400 }
      );
    }

    // Check of playlist van gebruiker is
    const { data: playlist } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist niet gevonden' },
        { status: 404 }
      );
    }

    // Verwijder track (trackId kan analysis_id zijn of playlist_tracks.id)
    const { error } = await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .or(`analysis_id.eq.${trackId},id.eq.${trackId}`);

    if (error) {
      console.error('Error removing track from playlist:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van track', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Track verwijderd uit playlist',
    });
  } catch (error) {
    console.error('Error in DELETE /api/playlists/[id]/tracks:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

