-- ============================================
-- Fix Foreign Key Constraints - Simpele Oplossing
-- ============================================
-- Verwijder foreign key constraints naar auth.users
-- omdat de applicatie users.json gebruikt i.p.v. Supabase Auth
-- ============================================

-- 1. Fix music_analyses - Verwijder foreign key constraint
ALTER TABLE public.music_analyses 
  DROP CONSTRAINT IF EXISTS music_analyses_user_id_fkey;

-- Maak user_id nullable (als het nog niet nullable is)
ALTER TABLE public.music_analyses 
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Fix playlists - Verwijder foreign key constraint
ALTER TABLE public.playlists 
  DROP CONSTRAINT IF EXISTS playlists_user_id_fkey;

-- Maak user_id nullable (als het nog niet nullable is)
ALTER TABLE public.playlists 
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. Fix profiles - Verwijder foreign key constraint (als die bestaat)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================
-- ✅ Klaar!
-- ============================================
-- Nu kunnen playlists en analyses worden aangemaakt
-- met user_id uit users.json zonder foreign key errors
-- 
-- Let op: De applicatie valideert nu handmatig of de user_id
-- geldig is via users.json, niet via database constraints
-- ============================================
