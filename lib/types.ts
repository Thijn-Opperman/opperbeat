/**
 * Shared type definitions
 * Centralized types to improve type safety and reduce 'any' usage
 */

// Music Analysis types
export interface MusicAnalysis {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  duration: number | null;
  duration_formatted: string;
  bitrate: number | null;
  sample_rate: number | null;
  artwork_public_url: string | null;
  audio_file_public_url: string | null;
  waveform: WaveformData | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export type WaveformData = number[] | { waveform: number[] };

// Helper type guard voor waveform data
export function isWaveformObject(data: WaveformData): data is { waveform: number[] } {
  return typeof data === 'object' && !Array.isArray(data) && 'waveform' in data;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

// Error response type
export interface ErrorResponse {
  error: string;
  details?: string;
  hint?: string;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  tracks: number;
  duration: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

// Mix types
export interface Mix {
  id: string;
  name: string;
  description: string | null;
  venue: string | null;
  event_date: string | null;
  tracks: number;
  duration: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

// Tag suggestion types
export interface TagSuggestion {
  trackId: string;
  energy: string;
  mood: string;
  instrumentation: string[];
  vocalType: 'vocal' | 'instrumental' | 'mixed';
  era: string | null;
}

// Cue point types
export interface CuePoint {
  id: string;
  type: 'intro' | 'drop' | 'outro' | 'custom';
  time: number;
  label?: string;
}

// Smart crate types
export interface SmartCrateRule {
  field: 'bpm' | 'key' | 'genre' | 'energy';
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value: string | number;
}

export interface SmartCrate {
  id: string;
  name: string;
  description: string;
  eventType: 'club' | 'festival' | 'radio' | 'custom';
  rules: SmartCrateRule[];
  trackIds: string[];
}

// Track with energy (for smart crates)
export interface TrackWithEnergy extends MusicAnalysis {
  energy: number;
}

// Music metadata types (from music-metadata library)
export interface MusicMetadata {
  common?: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string[];
    year?: number;
    bpm?: number | number[];
    key?: string | string[];
  };
  format?: {
    bitrate?: number;
    sampleRate?: number;
    duration?: number;
  };
}

// Python analyzer API response
export interface AnalyzerResult {
  song_name?: string;
  duration?: number;
  duration_formatted?: string;
  bpm?: number;
  bpm_confidence?: number;
  key?: string;
  key_full?: string;
  key_confidence?: number;
  bitrate?: number;
  waveform?: WaveformData;
}
