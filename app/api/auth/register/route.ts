import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Simpele password hashing (voor POC - in productie gebruik bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Zorg dat data directory bestaat
async function ensureDataDir() {
  const dataDir = path.dirname(USERS_FILE);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory bestaat al
  }
}

// Laad gebruikers uit bestand
async function loadUsers(): Promise<any[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Bestand bestaat niet, retourneer lege array
      return [];
    }
    throw error;
  }
}

// Sla gebruikers op in bestand
async function saveUsers(users: any[]) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validatie
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 tekens lang zijn' },
        { status: 400 }
      );
    }

    // Email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Laad bestaande gebruikers
    const users = await loadUsers();

    // Check of email al bestaat
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: 'Dit e-mailadres is al geregistreerd' },
        { status: 400 }
      );
    }

    // Maak nieuwe gebruiker
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    // Voeg gebruiker toe
    users.push(newUser);
    await saveUsers(users);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account succesvol aangemaakt',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van je account' },
      { status: 500 }
    );
  }
}

