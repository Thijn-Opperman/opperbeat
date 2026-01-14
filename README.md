# 🎵 Opperbeat - DJ Music Analysis Platform

Een moderne, professionele webapplicatie voor DJ's om muziek te analyseren, organiseren en beheren. Opperbeat biedt automatische BPM- en key-detectie, een uitgebreide bibliotheek, playlistfunctionaliteit en een dashboard met real-time statistieken.

## ✨ Hoofdfunctionaliteiten

### 🎯 Muziekanalyse
- **BPM Detectie** - Automatische BPM analyse met confidence scores
- **Key Detectie** - Toonsoort detectie (majeur/minor) met Krumhansl-Schmuckler algoritme
- **Metadata Extractie** - Automatische extractie van titel, artiest, album, genre
- **Artwork Extractie** - Automatische extractie van album artwork
- **Waveform Visualisatie** - Audio waveform data voor visualisatie
- **Batch Analyse** - Analyseer meerdere bestanden tegelijk

### 📚 Bibliotheek & Organisatie
- **Muziekbibliotheek** - Centrale bibliotheek met alle geanalyseerde tracks
- **Zoeken & Filteren** - Zoek op titel, artiest, album, BPM, key, genre
- **Playlist Builder** - Maak en beheer playlists
- **Track Management** - Organiseer en beheer je muziekcollectie

### 📊 Dashboard & Analytics
- **Widget Dashboard** - Overzichtelijk dashboard met verschillende widgets
- **Real-time Statistieken** - Library insights, genre breakdown, BPM/key matching
- **Activity Timeline** - Overzicht van activiteit over tijd
- **Quick Actions** - Snelle toegang tot belangrijke functies

### 🔐 Gebruikersfunctionaliteiten
- **Authenticatie** - Email/password login en registratie
- **Profielbeheer** - Persoonlijke profielinstellingen
- **Multi-language** - Ondersteuning voor Nederlands en Engels
- **Theme Support** - Light/Dark theme met system preference

### 💾 Cloud Opslag
- **Supabase Integratie** - Veilige cloud opslag voor audio en metadata
- **Database Opslag** - PostgreSQL database voor alle analyses
- **Storage Buckets** - Gescheiden opslag voor audio en artwork

## 🚀 Quick Start

### Development Setup

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd opperbeat
   ```

2. **Installeer dependencies:**
   ```bash
   npm install
   ```

3. **Maak `.env.local` bestand:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
   NEXT_PUBLIC_PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structuur

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

## 🗄️ Database Setup

### Supabase Database Schema

1. **Maak Supabase project:**
   - Ga naar [supabase.com](https://supabase.com)
   - Maak een nieuw project
   - Noteer je project URL en API keys

2. **Voer SQL scripts uit in Supabase SQL Editor:**
   - `sql/supabase_setup.sql` - Database schema en tabellen
   - `sql/playlists_setup.sql` - Playlist schema
   - `sql/mixes_setup.sql` - Mixes schema
   - `sql/storage_policies.sql` - Storage bucket policies
   - `sql/fix_foreign_keys_simple.sql` - Foreign key fixes (indien nodig)

3. **Maak Storage Buckets:**
   - Ga naar Storage in Supabase Dashboard
   - Maak bucket: `audio-files` (public: false)
   - Maak bucket: `album-artwork` (public: true)

4. **Check checklist:** Zie `docs/VERIFICATIE_CHECKLIST.md` voor volledige setup verificatie

## 🚀 Deployment

### Vercel Deployment (Frontend)

Zie `VERCEL_DEPLOYMENT.md` voor complete instructies.

**Quick steps:**
1. Push code naar GitHub
2. Import project in Vercel
3. Voeg environment variables toe (zie `SUPABASE_VERCEL_QUICK.md`)
4. Deploy

### Railway Deployment (Python API)

Zie `RAILWAY_DEPLOYMENT.md` voor complete instructies.

**Quick steps:**
1. Maak Railway account
2. Deploy from GitHub repo
3. Railway detecteert automatisch Python service
4. Kopieer Railway URL naar Vercel environment variables

## 🔧 Environment Variables

### Verplicht voor Supabase:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Private service role key (server-side only)

### Optioneel (Python API):

- `PYTHON_API_URL` - Railway Python API URL
- `NEXT_PUBLIC_PYTHON_API_URL` - Public Railway API URL

**Zie `SUPABASE_VERCEL_QUICK.md` voor exacte waarden en setup.**

## 📚 Documentatie

### Setup & Deployment Guides
- **`docs/VERCEL_DEPLOYMENT.md`** - Complete Vercel deployment guide
- **`docs/RAILWAY_DEPLOYMENT.md`** - Railway Python API deployment guide
- **`docs/SUPABASE_VERCEL_QUICK.md`** - Quick reference voor Supabase environment variables
- **`docs/VERIFICATIE_CHECKLIST.md`** - Checklist voor verificatie van setup
- **`docs/PLAYLISTS_SETUP_INSTRUCTIES.md`** - Playlist setup instructies
- **`docs/VERCEL_BUILD_FIX.md`** - Troubleshooting voor Vercel build issues

## 🛠️ Technologie Stack

### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **UI:** React 19.2.3, TypeScript 5.x
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Context API

### Backend
- **API:** Next.js API Routes
- **Python API:** FastAPI (voor grote bestanden)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth

### Audio Processing
- **Python:** librosa, numpy, mutagen
- **Node.js:** music-metadata, music-tempo, realtime-bpm-analyzer
- **FFmpeg:** ffmpeg-static, fluent-ffmpeg

### Deployment
- **Frontend:** Vercel
- **Python API:** Railway
- **Database:** Supabase Cloud

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build voor productie
npm run start        # Start productie server

# Linting
npm run lint         # Run ESLint
```

## 🧪 Testing

Test endpoints:
- `/api/test-supabase` - Test Supabase connectie
- `/api/debug-supabase` - Debug Supabase setup

## 🎓 Schoolopdracht Informatie

Dit project is ontwikkeld als schoolopdracht. De applicatie demonstreert:

- **Moderne Web Development:** Next.js, React, TypeScript
- **Full-Stack Development:** Frontend, Backend, Database integratie
- **Cloud Services:** Supabase, Vercel, Railway
- **Audio Processing:** Python libraries voor muziekanalyse
- **UI/UX Design:** Responsive design, dark/light themes, multi-language support

### Project Doelen
- Demonstreren van moderne web development technieken
- Integratie van verschillende services en APIs
- Audio processing en analyse
- Database design en management
- User experience en interface design

---

**Gemaakt met ❤️ voor muziek analyse**

**Versie:** 1.0  
**Laatste update:** 2025-01-09
