import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/analyses
 * Haal alle analyses op voor de ingelogde gebruiker
 * 
 * Query parameters:
 * - bpm: Filter op BPM waarde
 * - key: Filter op key (bijv. "C major")
 * - genre: Filter op genre
 * - limit: Maximum aantal resultaten (default: 50)
 * - offset: Paginatie offset
 * - search: Zoek in title, artist, album
 */
export async function GET(request: NextRequest) {
  try {
    // Haal user ID op
    let userId: string;
    try {
      userId = await getUserId(request, true); // allowAnonymous voor development
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const bpm = searchParams.get('bpm');
    const key = searchParams.get('key');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Start query builder
    let query = supabaseAdmin
      .from('music_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filters toevoegen
    if (bpm) {
      query = query.eq('bpm', parseInt(bpm, 10));
    }

    if (key) {
      query = query.ilike('key', `%${key}%`);
    }

    if (genre) {
      query = query.ilike('genre', `%${genre}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%,album.ilike.%${search}%`);
    }

    // Voer query uit
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching analyses:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen van analyses', details: error.message },
        { status: 500 }
      );
    }

    // Haal totaal aantal op (voor paginatie)
    const { count: totalCount } = await supabaseAdmin
      .from('music_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (totalCount || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/analyses:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analyses
 * Verwijder meerdere analyses (bulk delete)
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Haal user ID op
    let userId: string;
    try {
      userId = await getUserId(request, true);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is vereist' },
        { status: 400 }
      );
    }

    // Verwijder analyses (RLS zorgt ervoor dat alleen eigen analyses verwijderd worden)
    const { data, error } = await supabaseAdmin
      .from('music_analyses')
      .delete()
      .in('id', ids)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error deleting analyses:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van analyses', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} analyse(s) verwijderd`,
      deleted: data?.length || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/analyses:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

