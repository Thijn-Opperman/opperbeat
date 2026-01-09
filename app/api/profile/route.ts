import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/profile
 * Haal profiel op van de ingelogde gebruiker
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    // Haal profiel op
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen van profiel', details: error.message },
        { status: 500 }
      );
    }

    // Als profiel niet bestaat, maak een basis profiel aan
    if (!profile && userId) {
      // Probeer user email op te halen uit auth.users, anders gebruik placeholder
      let userEmail = '';
      let userName = 'User';
      
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          userEmail = authUser.user.email;
          userName = userEmail.split('@')[0] || 'User';
        }
      } catch (authError) {
        // Als we geen auth user kunnen ophalen, gebruik placeholder
        console.warn('Could not fetch auth user, using placeholder:', authError);
      }
      
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          name: userName,
          email: userEmail || `user-${userId.substring(0, 8)}@example.com`,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Fout bij aanmaken van profiel', details: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: newProfile,
      });
    }
    
    // Als userId null is, return error
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update profiel van de ingelogde gebruiker
 * Body: { name?: string, email?: string, bio?: string, ... }
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request, false);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }
    
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.bio !== undefined) updateData.bio = body.bio;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Fout bij bijwerken van profiel', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

