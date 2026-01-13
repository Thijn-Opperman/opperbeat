import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cue-points/analyze
 * Analyze a track and suggest cue points (intro, drop, outro)
 * 
 * Body: {
 *   trackId: string,
 *   duration: number, // Duration in seconds
 *   bpm?: number,
 *   waveform?: number[] // Optional waveform data for analysis
 * }
 * 
 * Returns: {
 *   cuePoints: Array<{
 *     id: string,
 *     type: 'intro' | 'drop' | 'outro' | 'custom',
 *     time: number,
 *     label?: string
 *   }>
 * }
 */

/**
 * Analyze waveform to find energy changes
 * Returns array of normalized energy values over time
 */
function analyzeWaveformEnergy(waveform: number[], duration: number): number[] {
  if (!waveform || waveform.length === 0) return [];
  
  // Calculate RMS (Root Mean Square) energy for each segment
  const segments = 100; // Divide track into 100 segments
  const segmentSize = Math.floor(waveform.length / segments);
  const energy: number[] = [];
  
  for (let i = 0; i < segments; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, waveform.length);
    const segment = waveform.slice(start, end);
    
    // Calculate RMS
    const sumSquares = segment.reduce((sum, val) => sum + val * val, 0);
    const rms = Math.sqrt(sumSquares / segment.length);
    energy.push(rms);
  }
  
  // Normalize to 0-1
  const maxEnergy = Math.max(...energy);
  if (maxEnergy > 0) {
    return energy.map(e => e / maxEnergy);
  }
  
  return energy;
}

/**
 * Find intro end by detecting when energy stabilizes
 */
function findIntroEnd(energy: number[], duration: number, bpm?: number): number {
  if (energy.length === 0) {
    // Fallback: use BPM-based or percentage-based calculation
    if (bpm) {
      const barDuration = (60 / bpm) * 4;
      return Math.min(barDuration * 8, 30);
    }
    return Math.min(duration * 0.1, 30);
  }
  
  // Find first significant energy increase (when track "starts")
  // Look for first point where energy is > 30% of max
  const threshold = 0.3;
  for (let i = 0; i < Math.min(energy.length * 0.3, 30); i++) {
    if (energy[i] > threshold) {
      // Convert segment index to time
      return (i / energy.length) * duration;
    }
  }
  
  // Fallback: use first 10% or 8 bars
  if (bpm) {
    const barDuration = (60 / bpm) * 4;
    return Math.min(barDuration * 8, duration * 0.15);
  }
  return Math.min(duration * 0.1, 30);
}

/**
 * Find drop by detecting energy peak
 */
function findDrop(energy: number[], duration: number, introEnd: number, bpm?: number): number | null {
  if (energy.length === 0) {
    // Fallback: use BPM-based calculation
    if (bpm) {
      const barDuration = (60 / bpm) * 4;
      const calculatedDrop = barDuration * 32;
      if (calculatedDrop > introEnd && calculatedDrop < duration * 0.9) {
        return calculatedDrop;
      }
    }
    return duration * 0.4;
  }
  
  // Find highest energy peak after intro (between 20% and 70% of track)
  const startSegment = Math.floor((introEnd / duration) * energy.length);
  const endSegment = Math.floor(0.7 * energy.length);
  
  let maxEnergy = 0;
  let maxIndex = startSegment;
  
  for (let i = startSegment; i < endSegment; i++) {
    if (energy[i] > maxEnergy) {
      maxEnergy = energy[i];
      maxIndex = i;
    }
  }
  
  // Only return if energy is significantly high (> 60% of max)
  if (maxEnergy > 0.6) {
    const dropTime = (maxIndex / energy.length) * duration;
    if (dropTime > introEnd && dropTime < duration * 0.9) {
      return dropTime;
    }
  }
  
  // Fallback: use BPM-based or percentage-based
  if (bpm) {
    const barDuration = (60 / bpm) * 4;
    const calculatedDrop = barDuration * 32;
    if (calculatedDrop > introEnd && calculatedDrop < duration * 0.9) {
      return calculatedDrop;
    }
  }
  
  return duration * 0.4;
}

/**
 * Find outro start by detecting energy decrease
 */
function findOutroStart(energy: number[], duration: number): number {
  if (energy.length === 0) {
    return duration * 0.85;
  }
  
  // Find where energy starts decreasing significantly (last 20% of track)
  const startSegment = Math.floor(0.8 * energy.length);
  const avgEnergy = energy.slice(0, startSegment).reduce((a, b) => a + b, 0) / startSegment;
  
  // Find first point where energy drops below 50% of average
  for (let i = startSegment; i < energy.length; i++) {
    if (energy[i] < avgEnergy * 0.5) {
      return (i / energy.length) * duration;
    }
  }
  
  // Fallback: use 85% of track
  return duration * 0.85;
}

// Improved AI function that uses waveform analysis when available
function analyzeCuePoints(duration: number, bpm?: number, waveform?: number[] | { waveform?: number[] }) {
  const cuePoints: Array<{ id: string; type: 'intro' | 'drop' | 'outro' | 'custom'; time: number; label?: string }> = [];
  
  // Extract waveform array if it's an object
  let waveformArray: number[] | undefined;
  if (waveform) {
    if (Array.isArray(waveform)) {
      waveformArray = waveform;
    } else if (typeof waveform === 'object' && 'waveform' in waveform && Array.isArray(waveform.waveform)) {
      waveformArray = waveform.waveform;
    }
  }
  
  // Analyze waveform energy if available
  const energy = waveformArray ? analyzeWaveformEnergy(waveformArray, duration) : [];
  
  // Find intro end
  const introTime = findIntroEnd(energy, duration, bpm);
  if (introTime < duration) {
    cuePoints.push({
      id: `intro-${Date.now()}`,
      type: 'intro',
      time: Math.round(introTime),
      label: 'Intro End',
    });
  }
  
  // Find drop
  const dropTime = findDrop(energy, duration, introTime, bpm);
  if (dropTime !== null && dropTime > introTime && dropTime < duration * 0.9) {
    cuePoints.push({
      id: `drop-${Date.now()}`,
      type: 'drop',
      time: Math.round(dropTime),
      label: 'Drop',
    });
  }
  
  // Find outro start
  const outroStart = findOutroStart(energy, duration);
  if (outroStart < duration - 10) {
    cuePoints.push({
      id: `outro-${Date.now()}`,
      type: 'outro',
      time: Math.round(outroStart),
      label: 'Outro Start',
    });
  }
  
  // Sort by time
  cuePoints.sort((a, b) => a.time - b.time);
  
  return cuePoints;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, duration, bpm, waveform } = body;
    
    if (!trackId || !duration) {
      return NextResponse.json(
        { error: 'trackId and duration are required' },
        { status: 400 }
      );
    }
    
    if (duration <= 0) {
      return NextResponse.json(
        { error: 'duration must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Generate cue points using mock AI
    const cuePoints = analyzeCuePoints(duration, bpm, waveform);
    
    return NextResponse.json({
      success: true,
      trackId,
      cuePoints,
    });
  } catch (error) {
    console.error('Error analyzing cue points:', error);
    return NextResponse.json(
      { error: 'Failed to analyze cue points', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
