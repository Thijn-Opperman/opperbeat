-- ============================================
-- Migreer Oude Analyses naar Huidige Gebruiker
-- ============================================
-- Dit script update alle analyses zonder user_id
-- of met een oude user_id naar de huidige gebruiker
-- ============================================
-- 
-- VERVANG 'YOUR_USER_ID_HERE' met je user ID uit users.json
-- Je user ID is: 9af1bbaf-d676-43ce-9c0e-1064f8dcec26
-- ============================================

-- Optie 1: Update alle analyses zonder user_id naar jouw user_id
UPDATE public.music_analyses
SET user_id = '9af1bbaf-d676-43ce-9c0e-1064f8dcec26'::uuid
WHERE user_id IS NULL;

-- Optie 2: Update alle analyses (ook die met een andere user_id)
-- UNCOMMENT de volgende regel als je ALLE oude nummers naar jouw account wilt verplaatsen:
-- UPDATE public.music_analyses
-- SET user_id = '9af1bbaf-d676-43ce-9c0e-1064f8dcec26'::uuid
-- WHERE user_id IS NOT NULL AND user_id != '9af1bbaf-d676-43ce-9c0e-1064f8dcec26'::uuid;

-- ============================================
-- ✅ Migratie compleet!
-- ============================================
-- Alle oude nummers zijn nu gekoppeld aan jouw account
-- ============================================

