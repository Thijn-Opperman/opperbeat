import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Maak response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Uitgelogd',
      },
      { status: 200 }
    );

    // Verwijder session token cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Verwijder cookie onmiddellijk
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het uitloggen' },
      { status: 500 }
    );
  }
}

