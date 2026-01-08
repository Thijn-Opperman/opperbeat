import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/debug-supabase
 * Uitgebreide diagnostic tool om Supabase problemen te vinden
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
    warnings: [],
    suggestions: [],
  };

  try {
    // Test 1: Database schema check
    console.log('🔍 Testing database schema...');
    try {
      const { data: columns, error } = await supabaseAdmin.rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'music_analyses'
          ORDER BY ordinal_position;
        `,
      });

      if (error) {
        // Probeer alternatieve methode
      const { data: testInsert, error: insertError } = await supabaseAdmin
        .from('music_analyses')
        .insert({
          user_id: null, // NULL voor anonymous users
          title: 'TEST',
          original_filename: 'test.mp3',
          duration_seconds: 0,
          duration_formatted: '0:00',
        })
        .select();

        if (insertError) {
          diagnostics.tests.schema = {
            status: 'error',
            error: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          };
          diagnostics.errors.push(`Schema error: ${insertError.message}`);
          
          // Check specifieke problemen
          if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
            diagnostics.suggestions.push('Database schema is niet compleet. Voer supabase_setup.sql opnieuw uit.');
          }
          if (insertError.message.includes('violates not-null constraint')) {
            diagnostics.suggestions.push('Er ontbreekt een verplicht veld. Check database schema.');
          }
          if (insertError.message.includes('violates foreign key constraint')) {
            diagnostics.suggestions.push('Foreign key constraint probleem. Check user_id bestaat in auth.users.');
          }
        } else {
          // Verwijder test record
          if (testInsert && testInsert[0]) {
            await supabaseAdmin.from('music_analyses').delete().eq('id', testInsert[0].id);
          }
          diagnostics.tests.schema = { status: 'ok' };
        }
      }
    } catch (err: any) {
      diagnostics.tests.schema = {
        status: 'error',
        error: err.message,
      };
      diagnostics.errors.push(`Schema test failed: ${err.message}`);
    }

    // Test 2: Check alle verplichte kolommen
    console.log('🔍 Checking required columns...');
    const requiredColumns = [
      'id', 'user_id', 'title', 'original_filename', 'duration_seconds',
      'duration_formatted', 'created_at'
    ];
    
    try {
      const { data: sample, error } = await supabaseAdmin
        .from('music_analyses')
        .select('*')
        .limit(1);

      if (!error && sample) {
        const existingColumns = Object.keys(sample[0] || {});
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          diagnostics.tests.columns = {
            status: 'warning',
            missing: missingColumns,
          };
          diagnostics.warnings.push(`Missing columns: ${missingColumns.join(', ')}`);
          diagnostics.suggestions.push('Voer supabase_setup.sql opnieuw uit om ontbrekende kolommen toe te voegen.');
        } else {
          diagnostics.tests.columns = { status: 'ok', columns: existingColumns.length };
        }
      }
    } catch (err: any) {
      diagnostics.tests.columns = {
        status: 'error',
        error: err.message,
      };
    }

    // Test 3: Storage upload test
    console.log('🔍 Testing storage upload...');
    try {
      const testBuffer = Buffer.from('test');
      const testPath = `test/${Date.now()}/test.txt`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('audio-files')
        .upload(testPath, testBuffer, {
          contentType: 'text/plain',
        });

      if (uploadError) {
        diagnostics.tests.storageUpload = {
          status: 'error',
          error: uploadError.message,
          code: uploadError.statusCode,
        };
        diagnostics.errors.push(`Storage upload error: ${uploadError.message}`);
        
        if (uploadError.message.includes('Bucket not found')) {
          diagnostics.suggestions.push('Storage bucket "audio-files" bestaat niet. Maak deze aan in Supabase Dashboard.');
        }
        if (uploadError.message.includes('new row violates row-level security')) {
          diagnostics.suggestions.push('Storage policies zijn niet correct ingesteld. Voer storage_policies.sql uit.');
        }
      } else {
        // Verwijder test bestand
        await supabaseAdmin.storage.from('audio-files').remove([testPath]);
        diagnostics.tests.storageUpload = { status: 'ok' };
      }
    } catch (err: any) {
      diagnostics.tests.storageUpload = {
        status: 'error',
        error: err.message,
      };
      diagnostics.errors.push(`Storage upload test failed: ${err.message}`);
    }

    // Test 4: Check recente records voor errors
    console.log('🔍 Checking recent records...');
    try {
      const { data: recent, error } = await supabaseAdmin
        .from('music_analyses')
        .select('id, title, created_at, audio_file_url, artwork_url')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error) {
        diagnostics.tests.recentRecords = {
          status: 'ok',
          count: recent?.length || 0,
          records: recent || [],
        };
        
        // Check voor incomplete records
        const incomplete = recent?.filter(r => !r.audio_file_url);
        if (incomplete && incomplete.length > 0) {
          diagnostics.warnings.push(`${incomplete.length} record(s) zonder audio_file_url`);
        }
      }
    } catch (err: any) {
      diagnostics.tests.recentRecords = {
        status: 'error',
        error: err.message,
      };
    }

    // Test 5: Check storage bestanden
    console.log('🔍 Checking storage files...');
    try {
      const { data: audioFiles, error: audioError } = await supabaseAdmin.storage
        .from('audio-files')
        .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

      if (!audioError) {
        diagnostics.tests.storageFiles = {
          status: 'ok',
          audioFilesCount: audioFiles?.length || 0,
          recentFiles: audioFiles?.slice(0, 5) || [],
        };
      }
    } catch (err: any) {
      diagnostics.tests.storageFiles = {
        status: 'error',
        error: err.message,
      };
    }

    // Test 6: Test insert met alle velden
    console.log('🔍 Testing full insert...');
    try {
      const testData = {
        user_id: null, // NULL voor anonymous users
        title: 'TEST SONG',
        original_filename: 'test.mp3',
        file_size_bytes: 1000,
        mime_type: 'audio/mpeg',
        audio_file_url: 'test/path/test.mp3',
        duration_seconds: 180,
        duration_formatted: '3:00',
        bpm: 120,
        key: 'C major',
      };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('music_analyses')
        .insert(testData)
        .select('id')
        .single();

      if (insertError) {
        diagnostics.tests.fullInsert = {
          status: 'error',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          testData,
        };
        diagnostics.errors.push(`Full insert error: ${insertError.message}`);
      } else {
        // Verwijder test record
        if (insertData?.id) {
          await supabaseAdmin.from('music_analyses').delete().eq('id', insertData.id);
        }
        diagnostics.tests.fullInsert = { status: 'ok' };
      }
    } catch (err: any) {
      diagnostics.tests.fullInsert = {
        status: 'error',
        error: err.message,
      };
      diagnostics.errors.push(`Full insert test failed: ${err.message}`);
    }

  } catch (err: any) {
    diagnostics.errors.push(`Diagnostic failed: ${err.message}`);
  }

  // Summary
  const hasErrors = diagnostics.errors.length > 0;
  const hasWarnings = diagnostics.warnings.length > 0;

  diagnostics.summary = {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
    errorsCount: diagnostics.errors.length,
    warningsCount: diagnostics.warnings.length,
    suggestionsCount: diagnostics.suggestions.length,
  };

  return NextResponse.json(diagnostics, {
    status: hasErrors ? 500 : 200,
  });
}

