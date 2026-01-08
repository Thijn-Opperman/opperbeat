import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

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

export async function GET(request: NextRequest) {
  try {
    // Check session token cookie
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 200 }
      );
    }

    // Voor nu: als er een session token is, beschouwen we de gebruiker als geauthenticeerd
    // In productie zou je hier de session token valideren tegen een database
    
    // Laad gebruikers om te zien of er een gebruiker is
    const users = await loadUsers();
    
    // Voor development: gebruik de eerste gebruiker als er een session token is
    // In productie zou je de session token gebruiken om de juiste gebruiker op te halen
    if (users.length > 0 && sessionToken) {
      const user = users[0];
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify auth error:', error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 200 }
    );
  }
}

