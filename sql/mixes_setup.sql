-- ============================================
-- Mixes & Sets Database Setup Script
-- ============================================
-- Voer dit script uit in Supabase SQL Editor
-- ============================================

-- 1. Mixes tabel
-- ============================================
CREATE TABLE IF NOT EXISTS public.mixes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basis informatie
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  image_url TEXT, -- Path in storage (optioneel)
  image_public_url TEXT, -- Public URL van image
  
  -- Mix specifieke velden
  venue TEXT, -- Locatie waar mix is opgenomen/gedraaid
  event_date DATE, -- Datum van het evenement
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexen
CREATE INDEX IF NOT EXISTS idx_mixes_user_id ON public.mixes(user_id);
CREATE INDEX IF NOT EXISTS idx_mixes_created_at ON public.mixes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mixes_event_date ON public.mixes(event_date DESC);

-- RLS policies
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mixes" ON public.mixes;
DROP POLICY IF EXISTS "Users can insert own mixes" ON public.mixes;
DROP POLICY IF EXISTS "Users can update own mixes" ON public.mixes;
DROP POLICY IF EXISTS "Users can delete own mixes" ON public.mixes;

CREATE POLICY "Users can view own mixes" ON public.mixes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mixes" ON public.mixes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mixes" ON public.mixes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mixes" ON public.mixes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. Mix Tracks (many-to-many relatie)
-- ============================================
CREATE TABLE IF NOT EXISTS public.mix_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mix_id UUID REFERENCES public.mixes(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.music_analyses(id) ON DELETE CASCADE NOT NULL,
  
  -- Volgorde in mix
  position INTEGER NOT NULL DEFAULT 0,
  
  -- Mix specifieke velden
  transition_type TEXT, -- Bijv. "fade", "cut", "beatmatch", etc.
  transition_start_time DECIMAL(10,2), -- Starttijd van transition in seconden
  notes TEXT, -- Notities over deze track in de mix
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unieke constraint: een track kan maar 1x in een mix voorkomen
  UNIQUE(mix_id, analysis_id)
);

-- Indexen
CREATE INDEX IF NOT EXISTS idx_mix_tracks_mix_id ON public.mix_tracks(mix_id);
CREATE INDEX IF NOT EXISTS idx_mix_tracks_analysis_id ON public.mix_tracks(analysis_id);
CREATE INDEX IF NOT EXISTS idx_mix_tracks_position ON public.mix_tracks(mix_id, position);

-- RLS policies
ALTER TABLE public.mix_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mix tracks" ON public.mix_tracks;
DROP POLICY IF EXISTS "Users can insert own mix tracks" ON public.mix_tracks;
DROP POLICY IF EXISTS "Users can update own mix tracks" ON public.mix_tracks;
DROP POLICY IF EXISTS "Users can delete own mix tracks" ON public.mix_tracks;

CREATE POLICY "Users can view own mix tracks" ON public.mix_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE mixes.id = mix_tracks.mix_id 
      AND mixes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own mix tracks" ON public.mix_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE mixes.id = mix_tracks.mix_id 
      AND mixes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own mix tracks" ON public.mix_tracks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE mixes.id = mix_tracks.mix_id 
      AND mixes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own mix tracks" ON public.mix_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.mixes 
      WHERE mixes.id = mix_tracks.mix_id 
      AND mixes.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. Trigger voor updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_mixes_updated_at ON public.mixes;
CREATE TRIGGER update_mixes_updated_at
  BEFORE UPDATE ON public.mixes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. View voor mix statistieken
-- ============================================
CREATE OR REPLACE VIEW public.mix_stats AS
SELECT 
  m.id,
  m.user_id,
  m.name,
  COUNT(mt.id) as track_count,
  COALESCE(SUM(ma.duration_seconds), 0) as total_duration_seconds,
  m.created_at,
  m.updated_at,
  m.event_date
FROM public.mixes m
LEFT JOIN public.mix_tracks mt ON mt.mix_id = m.id
LEFT JOIN public.music_analyses ma ON ma.id = mt.analysis_id
GROUP BY m.id, m.user_id, m.name, m.created_at, m.updated_at, m.event_date;

-- ============================================
-- ✅ Setup compleet!
-- ============================================
