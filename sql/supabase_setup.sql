-- ============================================
-- Supabase Database Setup Script
-- ============================================
-- Voer dit script uit in Supabase SQL Editor
-- Ga naar: Dashboard > SQL Editor > New Query
-- ============================================

-- 1. Profiles tabel (voor extra gebruikersinformatie)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies voor profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verwijder bestaande policies als ze al bestaan
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. Music Analyses tabel
-- ============================================
CREATE TABLE IF NOT EXISTS public.music_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basis informatie
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  
  -- Storage URLs
  audio_file_url TEXT, -- Path in audio-files bucket
  audio_file_public_url TEXT, -- Signed URL (voor download)
  artwork_url TEXT, -- Path in album-artwork bucket (optioneel)
  artwork_public_url TEXT, -- Public URL van artwork
  
  -- Duur
  duration_seconds INTEGER NOT NULL,
  duration_formatted TEXT NOT NULL,
  
  -- Analyse data
  bpm INTEGER,
  bpm_confidence DECIMAL(3,2),
  key TEXT,
  key_confidence DECIMAL(3,2),
  
  -- Metadata
  artist TEXT,
  album TEXT,
  genre TEXT,
  bitrate INTEGER,
  sample_rate INTEGER,
  year INTEGER,
  
  -- Waveform data (JSONB - klein genoeg voor database)
  waveform JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexen voor snelle queries
CREATE INDEX IF NOT EXISTS idx_music_analyses_user_id ON public.music_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_music_analyses_created_at ON public.music_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_analyses_bpm ON public.music_analyses(bpm);
CREATE INDEX IF NOT EXISTS idx_music_analyses_key ON public.music_analyses(key);
CREATE INDEX IF NOT EXISTS idx_music_analyses_artist ON public.music_analyses(artist);
CREATE INDEX IF NOT EXISTS idx_music_analyses_title ON public.music_analyses(title);

-- Full-text search index (optioneel)
CREATE INDEX IF NOT EXISTS idx_music_analyses_search ON public.music_analyses USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(artist, '') || ' ' || COALESCE(album, ''))
);

-- RLS policies voor music_analyses
ALTER TABLE public.music_analyses ENABLE ROW LEVEL SECURITY;

-- Verwijder bestaande policies als ze al bestaan
DROP POLICY IF EXISTS "Users can view own analyses" ON public.music_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.music_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.music_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.music_analyses;

CREATE POLICY "Users can view own analyses" ON public.music_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.music_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.music_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.music_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Helper functie voor storage paths (optioneel)
-- ============================================
CREATE OR REPLACE FUNCTION get_storage_path(
  user_id UUID,
  file_id UUID,
  filename TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN user_id::text || '/' || file_id::text || '/' || filename;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 4. Trigger voor updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger voor profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger voor music_analyses
DROP TRIGGER IF EXISTS update_music_analyses_updated_at ON public.music_analyses;
CREATE TRIGGER update_music_analyses_updated_at
  BEFORE UPDATE ON public.music_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ Setup compleet!
-- ============================================
-- Volgende stappen:
-- 1. Maak storage buckets aan in Storage tab
-- 2. Configureer storage policies (zie SUPABASE_STORAGE_SETUP_PLAN.md)
-- ============================================

