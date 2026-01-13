/**
 * Application-wide constants
 * Centralized configuration to avoid magic numbers and improve maintainability
 */

// Pagination limits
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  LIBRARY_PAGE_LIMIT: 20,
  WIDGET_LIMIT: 100,
  LARGE_WIDGET_LIMIT: 500,
  SET_BUILDER_LIMIT: 200,
  TAG_SUGGESTIONS_LIMIT: 50,
  SMALL_WIDGET_LIMIT: 10,
  MINIMAL_LIMIT: 1,
} as const;

// File size limits (in bytes)
export const FILE_LIMITS = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  LARGE_FILE_THRESHOLD_MB: 5,
  MEDIUM_FILE_THRESHOLD_MB: 3,
} as const;

// Audio analysis constants
export const AUDIO_ANALYSIS = {
  DEFAULT_SAMPLE_RATE: 44100,
  OPTIMIZED_SAMPLE_RATE: 22050,
  DEFAULT_WAVEFORM_SAMPLES: 5000,
  OPTIMIZED_WAVEFORM_SAMPLES: 2000,
  MAX_DURATION_SECONDS: 120, // 2 minutes for large files
  SEGMENTS_FOR_ENERGY_ANALYSIS: 100,
} as const;

// BPM matching tolerance
export const BPM_TOLERANCE = 5; // ±5 BPM for matching

// Time constants
export const TIME = {
  ONE_HOUR_MS: 1000 * 60 * 60,
  ONE_DAY_MS: 1000 * 60 * 60 * 24,
  SIGNED_URL_EXPIRY_SECONDS: 3600, // 1 hour
} as const;

// UI constants
export const UI = {
  ANIMATION_DELAY_BASE: 0.03, // seconds
  MIN_BAR_HEIGHT: 0.5, // pixels for waveform
} as const;

// API timeout (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds

// Supported audio file types
export const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a'] as const;
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a'] as const;
