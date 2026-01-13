import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/tags/suggest
 * Generate AI tag suggestions for a track
 * 
 * Body: {
 *   trackId: string,
 *   title: string,
 *   artist?: string,
 *   album?: string,
 *   genre?: string,
 *   bpm?: number,
 *   key?: string,
 *   duration?: number
 * }
 * 
 * Returns: {
 *   energy: string,
 *   mood: string,
 *   instrumentation: string[],
 *   vocalType: 'vocal' | 'instrumental' | 'mixed',
 *   era: string | null
 * }
 */

// Mock AI function - in production, this would call OpenAI/Anthropic/etc.
function generateTagSuggestions(trackData: {
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
}) {
  const { title, artist, genre, bpm } = trackData;
  
  // Simple rule-based suggestions for POC
  // In production, this would use actual AI
  
  // Energy based on BPM
  let energy = 'medium';
  if (bpm) {
    if (bpm < 100) energy = 'low';
    else if (bpm < 130) energy = 'medium';
    else energy = 'high';
  }
  
  // Mood based on genre and title keywords
  const titleLower = title.toLowerCase();
  const genreLower = genre?.toLowerCase() || '';
  let mood = 'neutral';
  
  const moodKeywords: Record<string, string[]> = {
    energetic: ['energy', 'party', 'dance', 'upbeat', 'fire', 'power'],
    chill: ['chill', 'relax', 'calm', 'peace', 'soft', 'ambient'],
    melancholic: ['sad', 'lonely', 'dark', 'rain', 'tears', 'hurt'],
    uplifting: ['happy', 'joy', 'sunshine', 'bright', 'celebrate', 'victory'],
    aggressive: ['rage', 'angry', 'fight', 'war', 'metal', 'hard'],
  };
  
  for (const [moodType, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(kw => titleLower.includes(kw))) {
      mood = moodType;
      break;
    }
  }
  
  // Instrumentation based on genre
  const instrumentation: string[] = [];
  if (genreLower.includes('electronic') || genreLower.includes('edm') || genreLower.includes('techno')) {
    instrumentation.push('synth', 'drum machine');
  }
  if (genreLower.includes('rock') || genreLower.includes('metal')) {
    instrumentation.push('guitar', 'drums', 'bass');
  }
  if (genreLower.includes('jazz')) {
    instrumentation.push('piano', 'saxophone', 'double bass');
  }
  if (genreLower.includes('hip') || genreLower.includes('rap')) {
    instrumentation.push('drum machine', 'bass');
  }
  if (instrumentation.length === 0) {
    instrumentation.push('mixed');
  }
  
  // Vocal type - simple heuristic
  let vocalType: 'vocal' | 'instrumental' | 'mixed' = 'vocal';
  if (titleLower.includes('instrumental') || titleLower.includes('beat')) {
    vocalType = 'instrumental';
  }
  
  // Era - try to infer from artist/genre or use null
  let era: string | null = null;
  // This would be better with actual AI, but for POC we'll leave it null mostly
  // or try to infer from genre patterns
  
  return {
    energy,
    mood,
    instrumentation: instrumentation.slice(0, 3), // Max 3 instruments
    vocalType,
    era,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, title, artist, album, genre, bpm, key, duration } = body;
    
    if (!trackId || !title) {
      return NextResponse.json(
        { error: 'trackId and title are required' },
        { status: 400 }
      );
    }
    
    // Generate suggestions using mock AI
    const suggestions = generateTagSuggestions({
      title,
      artist,
      album,
      genre,
      bpm,
      key,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      trackId,
      suggestions,
    });
  } catch (error) {
    console.error('Error generating tag suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate tag suggestions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
