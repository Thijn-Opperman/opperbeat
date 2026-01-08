# 🎵 OpperBeat - Music Analysis Platform

Een moderne Next.js applicatie voor het analyseren en opslaan van muziek met BPM, key detectie, en Supabase database integratie.

## ✨ Features

- 🎯 **BPM Detectie** - Automatische BPM analyse met confidence scores
- 🎹 **Key Detectie** - Toonsoort detectie (majeur/minor) met Krumhansl-Schmuckler algoritme
- 💾 **Database Opslag** - Supabase integratie voor het opslaan van analyses, audio bestanden, en artwork
- 📊 **Waveform Visualisatie** - Audio waveform data voor visualisatie
- 🖼️ **Artwork Extractie** - Automatische extractie van album artwork
- 🚀 **Serverless** - Deployed op Vercel met Python API op Railway

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
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── analyze/       # Audio analyse endpoints
│   │   ├── analyses/      # Analyses CRUD endpoints
│   │   └── auth/          # Authentication endpoints
│   ├── analyze/           # Analyse pagina
│   └── components/        # React componenten
├── lib/                   # Utility functies
│   ├── supabase.ts       # Supabase client
│   ├── storage-helpers.ts # Storage upload helpers
│   └── auth-helpers.ts   # Authentication helpers
├── python/                # Python analyzer module
│   └── music_analyzer.py # Core analyzer logica
├── api/                   # FastAPI endpoint (Railway)
│   └── analyze.py        # FastAPI app
└── sql/                   # Database schema
    ├── supabase_setup.sql
    ├── storage_policies.sql
    └── fix_foreign_key.sql
```

## 🗄️ Database Setup

### Supabase Database Schema

1. **Voer SQL scripts uit in Supabase SQL Editor:**
   - `supabase_setup.sql` - Database schema en tabellen
   - `storage_policies.sql` - Storage bucket policies

2. **Check checklist:** Zie `VERIFICATIE_CHECKLIST.md` voor volledige setup verificatie

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

- **`VERCEL_DEPLOYMENT.md`** - Complete Vercel deployment guide
- **`RAILWAY_DEPLOYMENT.md`** - Railway Python API deployment guide
- **`SUPABASE_VERCEL_QUICK.md`** - Quick reference voor Supabase environment variables
- **`VERIFICATIE_CHECKLIST.md`** - Checklist voor verificatie van setup

## 🛠️ Technologie Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, FastAPI (Python)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Deployment:** Vercel (Frontend), Railway (Python API)
- **Audio Analysis:** librosa, numpy, mutagen

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

## 📄 License

[Voeg licentie toe]

## 🤝 Contributing

[Voeg contributing guidelines toe]

---

**Gemaakt met ❤️ voor muziek analyse**
