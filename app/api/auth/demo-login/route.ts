import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Genereer een simpele session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Demo user die altijd beschikbaar is
const DEMO_USER = {
  id: 'demo-user-12345',
  name: 'Demo Gebruiker',
  email: 'demo@opperbeat.nl',
};

export async function POST(request: NextRequest) {
  try {
    // Genereer session token
    const sessionToken = generateSessionToken();

    // Retourneer demo gebruikersinformatie
    const response = NextResponse.json(
      {
        success: true,
        user: DEMO_USER,
        token: sessionToken,
        isDemo: true,
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
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het demo inloggen' },
      { status: 500 }
    );
  }
}

