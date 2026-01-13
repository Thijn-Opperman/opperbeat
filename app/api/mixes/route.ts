import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/mixes
 * Haal alle mixes op voor de ingelogde gebruiker
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = await getUserId(request, false);
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

    console.log('Fetching mixes for user:', userId);

    const { data: mixes, error } = await supabaseAdmin
      .from('mixes')
      .select(`
        *,
        mix_tracks (
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
      console.error('Error fetching mixes:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Mixes tabel bestaat nog niet. Voer mixes_setup.sql uit in Supabase.', details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Fout bij ophalen van mixes', details: error.message || error.hint || 'Onbekende fout' },
        { status: 500 }
      );
    }

    // Bereken statistieken voor elke mix
    const mixesWithStats = (mixes || []).map((mix: any) => {
      const tracks = mix.mix_tracks || [];
      const totalDuration = tracks.reduce((sum: number, mt: any): number => {
        const duration = mt.analysis?.duration_seconds || 0;
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

      return {
        id: mix.id,
        name: mix.name,
        description: mix.description,
        venue: mix.venue,
        event_date: mix.event_date,
        date: dateFormatted,
        image_url: mix.image_url,
        image_public_url: mix.image_public_url,
        tracks: tracks.length,
        duration: durationFormatted,
        durationSeconds: totalDuration,
        created_at: mix.created_at,
        updated_at: mix.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: mixesWithStats,
    });
  } catch (error) {
    console.error('Error in GET /api/mixes:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mixes
 * Maak een nieuwe mix aan
 * Body: { name: string, description?: string, venue?: string, event_date?: string }
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      userId = await getUserId(request, false);
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
    
    console.log('Creating mix for user:', userId);
    
    const body = await request.json();
    const { name, description, venue, event_date } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Mix naam is vereist' },
        { status: 400 }
      );
    }

    console.log('Creating mix with:', { userId, name: name.trim(), description: description?.trim() || null, venue: venue?.trim() || null, event_date: event_date || null });

    const { data, error } = await supabaseAdmin
      .from('mixes')
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        venue: venue?.trim() || null,
        event_date: event_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mix:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Mixes tabel bestaat nog niet. Voer mixes_setup.sql uit in Supabase.', details: error.message },
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
        { error: 'Fout bij aanmaken van mix', details: error.message || error.hint || 'Onbekende fout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        venue: data.venue,
        event_date: data.event_date,
        tracks: 0,
        duration: '0:00',
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/mixes:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
