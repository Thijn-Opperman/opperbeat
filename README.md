# Opperbeat - DJ Music Analysis Platform

Opperbeat is een webapplicatie voor DJ's om muziek te analyseren, organiseren en beheren. De applicatie biedt automatische BPM- en key-detectie, een uitgebreide bibliotheek, playlistfunctionaliteit en een dashboard met statistieken.

## Hoofdfunctionaliteiten

### Muziekanalyse
- Automatische BPM detectie met confidence scores
- Toonsoort detectie (majeur/minor) met Krumhansl-Schmuckler algoritme
- Metadata extractie (titel, artiest, album, genre)
- Album artwork extractie
- Waveform visualisatie data
- Batch analyse voor meerdere bestanden tegelijk

### Bibliotheek & Organisatie
- Centrale bibliotheek met alle geanalyseerde tracks
- Zoeken en filteren op titel, artiest, album, BPM, key, genre
- Grid- en lijstweergave met sorteeropties
- Track detailweergave met volledige metadata
- Playlist builder voor het maken en beheren van playlists
- Mix/set builder voor het voorbereiden van DJ sets
- Track management voor het organiseren van je muziekcollectie

### Dashboard & Analytics
- Interactief dashboard met masonry grid layout
- Widgets met real-time statistieken:
  - Library overzicht met totale tracks en totale speelduur
  - Genre breakdown met visuele grafieken
  - BPM/key matching statistieken
  - Set lengte calculator
  - Tag suggesties
  - Set suggesties op basis van BPM/key matching
  - Cue points overzicht
- Activity timeline voor overzicht van recente activiteit
- Quick actions voor snelle toegang tot belangrijke functies

### Gebruikersfunctionaliteiten
- Email/password authenticatie (login en registratie)
- Profielbeheer
- Multi-language support (Nederlands en Engels)
- Light/Dark theme met system preference detectie

### Cloud Opslag
- Supabase integratie voor veilige cloud opslag
- PostgreSQL database voor alle analyses
- Gescheiden storage buckets voor audio en artwork

## Quick Start

### Development Setup

1. Clone het repository:
   ```bash
   git clone <repository-url>
   cd opperbeat
   ```

2. Installeer dependencies:
   ```bash
   npm install
   ```

3. Maak een `.env.local` bestand aan met de volgende variabelen:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
   NEXT_PUBLIC_PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
   ```

4. Start de development server:
   ```bash
   npm run dev
   ```

5. Open de applicatie in je browser op `http://localhost:3000`

## Project Structuur

```
opperbeat/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── analyses/           # CRUD voor analyses
│   │   ├── analytics/          # Statistieken endpoints
│   │   ├── analyze/            # Analyse endpoints
│   │   ├── auth/               # Authenticatie endpoints
│   │   ├── playlists/          # Playlist endpoints
│   │   └── profile/            # Profiel endpoints
│   ├── analytics/              # Analytics pagina
│   ├── analyze/                # Analyse pagina
│   ├── components/             # React componenten
│   ├── help/                   # Help pagina
│   ├── library/                # Bibliotheek pagina
│   ├── login/                  # Login pagina
│   ├── mixes/                  # Mixes pagina
│   ├── playlists/              # Playlists pagina
│   ├── profile/                # Profiel pagina
│   ├── register/               # Registratie pagina
│   ├── sound/                  # Sound settings pagina
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard/home pagina
│   └── providers.tsx           # Context providers
├── lib/                         # Utility functies
│   ├── auth-context.tsx        # Auth context
│   ├── auth-guard.tsx          # Route protection
│   ├── auth-helpers.ts         # Auth utilities
│   ├── extract-artwork.ts      # Artwork extractie
│   ├── i18n-context.tsx        # i18n context
│   ├── i18n.ts                 # Vertalingen
│   ├── storage-helpers.ts      # Storage utilities
│   ├── supabase.ts             # Supabase client
│   └── theme-context.tsx       # Theme context
├── api/                         # Python FastAPI (Railway)
│   └── analyze.py              # Audio analyse API
├── python/                      # Python modules
│   └── music_analyzer.py       # Core analyse logica
├── public/                      # Static assets
│   ├── favicon.ico
│   └── opperbeat logo.png
├── sql/                         # Database scripts
│   ├── supabase_setup.sql      # Hoofd schema
│   ├── playlists_setup.sql     # Playlist schema
│   ├── mixes_setup.sql         # Mixes schema
│   ├── storage_policies.sql    # Storage policies
│   └── fix_foreign_keys_simple.sql  # Foreign key fixes
└── docs/                        # Documentatie (zie hieronder)
```

## Database Setup

### Supabase Database Schema

1. Maak een Supabase project:
   - Ga naar [supabase.com](https://supabase.com)
   - Maak een nieuw project aan
   - Noteer je project URL en API keys

2. Voer de SQL scripts uit in de Supabase SQL Editor:
   - `sql/supabase_setup.sql` - Database schema en tabellen
   - `sql/playlists_setup.sql` - Playlist schema
   - `sql/mixes_setup.sql` - Mixes schema
   - `sql/storage_policies.sql` - Storage bucket policies
   - `sql/fix_foreign_keys_simple.sql` - Foreign key fixes (indien nodig)

3. Maak de Storage Buckets aan:
   - Ga naar Storage in het Supabase Dashboard
   - Maak bucket `audio-files` aan (public: false)
   - Maak bucket `album-artwork` aan (public: true)

4. Voor een volledige setup verificatie, zie `docs/VERIFICATIE_CHECKLIST.md`

## Deployment

### Vercel Deployment (Frontend)

Voor complete instructies, zie `docs/VERCEL_DEPLOYMENT.md`.

Kort samengevat:
1. Push de code naar GitHub
2. Import het project in Vercel
3. Voeg de environment variables toe (zie `docs/VERCEL_DEPLOYMENT.md` voor details)
4. Deploy

### Railway Deployment (Python API)

Voor complete instructies, zie `docs/RAILWAY_DEPLOYMENT.md`.

Kort samengevat:
1. Maak een Railway account aan
2. Deploy vanuit GitHub repository
3. Railway detecteert automatisch de Python service
4. Kopieer de Railway URL naar de Vercel environment variables

## Environment Variables

### Verplicht voor Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Private service role key (alleen server-side)

### Optioneel (Python API)

- `PYTHON_API_URL` - Railway Python API URL
- `NEXT_PUBLIC_PYTHON_API_URL` - Public Railway API URL

## Documentatie

Alle documentatie is beschikbaar in de `docs/` folder:

### Project Documentatie
- **`docs/PROCESVERSLAG.md`** - Volledig procesverslag van het project met alle ontwikkelfasen, beslissingen en reflecties

### Setup & Deployment
- **`docs/VERCEL_DEPLOYMENT.md`** - Complete Vercel deployment guide voor de frontend
- **`docs/RAILWAY_DEPLOYMENT.md`** - Railway deployment guide voor de Python API
- **`docs/VERIFICATIE_CHECKLIST.md`** - Checklist voor verificatie van de complete setup
- **`docs/PLAYLISTS_SETUP_INSTRUCTIES.md`** - Instructies voor playlist setup en gebruik

## Technologie Stack

### Frontend
- Next.js 16.1.1 (App Router)
- React 19.2.3, TypeScript 5.x
- Tailwind CSS 4
- Lucide React (icons)
- Recharts (charts)
- React Context API (state management)

### Backend
- Next.js API Routes
- Python FastAPI (voor grote bestanden)
- Supabase (PostgreSQL database)
- Supabase Storage
- Supabase Auth

### Audio Processing
- Python: librosa, numpy, mutagen
- Node.js: music-metadata, music-tempo, realtime-bpm-analyzer
- FFmpeg: ffmpeg-static, fluent-ffmpeg

### Deployment
- Frontend: Vercel
- Python API: Railway
- Database: Supabase Cloud

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build voor productie
npm run start        # Start productie server

# Linting
npm run lint         # Run ESLint
```

## Testing & Debugging

### Test Endpoints

Voor setup verificatie zijn de volgende endpoints beschikbaar:
- **`GET /api/test-supabase`** - Test Supabase connectie, database schema en storage buckets
- **`GET /api/debug-supabase`** - Uitgebreide diagnostic tool voor Supabase problemen

Deze endpoints zijn bedoeld voor development en kunnen gebruikt worden om te controleren of alles correct is ingesteld. Zie `docs/VERIFICATIE_CHECKLIST.md` voor meer details.

## Over dit Project

Opperbeat is een full-stack webapplicatie ontwikkeld als schoolopdracht. De applicatie demonstreert moderne web development technieken en best practices:

- **Frontend Development**: Next.js 16 met App Router, React 19, TypeScript, en Tailwind CSS
- **Backend Development**: Next.js API Routes en Python FastAPI voor audio processing
- **Database & Storage**: Supabase (PostgreSQL) met Row Level Security en cloud storage
- **Authentication**: Supabase Auth met email/password authenticatie
- **Cloud Deployment**: Vercel voor frontend, Railway voor Python API
- **Audio Processing**: Geavanceerde BPM- en key-detectie met Python (librosa) en Node.js libraries
- **User Experience**: Multi-language support (NL/EN), dark/light theme, responsive design

### Hoofddoelen

De applicatie is ontworpen om DJ's te helpen bij:
- Het analyseren van muziekbestanden met automatische BPM- en key-detectie
- Het organiseren van hun muziekcollectie in een centrale bibliotheek
- Het voorbereiden van mixes en sets met intelligente suggesties
- Het krijgen van inzicht in hun collectie via analytics en statistieken

Voor een volledig overzicht van het ontwikkelproces, technische beslissingen en reflecties, zie `docs/PROCESVERSLAG.md`.

---

**Versie 1.0** - Januari 2025
