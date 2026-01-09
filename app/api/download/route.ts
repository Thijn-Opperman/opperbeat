import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/download
 * Download muziek van YouTube, SoundCloud of zoek op naam
 * 
 * Body:
 * - source: 'youtube' | 'soundcloud' | 'search'
 * - input: URL of zoekterm
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, input } = body;

    if (!source || !input) {
      return NextResponse.json(
        { error: 'Source en input zijn verplicht' },
        { status: 400 }
      );
    }

    // Check of Python API beschikbaar is
    let pythonApiUrl = process.env.PYTHON_API_URL || process.env.NEXT_PUBLIC_PYTHON_API_URL;
    
    if (!pythonApiUrl) {
      return NextResponse.json(
        { error: 'Python API niet geconfigureerd. Voeg PYTHON_API_URL toe aan environment variables.' },
        { status: 500 }
      );
    }

    // Remove /api/analyze from URL if present (for download endpoint)
    // PYTHON_API_URL might be: https://xxx.up.railway.app/api/analyze
    // But download endpoint is at: https://xxx.up.railway.app/download
    const baseUrl = pythonApiUrl.replace(/\/api\/analyze\/?$/, '');
    const downloadUrl = `${baseUrl}/download`;

    console.log('Download request:', { source, input, pythonApiUrl, baseUrl, downloadUrl });

    // Forward request naar Python API
    try {
      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        return NextResponse.json(
          { error: errorData.error || errorData.detail || 'Fout bij downloaden' },
          { status: response.status }
        );
      }

      // Als response een file is, stream deze door
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('audio/')) {
        const arrayBuffer = await response.arrayBuffer();
        const filename = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download.mp3';
        
        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      // Anders JSON response
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Error calling Python API:', fetchError);
      return NextResponse.json(
        { error: 'Kon niet verbinden met download service. Zorg dat de Python API draait.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in /api/download:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

