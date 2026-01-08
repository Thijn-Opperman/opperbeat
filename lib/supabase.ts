import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check voor environment variables, maar crash niet tijdens build
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Server-side: log warning maar maak placeholder client
    console.warn('⚠️ Missing Supabase environment variables. Maak .env.local aan met NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Maak client met fallback waarden voor build time
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Server-side client met service role (voor admin operaties)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey && typeof window === 'undefined') {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY niet ingesteld. Server-side operaties werken mogelijk niet.')
}

// Maak admin client met fallback
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper functie om signed URL te genereren voor private files
export async function getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
  
  return data.signedUrl
}

