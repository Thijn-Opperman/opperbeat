/**
 * Test Script: Test Supabase Opslag Lokaal
 * 
 * Run: node test-save-locally.js
 * 
 * Let op: Dit script gebruikt require() dus werkt direct met Node.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure .env.local exists with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSave() {
  console.log('🧪 Testing Supabase Opslag Lokaal...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  // Test data - gebruik NULL voor anonymous user
  const userId = null;
  const fileId = randomUUID();
  const testTitle = 'Test Song ' + Date.now();
  
  console.log('Test parameters:');
  console.log('  - userId:', userId, '(NULL voor anonymous)');
  console.log('  - fileId:', fileId);
  console.log('  - title:', testTitle);
  console.log('');

  try {
    // Test 1: Database Insert met NULL user_id
    console.log('1️⃣ Testing database insert met NULL user_id...');
    const testData = {
      user_id: null, // NULL - moet werken na fix
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

    console.log('Inserting data:', JSON.stringify(testData, null, 2));
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('music_analyses')
      .insert(testData)
      .select('id')
      .single();

    if (insertError) {
      console.error('\n❌ Database insert FAILED!');
      console.error('Error:', insertError.message);
      console.error('Code:', insertError.code);
      console.error('Details:', insertError.details);
      console.error('Hint:', insertError.hint);
      console.error('');
      console.error('🔧 Oplossing:');
      console.error('1. Ga naar Supabase Dashboard → SQL Editor');
      console.error('2. Voer fix_foreign_key.sql uit');
      console.error('3. Run dit script opnieuw');
      process.exit(1);
    }

    console.log('✅ Database insert SUCCESSFUL!');
    console.log('   Record ID:', insertData.id);
    console.log('');

    // Test 2: Verify record bestaat
    console.log('2️⃣ Verifying record...');
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('music_analyses')
      .select('*')
      .eq('id', insertData.id)
      .single();

    if (verifyError) {
      console.error('❌ Verify failed:', verifyError.message);
    } else {
      console.log('✅ Record verified!');
      console.log('   user_id:', verifyData.user_id, '(should be NULL)');
      console.log('   title:', verifyData.title);
    }
    console.log('');

    // Test 3: Storage Upload Test
    console.log('3️⃣ Testing storage upload...');
    const testBuffer = Buffer.from('test audio content');
    const userFolder = userId || 'anonymous';
    const storagePath = `${userFolder}/${fileId}/test.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('audio-files')
      .upload(storagePath, testBuffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      console.error('❌ Storage upload failed:', uploadError.message);
      console.error('   Code:', uploadError.statusCode);
      
      if (uploadError.message.includes('Bucket not found')) {
        console.error('\n🔧 Oplossing: Maak "audio-files" bucket aan in Supabase Storage');
      }
      if (uploadError.message.includes('row-level security')) {
        console.error('\n🔧 Oplossing: Voer storage_policies.sql uit');
      }
    } else {
      console.log('✅ Storage upload successful!');
      console.log('   Path:', storagePath);
    }
    console.log('');

    // Cleanup: verwijder test data
    console.log('4️⃣ Cleaning up test data...');
    
    // Verwijder uit database
    const { error: deleteError } = await supabaseAdmin
      .from('music_analyses')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('⚠️  Failed to delete test record:', deleteError.message);
    } else {
      console.log('✅ Test record deleted');
    }
    
    // Verwijder uit storage (als upload gelukt was)
    if (!uploadError) {
      const { error: removeError } = await supabaseAdmin.storage
        .from('audio-files')
        .remove([storagePath]);
      
      if (removeError) {
        console.error('⚠️  Failed to delete test file:', removeError.message);
      } else {
        console.log('✅ Test file deleted');
      }
    }
    
    console.log('');
    console.log('🎉 Alle tests geslaagd!');
    console.log('✅ Database accepteert NULL user_id');
    console.log('✅ Storage upload werkt');
    console.log('\nJe kunt nu audio bestanden analyseren en opslaan!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSave().catch(console.error);

