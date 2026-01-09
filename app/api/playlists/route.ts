import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/playlists
 * Haal alle playlists op voor de ingelogde gebruiker
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = await getUserId(request, false); // Require authentication for playlists
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authenticatie vereist. Zorg dat je ingelogd bent.', details: authError instanceof Error ? authError.message : 'Authentication required' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist. Zorg dat je ingelogd bent.' },
        { status: 401 }
      );
    }

    console.log('Fetching playlists for user:', userId);

    const { data: playlists, error } = await supabaseAdmin
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
            duration_formatted,
            bpm,
            key,
            artwork_public_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check voor specifieke errors
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Playlists tabel bestaat nog niet. Voer playlists_setup.sql uit in Supabase.', details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Fout bij ophalen van playlists', details: error.message || error.hint || 'Onbekende fout' },
        { status: 500 }
      );
    }

    // Bereken statistieken voor elke playlist
    const playlistsWithStats = (playlists || []).map((playlist: any) => {
      const tracks = playlist.playlist_tracks || [];
      const totalDuration = tracks.reduce((sum: number, pt: any): number => {
        const duration = pt.analysis?.duration_seconds || 0;
        return sum + duration;
      }, 0);

      // Format duration
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const seconds = totalDuration % 60;
      let durationFormatted = '';
      if (hours > 0) {
        durationFormatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image_url: playlist.image_url,
        image_public_url: playlist.image_public_url,
        tracks: tracks.length,
        duration: durationFormatted,
        durationSeconds: totalDuration,
        created_at: playlist.created_at,
        updated_at: playlist.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: playlistsWithStats,
    });
  } catch (error) {
    console.error('Error in GET /api/playlists:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/playlists
 * Maak een nieuwe playlist aan
 * Body: { name: string, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = await getUserId(request, false); // Require authentication
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authenticatie vereist. Zorg dat je ingelogd bent.', details: authError instanceof Error ? authError.message : 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist. Zorg dat je ingelogd bent.' },
        { status: 401 }
      );
    }
    
    console.log('Creating playlist for user:', userId);
    
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Playlist naam is vereist' },
        { status: 400 }
      );
    }

    console.log('Creating playlist with:', { userId, name: name.trim(), description: description?.trim() || null });

    const { data, error } = await supabaseAdmin
      .from('playlists')
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Check voor specifieke errors
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Playlists tabel bestaat nog niet. Voer playlists_setup.sql uit in Supabase.', details: error.message },
          { status: 500 }
        );
      }
      
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            error: 'Foreign key constraint error. Voer fix_foreign_keys_simple.sql uit in Supabase.', 
            details: error.message,
            hint: 'De user_id bestaat niet in auth.users. Voer het fix script uit om dit op te lossen.'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Fout bij aanmaken van playlist', details: error.message || error.hint || 'Onbekende fout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        tracks: 0,
        duration: '0:00',
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/playlists:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

