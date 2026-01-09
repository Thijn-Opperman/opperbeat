# 📚 Opperbeat - Project Documentatie

## Inhoudsopgave
1. [Project Overzicht](#project-overzicht)
2. [Technische Architectuur](#technische-architectuur)
3. [Functionaliteiten](#functionaliteiten)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Componenten Structuur](#componenten-structuur)
7. [Deployment](#deployment)
8. [Ontwikkelingsproces](#ontwikkelingsproces)

---

## Project Overzicht

**Opperbeat** is een moderne webapplicatie voor DJ's om muziek te analyseren, organiseren en beheren. De applicatie biedt automatische BPM- en key-detectie, een uitgebreide bibliotheek voor trackbeheer, playlistfunctionaliteit en een dashboard met real-time statistieken.

### Doelgroep
- Professionele DJ's
- Muziekproducenten
- Muziekverzamelaars
- Studenten en docenten (schoolopdracht)

### Kernfunctionaliteiten
- 🎵 Automatische muziekanalyse (BPM, Key, Metadata)
- 📚 Muziekbibliotheek met zoek- en filterfuncties
- 📊 Dashboard met statistieken en insights
- 🎧 Playlist builder
- 💾 Cloud opslag via Supabase
- 🌐 Multi-language support (Nederlands/Engels)
- 🎨 Dark/Light theme support

---

## Technische Architectuur

### Tech Stack

#### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **TypeScript:** 5.x
- **Icons:** Lucide React
- **Charts:** Recharts

#### Backend
- **API:** Next.js API Routes
- **Python API:** FastAPI (Railway deployment)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

#### Audio Processing
- **Python Libraries:** librosa, numpy, mutagen
- **Node.js:** music-metadata, music-tempo, realtime-bpm-analyzer
- **FFmpeg:** ffmpeg-static, fluent-ffmpeg

### Project Structuur

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
│   └── storage_policies.sql    # Storage policies
└── docs/                        # Documentatie
    ├── README.md
    ├── VERCEL_DEPLOYMENT.md
    ├── RAILWAY_DEPLOYMENT.md
    └── ...
```

---

## Functionaliteiten

### 1. Dashboard (Home)
**Route:** `/`

**Features:**
- Widget-gebaseerd dashboard met verschillende groottes
- Laatste muziekanalyse weergave
- Library insights met grafieken
- Genre breakdown met pie chart
- Quick stats widget
- Recent activity widget
- Profile widget
- Download widget
- BPM & Key matcher widgets
- Quick playlist widget
- Spotify & SoundCloud integratie (placeholders)

**Componenten:**
- `MusicAnalysisCard` - Grote widget met laatste analyse
- `LibraryCard` - Library statistieken met bar chart
- `GenresCard` - Genre distributie met pie chart
- `SetLengthCard` - Gemiddelde track lengte
- Diverse kleine widgets voor quick access

### 2. Muziek Analyse
**Route:** `/analyze`

**Features:**
- Drag & drop file upload
- Ondersteuning voor MP3, WAV, FLAC, M4A
- Automatische BPM detectie met confidence score
- Key detectie (Krumhansl-Schmuckler algoritme)
- Metadata extractie (titel, artiest, album, genre)
- Waveform visualisatie
- Artwork extractie
- Batch analyse (meerdere bestanden tegelijk)
- Opslaan naar database optie

**Technische Details:**
- Kleine bestanden (< 10MB): Vercel API route
- Grote bestanden: Railway Python API
- Real-time progress updates
- Error handling en validatie

### 3. Bibliotheek
**Route:** `/library`

**Features:**
- Overzicht van alle geanalyseerde tracks
- Zoeken op titel, artiest, album
- Filteren op BPM, Key, Genre
- Sorteren op verschillende criteria
- Waveform preview
- Track details weergave
- Delete functionaliteit
- Paginatie

### 4. Playlists
**Route:** `/playlists`

**Features:**
- Playlist aanmaken en bewerken
- Tracks toevoegen aan playlists
- Drag & drop reordering
- Playlist statistieken
- Playlist delen (toekomstig)

### 5. Analytics
**Route:** `/analytics`

**Features:**
- Totaal aantal tracks
- Genre distributie
- BPM distributie
- Key distributie
- Activity timeline
- Gemiddelde track lengte

### 6. Profiel
**Route:** `/profile`

**Features:**
- Profiel informatie bewerken
- Account instellingen
- Gebruikersstatistieken

### 7. Authenticatie
**Routes:** `/login`, `/register`

**Features:**
- Email/password authenticatie
- Demo login (development)
- Email verificatie
- Session management
- Protected routes

---

## Database Schema

### Tabellen

#### `music_analyses`
Hoofdtabel voor alle muziekanalyses.

**Kolommen:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key naar auth.users)
- `title` (TEXT)
- `original_filename` (TEXT)
- `file_size_bytes` (BIGINT)
- `mime_type` (TEXT)
- `audio_file_url` (TEXT) - Path in storage
- `audio_file_public_url` (TEXT) - Signed URL
- `artwork_url` (TEXT) - Optional
- `artwork_public_url` (TEXT)
- `duration_seconds` (INTEGER)
- `duration_formatted` (TEXT)
- `bpm` (INTEGER)
- `bpm_confidence` (DECIMAL)
- `key` (TEXT)
- `key_confidence` (DECIMAL)
- `artist` (TEXT)
- `album` (TEXT)
- `genre` (TEXT)
- `bitrate` (INTEGER)
- `sample_rate` (INTEGER)
- `waveform` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `playlists`
Playlist tabel.

**Kolommen:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `playlist_tracks`
Junction tabel voor tracks in playlists.

**Kolommen:**
- `id` (UUID, Primary Key)
- `playlist_id` (UUID, Foreign Key)
- `analysis_id` (UUID, Foreign Key)
- `position` (INTEGER)
- `created_at` (TIMESTAMP)

### Storage Buckets

#### `audio-files`
Opslag voor audio bestanden.

#### `album-artwork`
Opslag voor album artwork afbeeldingen.

### Row Level Security (RLS)
- Gebruikers kunnen alleen hun eigen data zien
- Service role key voor server-side operaties
- Public read voor bepaalde resources

---

## API Endpoints

### Analyse Endpoints

#### `POST /api/analyze`
Upload en analyseer een audio bestand.

**Request:**
- `file` (FormData) - Audio bestand
- `save` (string) - "true" of "false"

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Track Title",
    "bpm": 128,
    "key": "C major",
    "confidence": {
      "bpm": 0.95,
      "key": 0.87
    },
    "metadata": { ... },
    "waveform": [ ... ]
  },
  "saved": true,
  "analysisId": "uuid"
}
```

#### `POST /api/analyze/batch`
Batch analyse voor meerdere bestanden.

#### `POST /api/analyze/save`
Sla analyse op in database (voor grote bestanden).

### Analyses Endpoints

#### `GET /api/analyses`
Haal alle analyses op met filters.

**Query Parameters:**
- `bpm` - Filter op BPM
- `key` - Filter op key
- `genre` - Filter op genre
- `search` - Zoek in titel/artiest/album
- `limit` - Aantal resultaten (default: 50)
- `offset` - Paginatie offset

#### `GET /api/analyses/[id]`
Haal specifieke analyse op.

#### `DELETE /api/analyses/[id]`
Verwijder analyse.

### Analytics Endpoints

#### `GET /api/analytics`
Haal statistieken op.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTracks": 100,
    "totalDuration": 3600,
    "avgDuration": 180,
    "genreDistribution": [ ... ],
    "bpmDistribution": [ ... ],
    "keyDistribution": [ ... ],
    "activityTimeline": [ ... ]
  }
}
```

### Playlist Endpoints

#### `GET /api/playlists`
Haal alle playlists op.

#### `POST /api/playlists`
Maak nieuwe playlist.

#### `GET /api/playlists/[id]`
Haal specifieke playlist op met tracks.

#### `POST /api/playlists/[id]/tracks`
Voeg track toe aan playlist.

### Auth Endpoints

#### `POST /api/auth/register`
Registreer nieuwe gebruiker.

#### `POST /api/auth/login`
Login gebruiker.

#### `POST /api/auth/logout`
Logout gebruiker.

#### `POST /api/auth/demo-login`
Demo login (development).

---

## Componenten Structuur

### Dashboard Componenten

#### `MusicAnalysisCard`
Grote widget met laatste analyse informatie.

**Props:** Geen (haalt data uit localStorage/API)

**Features:**
- Laatste analyse weergave
- BPM en Key display
- Confidence scores
- Total analyses count
- Quick action button

#### `LibraryCard`
Library insights met bar chart.

**Features:**
- Total tracks count
- Activity timeline (laatste 6 maanden)
- Bar chart visualisatie

#### `GenresCard`
Genre breakdown met pie chart.

**Features:**
- Top 4 genres
- Percentage weergave
- Pie chart visualisatie

#### `SetLengthCard`
Gemiddelde track lengte indicator.

**Features:**
- Circular progress indicator
- Gemiddelde in minuten

### Shared Componenten

#### `Sidebar`
Navigatie sidebar.

**Features:**
- Logo
- Navigation items
- Language switch
- Theme toggle
- Logout button
- Mobile responsive

#### `DynamicTitle`
Dynamische pagina titel.

#### `ThemeToggle`
Theme switcher (light/dark/system).

#### `LanguageSwitch`
Language switcher (NL/EN).

---

## Deployment

### Vercel (Frontend)

1. Push code naar GitHub
2. Import project in Vercel
3. Configureer environment variables
4. Deploy automatisch bij push

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PYTHON_API_URL` (optioneel)
- `NEXT_PUBLIC_PYTHON_API_URL` (optioneel)

### Railway (Python API)

1. Maak Railway account
2. Deploy from GitHub
3. Railway detecteert automatisch Python service
4. Kopieer URL naar Vercel env vars

**Requirements:**
- `requirements.txt` met dependencies
- `runtime.txt` met Python versie
- `Procfile` met start command

### Supabase

1. Maak Supabase project
2. Voer SQL scripts uit:
   - `supabase_setup.sql`
   - `playlists_setup.sql`
   - `storage_policies.sql`
3. Maak storage buckets:
   - `audio-files`
   - `album-artwork`
4. Configureer RLS policies

---

## Ontwikkelingsproces

### Development Workflow

1. **Setup:**
   ```bash
   npm install
   cp .env.example .env.local
   # Vul environment variables in
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Linting:**
   ```bash
   npm run lint
   ```

### Code Structuur Principes

- **Component-based:** Elke feature heeft eigen componenten
- **Type-safe:** Volledige TypeScript implementatie
- **Reusable:** Shared components in `/lib` en `/components`
- **API Routes:** Server-side logic in `/app/api`
- **Context:** State management via React Context

### Best Practices

- ✅ TypeScript voor type safety
- ✅ Error handling in alle API routes
- ✅ Loading states in UI
- ✅ Responsive design
- ✅ Accessibility considerations
- ✅ Code comments waar nodig
- ✅ Consistent naming conventions

---

## Toekomstige Uitbreidingen

### Geplande Features
- [ ] Spotify integratie
- [ ] SoundCloud integratie
- [ ] Real-time collaboration
- [ ] Mix recording
- [ ] Export functionaliteit
- [ ] Mobile app
- [ ] Advanced filtering
- [ ] Track recommendations
- [ ] Social features

### Technische Verbeteringen
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Caching strategy
- [ ] CDN voor assets
- [ ] Advanced analytics

---

## Licentie

[Voeg licentie toe]

## Contact

[Voeg contact informatie toe]

---

**Document versie:** 1.0  
**Laatste update:** 2025-01-09  
**Auteur:** [Naam]

