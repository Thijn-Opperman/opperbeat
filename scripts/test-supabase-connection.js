/**
 * Test Supabase Connection
 * Run: node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('1. Environment Variables:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!');
    console.error('   Make sure .env.local exists with:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // Test client connection
  console.log('2. Creating Supabase Client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('   ✅ Clients created');
  console.log('');

  // Test database connection
  console.log('3. Testing Database Connection...');
  try {
    const { data, error } = await supabaseAdmin
      .from('music_analyses')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('   ⚠️  Table "music_analyses" does not exist yet');
        console.log('   → Run supabase_setup.sql in Supabase SQL Editor');
      } else {
        console.error('   ❌ Database Error:', error.message);
        console.error('   Code:', error.code);
      }
    } else {
      console.log('   ✅ Database connection successful');
      console.log('   ✅ Table "music_analyses" exists');
    }
  } catch (err) {
    console.error('   ❌ Connection failed:', err.message);
  }
  console.log('');

  // Test storage buckets
  console.log('4. Testing Storage Buckets...');
  try {
    // Check audio-files bucket
    const { data: audioFiles, error: audioError } = await supabaseAdmin.storage
      .from('audio-files')
      .list('', { limit: 1 });
    
    if (audioError) {
      if (audioError.message.includes('Bucket not found')) {
        console.log('   ⚠️  Bucket "audio-files" does not exist');
        console.log('   → Create it in Supabase Dashboard → Storage');
      } else {
        console.error('   ❌ Audio-files bucket error:', audioError.message);
      }
    } else {
      console.log('   ✅ Bucket "audio-files" exists');
    }

    // Check album-artwork bucket
    const { data: artwork, error: artworkError } = await supabaseAdmin.storage
      .from('album-artwork')
      .list('', { limit: 1 });
    
    if (artworkError) {
      if (artworkError.message.includes('Bucket not found')) {
        console.log('   ⚠️  Bucket "album-artwork" does not exist');
        console.log('   → Create it in Supabase Dashboard → Storage');
      } else {
        console.error('   ❌ Album-artwork bucket error:', artworkError.message);
      }
    } else {
      console.log('   ✅ Bucket "album-artwork" exists');
    }
  } catch (err) {
    console.error('   ❌ Storage test failed:', err.message);
  }
  console.log('');

  // Test query (if table exists)
  console.log('5. Testing Query (if table exists)...');
  try {
    const { data, error, count } = await supabaseAdmin
      .from('music_analyses')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (!error) {
      console.log(`   ✅ Query successful (${count || 0} records in database)`);
    }
  } catch (err) {
    // Silent fail - table might not exist
  }
  console.log('');

  console.log('✅ Connection test complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure database schema is executed (supabase_setup.sql)');
  console.log('2. Make sure storage buckets are created');
  console.log('3. Make sure storage policies are set');
  console.log('4. Restart your development server');
}

testConnection().catch(console.error);

