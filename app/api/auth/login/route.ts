import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Simpele password hashing (zelfde als register)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Laad gebruikers uit bestand
async function loadUsers(): Promise<any[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Genereer een simpele session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validatie
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mailadres en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Laad gebruikers
    const users = await loadUsers();

    // Zoek gebruiker
    const user = users.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Verifieer wachtwoord
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Genereer session token
    const sessionToken = generateSessionToken();

    // Retourneer gebruikersinformatie (zonder password hash)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: sessionToken,
      },
      { status: 200 }
    );

    // Zet session token in cookie (voor 7 dagen)
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dagen
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het inloggen' },
      { status: 500 }
    );
  }
}

