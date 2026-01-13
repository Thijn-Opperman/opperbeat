import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/set/suggest
 * Generate next track suggestions for a DJ set
 * 
 * Body: {
 *   currentTrack?: {
 *     trackId: string,
 *     bpm: number,
 *     key: string,
 *     energy: string,
 *   },
 *   history?: Array<{
 *     trackId: string,
 *     bpm: number | null,
 *     key: string | null,
 *     energy: string,
 *   }>,
 *   allTracks: Array<{
 *     id: string,
 *     title: string,
 *     artist: string | null,
 *     bpm: number | null,
 *     key: string | null,
 *   }>
 * }
 * 
 * Returns: {
 *   suggestions: Array<{
 *     trackId: string,
 *     title: string,
 *     artist: string | null,
 *     bpm: number | null,
 *     key: string | null,
 *     energy: string,
 *     cuePoint: number,
 *     transitionType: string,
 *     confidence: number
 *   }>
 * }
 */

// Mock AI function - in production, this would use actual AI
function generateSetSuggestions(
  currentTrack: { bpm: number; key: string; energy: string } | null,
  history: Array<{ trackId: string; bpm: number | null; key: string | null; energy: string }>,
  allTracks: Array<{
    id: string;
    title: string;
    artist: string | null;
    bpm: number | null;
    key: string | null;
  }>
) {
  // Filter out tracks that are already in history
  const historyIds = new Set(history.map(h => h.trackId));
  const availableTracks = allTracks.filter(t => !historyIds.has(t.id));
  
  if (availableTracks.length === 0) {
    return [];
  }
  
  // Score tracks based on various factors
  const scoredTracks = availableTracks.map(track => {
    let score = 0.5; // Base score
    
    // BPM matching (prefer similar BPM, ±5 BPM is ideal)
    if (currentTrack && track.bpm && currentTrack.bpm) {
      const bpmDiff = Math.abs(track.bpm - currentTrack.bpm);
      if (bpmDiff <= 5) {
        score += 0.3; // Perfect match
      } else if (bpmDiff <= 10) {
        score += 0.15; // Good match
      } else if (bpmDiff <= 20) {
        score += 0.05; // Acceptable
      } else {
        score -= 0.1; // Too different
      }
    }
    
    // Key matching (compatible keys)
    if (currentTrack && track.key && currentTrack.key) {
      const currentKey = currentTrack.key.split(' ')[0]; // Extract just the note
      const trackKey = track.key.split(' ')[0];
      
      // Simple key compatibility (circle of fifths)
      const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
      const currentIndex = keys.indexOf(currentKey);
      const trackIndex = keys.indexOf(trackKey);
      
      if (currentIndex !== -1 && trackIndex !== -1) {
        const diff = Math.abs(currentIndex - trackIndex);
        if (diff === 0) {
          score += 0.2; // Same key
        } else if (diff === 1 || diff === 11) {
          score += 0.15; // Perfect fifth
        } else if (diff === 2 || diff === 10) {
          score += 0.1; // Good match
        }
      }
    }
    
    // Energy progression (prefer gradual increase or maintain)
    if (currentTrack) {
      const energyLevels = { low: 1, medium: 2, high: 3 };
      const currentEnergy = energyLevels[currentTrack.energy as keyof typeof energyLevels] || 2;
      
      // Infer energy from BPM if not available
      let trackEnergy = 'medium';
      if (track.bpm) {
        if (track.bpm < 100) trackEnergy = 'low';
        else if (track.bpm < 130) trackEnergy = 'medium';
        else trackEnergy = 'high';
      }
      
      const trackEnergyLevel = energyLevels[trackEnergy as keyof typeof energyLevels] || 2;
      const energyDiff = trackEnergyLevel - currentEnergy;
      
      if (energyDiff === 0) {
        score += 0.1; // Maintain energy
      } else if (energyDiff === 1) {
        score += 0.15; // Gradual increase (preferred)
      } else if (energyDiff === -1) {
        score += 0.05; // Gradual decrease
      } else if (energyDiff > 1) {
        score -= 0.1; // Too big jump
      }
    }
    
    // Avoid repeating same artist (unless it's been a while)
    const recentArtists = history.slice(-5).map(h => {
      const track = allTracks.find(t => t.id === h.trackId);
      return track?.artist;
    }).filter(Boolean);
    
    if (track.artist && recentArtists.includes(track.artist)) {
      score -= 0.1;
    }
    
    // Normalize score to 0-1
    score = Math.max(0, Math.min(1, score));
    
    return {
      track,
      score,
    };
  });
  
  // Sort by score and take top 5
  const topTracks = scoredTracks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  // Generate suggestions with cue points and transition types
  const suggestions = topTracks.map(({ track, score }) => {
    // Calculate cue point (start of track or a good intro point)
    // For POC, use a simple heuristic: 10% of track or 30 seconds, whichever is smaller
    const cuePoint = Math.min(30, Math.floor((track.bpm ? 240 : 180) * 0.1));
    
    // Determine transition type based on BPM difference
    let transitionType = 'fade';
    if (currentTrack && track.bpm && currentTrack.bpm) {
      const bpmDiff = Math.abs(track.bpm - currentTrack.bpm);
      if (bpmDiff <= 2) {
        transitionType = 'beatmatch';
      } else if (bpmDiff <= 5) {
        transitionType = 'fade';
      } else {
        transitionType = 'cut';
      }
    }
    
    // Infer energy from BPM
    let energy = 'medium';
    if (track.bpm) {
      if (track.bpm < 100) energy = 'low';
      else if (track.bpm < 130) energy = 'medium';
      else energy = 'high';
    }
    
    return {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      bpm: track.bpm,
      key: track.key,
      energy,
      cuePoint,
      transitionType,
      confidence: score,
    };
  });
  
  return suggestions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentTrack, history = [], allTracks } = body;
    
    if (!allTracks || !Array.isArray(allTracks) || allTracks.length === 0) {
      return NextResponse.json(
        { error: 'allTracks array is required' },
        { status: 400 }
      );
    }
    
    // Generate suggestions using mock AI
    const suggestions = generateSetSuggestions(
      currentTrack || null,
      history || [],
      allTracks
    );
    
    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error generating set suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate set suggestions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
