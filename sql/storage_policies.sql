-- ============================================
-- Storage Policies Setup - Alles in één keer
-- ============================================
-- Voer dit uit in Supabase SQL Editor
-- ============================================

-- Verwijder bestaande policies (als je ze opnieuw wilt maken)
DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view artwork" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload artwork" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own artwork" ON storage.objects;

-- ============================================
-- POLICIES VOOR audio-files BUCKET
-- ============================================

-- Policy 1: Gebruikers kunnen hun eigen audio bestanden zien
CREATE POLICY "Users can view own audio files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Gebruikers kunnen audio bestanden uploaden naar hun eigen folder
CREATE POLICY "Users can upload own audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Gebruikers kunnen hun eigen audio bestanden verwijderen
CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES VOOR album-artwork BUCKET
-- ============================================

-- Policy 1: Iedereen kan artwork zien (public bucket)
CREATE POLICY "Anyone can view artwork"
ON storage.objects FOR SELECT
USING (bucket_id = 'album-artwork');

-- Policy 2: Geauthenticeerde gebruikers kunnen artwork uploaden
CREATE POLICY "Authenticated users can upload artwork"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'album-artwork' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Gebruikers kunnen hun eigen artwork verwijderen
CREATE POLICY "Users can delete own artwork"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'album-artwork' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- ✅ KLAAR!
-- ============================================
-- Check in Storage → Policies of alle 6 policies zijn aangemaakt
-- ============================================



