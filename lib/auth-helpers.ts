import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase'

/**
 * Haal user ID op uit request
 * Voorlopig gebruiken we een simpele header-based auth
 * Later migreren naar Supabase Auth
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Option 1: Check Authorization header (voor Supabase Auth later)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) {
        return user.id
      }
    } catch (error) {
      console.warn('Error validating Supabase token:', error)
    }
  }

  // Option 2: Check session cookie (huidige implementatie)
  const sessionToken = request.cookies.get('session_token')?.value
  if (sessionToken) {
    // Voor nu: gebruik een placeholder - later migreren naar Supabase Auth
    // Je kunt hier je bestaande session validation logica plaatsen
    // Voor testen kunnen we een hardcoded user ID gebruiken
    return null // Return null als geen auth gevonden
  }

  // Option 3: Check user-id header (voor development/testing)
  const userIdHeader = request.headers.get('x-user-id')
  if (userIdHeader) {
    return userIdHeader
  }

  return null
}

/**
 * Voorlopige functie: haal user ID op of gebruik null voor development
 * In productie moet dit via echte authenticatie
 */
export async function getUserId(request: NextRequest, allowAnonymous: boolean = false): Promise<string | null> {
  const userId = await getUserIdFromRequest(request)
  
  if (userId) {
    return userId
  }

  if (allowAnonymous) {
    // Voor development: gebruik null voor anonymous users
    // In productie: throw error
    console.warn('⚠️ No user ID found, using anonymous mode (development only)')
    return null // Return null - wordt NULL in database (nullable kolom)
  }

  throw new Error('Authentication required')
}

