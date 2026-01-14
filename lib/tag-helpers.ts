/**
 * Local storage helpers for tracking tag status
 * This is a proof of concept - stores everything locally without Supabase
 */

export interface TrackTags {
  energy: string; // e.g., "low", "medium", "high"
  mood: string; // e.g., "energetic", "chill", "melancholic", "uplifting"
  instrumentation: string[]; // e.g., ["synth", "guitar", "drums"]
  vocalType: 'vocal' | 'instrumental' | 'mixed';
  era: string | null; // e.g., "90s", "00s", "10s", "20s"
}

export interface TaggedTrack {
  trackId: string;
  tags: TrackTags;
  confirmed: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'opperbeat_tagged_tracks';

/**
 * Get all tagged tracks from local storage
 */
export function getTaggedTracks(): Record<string, TaggedTrack> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading tagged tracks from localStorage:', error);
    return {};
  }
}

/**
 * Check if a track has been tagged
 */
export function isTrackTagged(trackId: string): boolean {
  const tagged = getTaggedTracks();
  return !!tagged[trackId]?.confirmed;
}

/**
 * Get tags for a specific track
 */
export function getTrackTags(trackId: string): TaggedTrack | null {
  const tagged = getTaggedTracks();
  return tagged[trackId] || null;
}

/**
 * Save tags for a track
 */
export function saveTrackTags(trackId: string, tags: TrackTags, confirmed: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tagged = getTaggedTracks();
    tagged[trackId] = {
      trackId,
      tags,
      confirmed,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tagged));
  } catch (error) {
    console.error('Error saving tagged tracks to localStorage:', error);
  }
}

/**
 * Confirm tags for a track
 */
export function confirmTrackTags(trackId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const tagged = getTaggedTracks();
    if (tagged[trackId]) {
      tagged[trackId].confirmed = true;
      tagged[trackId].lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tagged));
    }
  } catch (error) {
    console.error('Error confirming track tags:', error);
  }
}

/**
 * Get all untagged track IDs from a list of tracks
 * A track is considered tagged if it has tags (confirmed or not)
 */
export function getUntaggedTracks(tracks: Array<{ id: string }>): string[] {
  const tagged = getTaggedTracks();
  return tracks
    .filter(track => !tagged[track.id])
    .map(track => track.id);
}

/**
 * Clear all tags (for testing/reset)
 */
export function clearAllTags(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
