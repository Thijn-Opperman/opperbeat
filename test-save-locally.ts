/**
 * Test Script: Test Supabase Opslag Lokaal
 * 
 * Run: npx tsx test-save-locally.ts
 * Of: node --loader ts-node/esm test-save-locally.ts
 */

import { supabaseAdmin } from './lib/supabase';
import { uploadAudioFile, uploadArtwork } from './lib/storage-helpers';
import { extractArtwork } from './lib/extract-artwork';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

async function testSave() {
  console.log('🧪 Testing Supabase Opslag...\n');

  // Test data
  const userId = null; // Null voor anonymous
  const fileId = randomUUID();
  const testTitle = 'Test Song ' + Date.now();
  
  console.log('Test parameters:');
  console.log('  - userId:', userId);
  console.log('  - fileId:', fileId);
  console.log('  - title:', testTitle);
  console.log('');

  try {
    // Test 1: Database Insert
    console.log('1️⃣ Testing database insert...');
    const testData = {
      user_id: userId, // NULL
      title: testTitle,
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
      console.error('❌ Database insert failed:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
      return;
    }

    console.log('✅ Database insert successful!');
    console.log('   ID:', insertData.id);
    console.log('');

    // Test 2: Storage Upload (mock file)
    console.log('2️⃣ Testing storage upload...');
    const testBuffer = Buffer.from('test audio content');
    
    try {
      const audioResult = await uploadAudioFile(
        userId,
        fileId,
        testBuffer,
        'test.mp3',
        'audio/mpeg'
      );
      console.log('✅ Audio upload successful!');
      console.log('   Path:', audioResult.path);
      console.log('');

      // Cleanup: verwijder test record en file
      console.log('3️⃣ Cleaning up...');
      
      // Verwijder uit database
      await supabaseAdmin
        .from('music_analyses')
        .delete()
        .eq('id', insertData.id);
      
      // Verwijder uit storage
      await supabaseAdmin.storage
        .from('audio-files')
        .remove([audioResult.path]);
      
      console.log('✅ Cleanup successful!');
      console.log('');
      console.log('🎉 Alle tests geslaagd!');
      
    } catch (uploadError: any) {
      console.error('❌ Storage upload failed:', uploadError.message);
      
      // Cleanup database record
      await supabaseAdmin
        .from('music_analyses')
        .delete()
        .eq('id', insertData.id)
        .catch(() => {});
      
      throw uploadError;
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMogelijke oorzaken:');
    console.error('1. Foreign key constraint nog niet gefixed (voer fix_foreign_key.sql uit)');
    console.error('2. Storage policies niet ingesteld (voer storage_policies.sql uit)');
    console.error('3. Environment variables niet ingesteld (.env.local)');
    process.exit(1);
  }
}

testSave();

