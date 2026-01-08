# ✅ Verificatie Checklist - Supabase Setup

Gebruik deze checklist om te controleren of alles correct is ingesteld.

---

## 📋 1. Environment Variables

### Check: `.env.local` bestand bestaat
- [ ] Bestand `.env.local` bestaat in de root directory

### Check: Environment variables zijn ingesteld
Open `.env.local` en controleer:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is ingevuld
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is ingevuld
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ingevuld

**Verificatie:**
```bash
# Check of server deze variabelen ziet (na herstart)
# Start server: npm run dev
# Open: http://localhost:3000/api/test-supabase
# Check of "environment" allemaal "true" toont
```

---

## 📋 2. Database Schema

### Check: Database tabellen bestaan
1. Ga naar [Supabase Dashboard](https://supabase.com/dashboard/project/kitirbgzeiwupoyovcra)
2. Klik op **Table Editor** in de sidebar
3. Controleer:
   - [ ] Tabel `music_analyses` bestaat
   - [ ] Tabel `profiles` bestaat

**Als tabellen niet bestaan:**
1. Ga naar **SQL Editor** → **New Query**
2. Open `supabase_setup.sql`
3. Kopieer volledige inhoud en plak in SQL Editor
4. Klik **Run**
5. Check opnieuw in Table Editor

---

## 📋 3. Storage Buckets

### Check: Storage buckets bestaan
1. Ga naar **Storage** in Supabase Dashboard
2. Controleer:
   - [ ] Bucket `audio-files` bestaat
   - [ ] Bucket `album-artwork` bestaat

**Als buckets niet bestaan:**
1. Klik **New bucket**
2. **Bucket 1**: `audio-files`
   - Public: ❌ Nee
   - File size limit: 50MB
3. **Bucket 2**: `album-artwork`
   - Public: ✅ Ja
   - File size limit: 5MB

### Check: Storage policies zijn ingesteld
1. Ga naar **Storage** → **Policies**
2. Check of je **6 policies** ziet:
   - [ ] 3 policies voor `audio-files` (SELECT, INSERT, DELETE)
   - [ ] 3 policies voor `album-artwork` (SELECT, INSERT, DELETE)

**Als policies niet bestaan:**
1. Ga naar **SQL Editor** → **New Query**
2. Open `storage_policies.sql`
3. Kopieer volledige inhoud en plak in SQL Editor
4. Klik **Run**

---

## 📋 4. Dependencies

### Check: NPM packages zijn geïnstalleerd
```bash
# Run in terminal:
npm list @supabase/supabase-js @supabase/ssr sharp
```

- [ ] `@supabase/supabase-js` is geïnstalleerd
- [ ] `@supabase/ssr` is geïnstalleerd
- [ ] `sharp` is geïnstalleerd

**Als niet geïnstalleerd:**
```bash
npm install @supabase/supabase-js @supabase/ssr sharp
```

---

## 📋 5. Code Bestanden

### Check: Lib bestanden bestaan
- [ ] `lib/supabase.ts` bestaat
- [ ] `lib/extract-artwork.ts` bestaat
- [ ] `lib/storage-helpers.ts` bestaat
- [ ] `lib/auth-helpers.ts` bestaat

### Check: API routes bestaan
- [ ] `app/api/analyze/route.ts` bestaat (geüpdatet met opslag)
- [ ] `app/api/analyses/route.ts` bestaat
- [ ] `app/api/analyses/[id]/route.ts` bestaat
- [ ] `app/api/test-supabase/route.ts` bestaat

---

## 📋 6. Verbinding Test

### Test: Supabase verbinding
1. Start development server: `npm run dev`
2. Open: http://localhost:3000/api/test-supabase
3. Check response:
   - [ ] Status: `"success"` of `"warning"` (niet `"error"`)
   - [ ] Environment variables: alle `true`
   - [ ] Database connected: `true`
   - [ ] Database table exists: `true`
   - [ ] Storage buckets exist: beide `true`

**Als er errors zijn:**
- Check de error messages in de response
- Volg de instructies in de errors

---

## 📋 7. Frontend Functionaliteit

### Check: Analyse pagina heeft checkbox
1. Ga naar http://localhost:3000/analyze
2. Controleer:
   - [ ] Checkbox "Opslaan in database na analyse" is zichtbaar
   - [ ] Checkbox is standaard aangevinkt

### Test: Analyse met opslaan
1. Upload een MP3 bestand
2. Checkbox is aangevinkt
3. Wacht tot analyse klaar is
4. Open browser console (F12 → Console tab)
5. Zoek naar: `✅ Analyse opgeslagen in database met ID: ...`
   - [ ] Zie je deze melding?

**Als je geen melding ziet:**
- Check console voor errors
- Check server terminal logs voor errors
- Check of checkbox was aangevinkt

---

## 📋 8. Database Verificatie

### Check: Record in database
1. Ga naar Supabase Dashboard → **Table Editor** → `music_analyses`
2. Controleer:
   - [ ] Er staat een record (na test upload)
   - [ ] Record heeft alle velden ingevuld (title, bpm, key, etc.)
   - [ ] `audio_file_url` is ingevuld
   - [ ] `artwork_url` is ingevuld (als artwork beschikbaar was)

### Check: Storage bestanden
1. Ga naar **Storage** → `audio-files`
2. Controleer:
   - [ ] Bestand staat in bucket
   - [ ] Path structuur: `{userId}/{fileId}/{filename}`
3. Ga naar **Storage** → `album-artwork`
4. Controleer (als artwork beschikbaar was):
   - [ ] Artwork bestand staat in bucket

---

## 📋 9. API Routes Test

### Test: Alle analyses ophalen
```bash
curl http://localhost:3000/api/analyses
```
- [ ] Response bevat array van analyses (of lege array)
- [ ] Geen errors

### Test: Specifieke analyse ophalen
```bash
# Vervang [ID] met een echt ID uit database
curl http://localhost:3000/api/analyses/[ID]
```
- [ ] Response bevat analyse object
- [ ] Alle data is aanwezig

---

## 🔴 Problemen Oplossen

### Probleem: "Missing Supabase environment variables"
**Oplossing:**
1. Check of `.env.local` bestaat
2. Check of variabelen correct zijn gespeld
3. Herstart development server

### Probleem: "Table does not exist"
**Oplossing:**
1. Voer `supabase_setup.sql` uit in SQL Editor
2. Check Table Editor of tabel nu bestaat

### Probleem: "Bucket not found"
**Oplossing:**
1. Maak buckets aan in Storage
2. Check exacte namen: `audio-files` en `album-artwork`

### Probleem: "Row Level Security policy violation"
**Oplossing:**
1. Voer `storage_policies.sql` uit in SQL Editor
2. Check Storage → Policies of ze bestaan

### Probleem: Analyse wordt niet opgeslagen
**Oplossing:**
1. Check of checkbox was aangevinkt
2. Check browser console voor errors
3. Check server terminal logs
4. Check of database schema is uitgevoerd
5. Test verbinding: http://localhost:3000/api/test-supabase

---

## ✅ Alles Werkt?

Als alle items hierboven zijn gecheckt:
- ✅ Environment variables ingesteld
- ✅ Database schema uitgevoerd
- ✅ Storage buckets aangemaakt
- ✅ Storage policies ingesteld
- ✅ Verbinding test werkt
- ✅ Analyse wordt opgeslagen
- ✅ Data verschijnt in database en storage

**Dan is alles correct ingesteld!** 🎉

---

## 📞 Hulp Nodig?

Als je problemen hebt:
1. Check de error message
2. Kijk in browser console (F12)
3. Kijk in server terminal logs
4. Test verbinding: http://localhost:3000/api/test-supabase
5. Check deze checklist opnieuw

**Belangrijke bestanden:**
- `supabase_setup.sql` - Database schema
- `storage_policies.sql` - Storage policies
- `.env.local` - Environment variables

