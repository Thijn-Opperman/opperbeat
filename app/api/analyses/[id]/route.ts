import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';
import { deleteAnalysisFiles } from '@/lib/storage-helpers';

/**
 * GET /api/analyses/[id]
 * Haal een specifieke analyse op
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Analyse ID is vereist' },
        { status: 400 }
      );
    }

    // Haal user ID op
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true);
    } catch (authError) {
      // Voor development: gebruik null
      userId = null;
    }

    // Haal analyse op (RLS zorgt ervoor dat alleen eigen analyses worden opgehaald)
    let query = supabaseAdmin
      .from('music_analyses')
      .select('*')
      .eq('id', id);
    
    // Als userId null is, gebruik een query die null user_id toestaat
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }
    
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Analyse niet gevonden' },
          { status: 404 }
        );
      }
      console.error('Error fetching analysis:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen van analyse', details: error.message },
        { status: 500 }
      );
    }

    // Genereer nieuwe signed URL voor audio (als oude is verlopen)
    let audioUrl = data.audio_file_public_url;
    if (data.audio_file_url && !audioUrl) {
      try {
        const { data: urlData } = await supabaseAdmin.storage
          .from('audio-files')
          .createSignedUrl(data.audio_file_url, 3600); // 1 uur
        
        if (urlData) {
          audioUrl = urlData.signedUrl;
          // Update database met nieuwe URL (optioneel)
          await supabaseAdmin
            .from('music_analyses')
            .update({ audio_file_public_url: audioUrl })
            .eq('id', id);
        }
      } catch (urlError) {
        console.warn('Could not generate signed URL:', urlError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        audio_file_public_url: audioUrl,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/analyses/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analyses/[id]
 * Verwijder een specifieke analyse en bijbehorende bestanden
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Analyse ID is vereist' },
        { status: 400 }
      );
    }

    // Haal user ID op
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true);
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authenticatie vereist' },
        { status: 401 }
      );
    }

    // Haal eerst analyse op om storage paths te krijgen
    let query = supabaseAdmin
      .from('music_analyses')
      .select('id, audio_file_url, artwork_url, original_filename')
      .eq('id', id);
    
    // Als userId null is, gebruik een query die null user_id toestaat
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }
    
    const { data: analysis, error: fetchError } = await query.single();

    if (fetchError || !analysis) {
      if (fetchError?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analyse niet gevonden' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Fout bij ophalen van analyse', details: fetchError?.message },
        { status: 500 }
      );
    }

    // Verwijder bestanden uit storage
    try {
      // Extract file ID uit path (format: userId/fileId/filename)
      const pathParts = analysis.audio_file_url?.split('/') || [];
      const fileId = pathParts[1]; // fileId is tweede deel

      if (fileId) {
        await deleteAnalysisFiles(
          userId,
          fileId,
          analysis.original_filename || undefined,
          !!analysis.artwork_url
        );
      }
    } catch (storageError) {
      console.error('Error deleting storage files:', storageError);
      // Ga door met database verwijderen zelfs als storage cleanup faalt
    }

    // Verwijder uit database
    let deleteQuery = supabaseAdmin
      .from('music_analyses')
      .delete()
      .eq('id', id);
    
    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    } else {
      deleteQuery = deleteQuery.is('user_id', null);
    }
    
    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error('Error deleting analysis:', deleteError);
      return NextResponse.json(
        { error: 'Fout bij verwijderen van analyse', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analyse en bijbehorende bestanden verwijderd',
    });
  } catch (error) {
    console.error('Error in DELETE /api/analyses/[id]:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

