-- ============================================
-- Playlists Database Setup Script
-- ============================================
-- Voer dit script uit in Supabase SQL Editor
-- ============================================

-- 1. Playlists tabel
-- ============================================
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basis informatie
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  image_url TEXT, -- Path in storage (optioneel)
  image_public_url TEXT, -- Public URL van image
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexen
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON public.playlists(created_at DESC);

-- RLS policies
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can insert own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete own playlists" ON public.playlists;

CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. Playlist Tracks (many-to-many relatie)
-- ============================================
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES public.music_analyses(id) ON DELETE CASCADE NOT NULL,
  
  -- Volgorde in playlist
  position INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unieke constraint: een track kan maar 1x in een playlist voorkomen
  UNIQUE(playlist_id, analysis_id)
);

-- Indexen
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_analysis_id ON public.playlist_tracks(analysis_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON public.playlist_tracks(playlist_id, position);

-- RLS policies
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own playlist tracks" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can insert own playlist tracks" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can update own playlist tracks" ON public.playlist_tracks;
DROP POLICY IF EXISTS "Users can delete own playlist tracks" ON public.playlist_tracks;

CREATE POLICY "Users can view own playlist tracks" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own playlist tracks" ON public.playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own playlist tracks" ON public.playlist_tracks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own playlist tracks" ON public.playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. Trigger voor updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. View voor playlist statistieken
-- ============================================
CREATE OR REPLACE VIEW public.playlist_stats AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  COUNT(pt.id) as track_count,
  COALESCE(SUM(ma.duration_seconds), 0) as total_duration_seconds,
  p.created_at,
  p.updated_at
FROM public.playlists p
LEFT JOIN public.playlist_tracks pt ON pt.playlist_id = p.id
LEFT JOIN public.music_analyses ma ON ma.id = pt.analysis_id
GROUP BY p.id, p.user_id, p.name, p.created_at, p.updated_at;

-- ============================================
-- ✅ Setup compleet!
-- ============================================

