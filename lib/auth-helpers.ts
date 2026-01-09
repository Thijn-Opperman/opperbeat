import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase'
import { promises as fs } from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

async function loadUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/**
 * Haal user ID op uit request
 * Gebruikt session token cookie om user ID te bepalen
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
    try {
      // Laad gebruikers om user ID te bepalen
      const users = await loadUsers()
      // Voor nu: gebruik de eerste gebruiker als er een session token is
      // In productie zou je de session token gebruiken om de juiste gebruiker op te halen
      if (users.length > 0) {
        return users[0].id
      }
    } catch (error) {
      console.warn('Error loading users:', error)
    }
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

