import { NextResponse } from 'next/server';

/**
 * Endpoint om de Railway API URL op te halen (zonder bestand door te sturen)
 * Dit voorkomt 413 errors voor grote bestanden
 */
export async function GET() {
  const apiUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
  
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'PYTHON_API_URL niet geconfigureerd' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ apiUrl });
}

