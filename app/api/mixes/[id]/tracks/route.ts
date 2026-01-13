import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * POST /api/mixes/[id]/tracks
 * Voeg een track toe aan een mix
 * Body: { analysisId: string, transition_type?: string, transition_start_time?: number, notes?: string }
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
    const mixId = id;
    const body = await request.json();
    const { analysisId, transition_type, transition_start_time, notes } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is vereist' },
        { status: 400 }
      );
    }

    // Check of mix bestaat en van gebruiker is
    const { data: mix, error: mixError } = await supabaseAdmin
      .from('mixes')
      .select('id')
      .eq('id', mixId)
      .eq('user_id', userId)
      .single();

    if (mixError || !mix) {
      return NextResponse.json(
        { error: 'Mix niet gevonden' },
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
      .from('mix_tracks')
      .select('position')
      .eq('mix_id', mixId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingTracks && existingTracks.length > 0
      ? existingTracks[0].position + 1
      : 0;

    // Voeg track toe
    const { data, error } = await supabaseAdmin
      .from('mix_tracks')
      .insert({
        mix_id: mixId,
        analysis_id: analysisId,
        position: nextPosition,
        transition_type: transition_type || null,
        transition_start_time: transition_start_time || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Track staat al in deze mix' },
          { status: 400 }
        );
      }
      console.error('Error adding track to mix:', error);
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
    console.error('Error in POST /api/mixes/[id]/tracks:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mixes/[id]/tracks
 * Verwijder een track uit een mix
 * Query param: ?trackId=... of Body: { trackId: string }
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
    
    const searchParams = request.nextUrl.searchParams;
    const trackId = searchParams.get('trackId') || (await request.json().catch(() => ({}))).trackId;

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is vereist' },
        { status: 400 }
      );
    }

    // Check of mix van gebruiker is
    const { data: mix } = await supabaseAdmin
      .from('mixes')
      .select('id')
      .eq('id', mixId)
      .eq('user_id', userId)
      .single();

    if (!mix) {
      return NextResponse.json(
        { error: 'Mix niet gevonden' },
        { status: 404 }
      );
    }

    // Verwijder track (trackId kan analysis_id zijn of mix_tracks.id)
    const { error } = await supabaseAdmin
      .from('mix_tracks')
      .delete()
      .eq('mix_id', mixId)
      .or(`analysis_id.eq.${trackId},id.eq.${trackId}`);

    if (error) {
      console.error('Error removing track from mix:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van track', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Track verwijderd uit mix',
    });
  } catch (error) {
    console.error('Error in DELETE /api/mixes/[id]/tracks:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
