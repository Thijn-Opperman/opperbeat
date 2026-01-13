/**
 * Local storage helpers for set suggestions and track history
 * This is a proof of concept - stores everything locally without Supabase
 */

export interface TrackSuggestion {
  trackId: string;
  title: string;
  artist: string | null;
  bpm: number | null;
  key: string | null;
  energy: string; // 'low' | 'medium' | 'high'
  cuePoint?: number; // Cue point in seconds
  transitionType?: string; // 'fade', 'cut', 'beatmatch', etc.
  confidence: number; // 0-1, how good this suggestion is
}

export interface SetHistory {
  trackId: string;
  playedAt: string;
  energy: string;
  bpm: number | null;
  key: string | null;
}

export interface SetState {
  currentTrack: string | null; // trackId of currently playing track
  history: SetHistory[];
  suggestions: TrackSuggestion[];
  lastUpdated: string;
}

const STORAGE_KEY = 'opperbeat_set_state';

/**
 * Get current set state from local storage
 */
export function getSetState(): SetState {
  if (typeof window === 'undefined') {
    return {
      currentTrack: null,
      history: [],
      suggestions: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading set state from localStorage:', error);
  }
  
  return {
    currentTrack: null,
    history: [],
    suggestions: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save set state to local storage
 */
export function saveSetState(state: SetState): void {
  if (typeof window === 'undefined') return;
  
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving set state to localStorage:', error);
  }
}

/**
 * Set the currently playing track
 */
export function setCurrentTrack(trackId: string, trackData: {
  energy: string;
  bpm: number | null;
  key: string | null;
}): void {
  const state = getSetState();
  
  // If there was a previous track, add it to history
  if (state.currentTrack) {
    const previousTrack = state.history.find(h => h.trackId === state.currentTrack);
    if (!previousTrack) {
      state.history.push({
        trackId: state.currentTrack,
        playedAt: new Date().toISOString(),
        energy: trackData.energy,
        bpm: trackData.bpm,
        key: trackData.key,
      });
    }
  }
  
  state.currentTrack = trackId;
  saveSetState(state);
}

/**
 * Add track to history
 */
export function addToHistory(trackId: string, trackData: {
  energy: string;
  bpm: number | null;
  key: string | null;
}): void {
  const state = getSetState();
  
  // Don't add duplicates
  if (state.history.some(h => h.trackId === trackId)) {
    return;
  }
  
  state.history.push({
    trackId,
    playedAt: new Date().toISOString(),
    ...trackData,
  });
  
  // Keep only last 20 tracks in history
  if (state.history.length > 20) {
    state.history = state.history.slice(-20);
  }
  
  saveSetState(state);
}

/**
 * Update suggestions
 */
export function updateSuggestions(suggestions: TrackSuggestion[]): void {
  const state = getSetState();
  state.suggestions = suggestions;
  saveSetState(state);
}

/**
 * Clear set state (for testing/reset)
 */
export function clearSetState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get recent track history (last N tracks)
 */
export function getRecentHistory(limit: number = 10): SetHistory[] {
  const state = getSetState();
  return state.history.slice(-limit);
}
