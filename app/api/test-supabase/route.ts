import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/test-supabase
 * Test Supabase connection and configuration
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
  };

  // Check 1: Environment Variables
  results.checks.environment = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    results.errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    results.errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    results.warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing (needed for server-side operations)');
  }

  // Check 2: Database Connection
  try {
    const { data, error, count } = await supabaseAdmin
      .from('music_analyses')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        results.checks.database = {
          connected: true,
          tableExists: false,
          error: 'Table "music_analyses" does not exist. Run supabase_setup.sql in Supabase SQL Editor.',
        };
        results.warnings.push('Database table "music_analyses" does not exist');
      } else {
        results.checks.database = {
          connected: false,
          error: error.message,
          code: error.code,
        };
        results.errors.push(`Database error: ${error.message}`);
      }
    } else {
      results.checks.database = {
        connected: true,
        tableExists: true,
        recordCount: count || 0,
      };
    }
  } catch (err: any) {
    results.checks.database = {
      connected: false,
      error: err.message,
    };
    results.errors.push(`Database connection failed: ${err.message}`);
  }

  // Check 3: Storage Buckets
  results.checks.storage = {};

  // Check audio-files bucket
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('audio-files')
      .list('', { limit: 1 });

    if (error) {
      if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
        results.checks.storage.audioFiles = {
          exists: false,
          error: 'Bucket "audio-files" does not exist. Create it in Supabase Dashboard → Storage.',
        };
        results.warnings.push('Storage bucket "audio-files" does not exist');
      } else {
        results.checks.storage.audioFiles = {
          exists: false,
          error: error.message,
        };
        results.errors.push(`Audio-files bucket error: ${error.message}`);
      }
    } else {
      results.checks.storage.audioFiles = {
        exists: true,
        accessible: true,
      };
    }
  } catch (err: any) {
    results.checks.storage.audioFiles = {
      exists: false,
      error: err.message,
    };
    results.errors.push(`Audio-files bucket test failed: ${err.message}`);
  }

  // Check album-artwork bucket
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('album-artwork')
      .list('', { limit: 1 });

    if (error) {
      if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
        results.checks.storage.albumArtwork = {
          exists: false,
          error: 'Bucket "album-artwork" does not exist. Create it in Supabase Dashboard → Storage.',
        };
        results.warnings.push('Storage bucket "album-artwork" does not exist');
      } else {
        results.checks.storage.albumArtwork = {
          exists: false,
          error: error.message,
        };
        results.errors.push(`Album-artwork bucket error: ${error.message}`);
      }
    } else {
      results.checks.storage.albumArtwork = {
        exists: true,
        accessible: true,
      };
    }
  } catch (err: any) {
    results.checks.storage.albumArtwork = {
      exists: false,
      error: err.message,
    };
    results.errors.push(`Album-artwork bucket test failed: ${err.message}`);
  }

  // Check 4: Test Query (if table exists)
  if (results.checks.database?.tableExists) {
    try {
      const { data, error } = await supabaseAdmin
        .from('music_analyses')
        .select('id, title, created_at')
        .limit(5)
        .order('created_at', { ascending: false });

      if (error) {
        results.checks.sampleQuery = {
          success: false,
          error: error.message,
        };
      } else {
        results.checks.sampleQuery = {
          success: true,
          sampleCount: data?.length || 0,
          samples: data || [],
        };
      }
    } catch (err: any) {
      results.checks.sampleQuery = {
        success: false,
        error: err.message,
      };
    }
  }

  // Summary
  const hasErrors = results.errors.length > 0;
  const hasWarnings = results.warnings.length > 0;

  results.summary = {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
    message: hasErrors
      ? '❌ Er zijn fouten gevonden'
      : hasWarnings
      ? '⚠️ Alles werkt, maar er zijn waarschuwingen'
      : '✅ Alles werkt correct!',
  };

  return NextResponse.json(results, {
    status: hasErrors ? 500 : 200,
  });
}

