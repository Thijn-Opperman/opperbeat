/**
 * Local storage helpers for cue points
 * This is a proof of concept - stores everything locally without Supabase
 */

export interface CuePoint {
  id: string; // Unique ID for this cue point
  type: 'intro' | 'drop' | 'outro' | 'custom';
  time: number; // Time in seconds
  label?: string; // Optional custom label
}

export interface TrackCuePoints {
  trackId: string;
  duration: number; // Total track duration in seconds
  cuePoints: CuePoint[];
  lastUpdated: string;
}

const STORAGE_KEY = 'opperbeat_cue_points';

/**
 * Get all cue points from local storage
 */
export function getAllCuePoints(): Record<string, TrackCuePoints> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading cue points from localStorage:', error);
    return {};
  }
}

/**
 * Get cue points for a specific track
 */
export function getTrackCuePoints(trackId: string): TrackCuePoints | null {
  const allCues = getAllCuePoints();
  return allCues[trackId] || null;
}

/**
 * Save cue points for a track
 */
export function saveTrackCuePoints(trackId: string, duration: number, cuePoints: CuePoint[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allCues = getAllCuePoints();
    allCues[trackId] = {
      trackId,
      duration,
      cuePoints,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCues));
  } catch (error) {
    console.error('Error saving cue points to localStorage:', error);
  }
}

/**
 * Add a cue point to a track
 */
export function addCuePoint(trackId: string, cuePoint: CuePoint): void {
  const existing = getTrackCuePoints(trackId);
  if (!existing) {
    console.error('Track not found, cannot add cue point');
    return;
  }
  
  const updatedCues = [...existing.cuePoints, cuePoint];
  saveTrackCuePoints(trackId, existing.duration, updatedCues);
}

/**
 * Update a cue point
 */
export function updateCuePoint(trackId: string, cuePointId: string, updates: Partial<CuePoint>): void {
  const existing = getTrackCuePoints(trackId);
  if (!existing) {
    console.error('Track not found, cannot update cue point');
    return;
  }
  
  const updatedCues = existing.cuePoints.map(cue =>
    cue.id === cuePointId ? { ...cue, ...updates } : cue
  );
  saveTrackCuePoints(trackId, existing.duration, updatedCues);
}

/**
 * Delete a cue point
 */
export function deleteCuePoint(trackId: string, cuePointId: string): void {
  const existing = getTrackCuePoints(trackId);
  if (!existing) {
    console.error('Track not found, cannot delete cue point');
    return;
  }
  
  const updatedCues = existing.cuePoints.filter(cue => cue.id !== cuePointId);
  saveTrackCuePoints(trackId, existing.duration, updatedCues);
}

/**
 * Clear all cue points (for testing/reset)
 */
export function clearAllCuePoints(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get tracks that have cue points
 */
export function getTracksWithCuePoints(): string[] {
  const allCues = getAllCuePoints();
  return Object.keys(allCues);
}
