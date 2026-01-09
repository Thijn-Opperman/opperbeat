-- ============================================
-- Fix Foreign Key Constraint voor Development
-- ============================================
-- Voer dit uit in Supabase SQL Editor
-- ============================================

-- Stap 1: Verwijder bestaande constraint
ALTER TABLE public.music_analyses 
DROP CONSTRAINT IF EXISTS music_analyses_user_id_fkey;

-- Stap 2: Maak user_id kolom nullable (voor development/anonymous users)
ALTER TABLE public.music_analyses
ALTER COLUMN user_id DROP NOT NULL;

-- Stap 3: Voeg constraint terug die NULL toestaat
-- Deze constraint geldt alleen als user_id niet NULL is
ALTER TABLE public.music_analyses
ADD CONSTRAINT music_analyses_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- ============================================
-- ✅ Klaar!
-- ============================================
-- Nu kun je records aanmaken met user_id = NULL
-- voor development/anonymous users
-- ============================================
