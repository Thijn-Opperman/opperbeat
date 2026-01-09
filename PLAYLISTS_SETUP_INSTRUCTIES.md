# Playlists Setup Instructies

## Probleem: "Fout bij aanmaken van playlist"

Als je deze foutmelding krijgt, betekent dit meestal dat de playlists tabel nog niet bestaat in je Supabase database.

## Oplossing

### Stap 1: Voer het SQL script uit

1. Ga naar je Supabase Dashboard: https://supabase.com/dashboard
2. Selecteer je project
3. Ga naar **SQL Editor** (in het linker menu)
4. Klik op **New Query**
5. Open het bestand `playlists_setup.sql` in je project
6. Kopieer de volledige inhoud
7. Plak het in de SQL Editor
8. Klik op **Run** (of druk op Cmd/Ctrl + Enter)

### Stap 2: Verifieer dat de tabellen zijn aangemaakt

Na het uitvoeren van het script zou je moeten zien:
- ✅ `playlists` tabel
- ✅ `playlist_tracks` tabel
- ✅ RLS policies zijn actief
- ✅ Indexen zijn aangemaakt

### Stap 3: Test opnieuw

1. Refresh je browser
2. Log opnieuw in (als je nog niet ingelogd bent)
3. Ga naar `/playlists`
4. Probeer een nieuwe playlist aan te maken

## Veelvoorkomende fouten

### Fout: "relation 'playlists' does not exist" (42P01)
**Oplossing:** Voer `playlists_setup.sql` uit in Supabase SQL Editor

### Fout: "Authenticatie vereist"
**Oplossing:** 
- Zorg dat je ingelogd bent via `/login`
- Check of je een `session_token` cookie hebt
- Probeer opnieuw in te loggen

### Fout: "foreign key constraint" (23503)
**Oplossing:** 
- Zorg dat je user ID bestaat in `auth.users` tabel
- Of gebruik de demo login om een test gebruiker te maken

## Debugging

Als het nog steeds niet werkt, check de browser console (F12) en de server logs voor meer details. De error message zou nu meer details moeten tonen.

