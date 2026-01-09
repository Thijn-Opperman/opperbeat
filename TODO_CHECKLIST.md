# ✅ TODO Checklist - Wat Moet Nog Gedaan Worden

## 🎵 Download Functionaliteit

### Vereisten voor Download Functionaliteit
- [ ] **FFmpeg installeren op Railway**
  - Railway heeft FFmpeg niet standaard geïnstalleerd
  - Optie 1: Voeg FFmpeg toe via buildpack of nixpacks
  - Optie 2: Gebruik ffmpeg-static in Python (moeilijker)
  - Optie 3: Railway Nixpacks kan FFmpeg automatisch detecteren

- [ ] **Test download functionaliteit**
  - Test YouTube URL download
  - Test SoundCloud URL download
  - Test zoek functionaliteit
  - Verifieer 320 kbps conversie

- [ ] **Environment Variables**
  - Zorg dat `PYTHON_API_URL` correct is ingesteld in Vercel
  - URL moet eindigen op basis URL (niet `/api/analyze` voor downloads)

### Railway Configuratie
- [ ] **FFmpeg toevoegen aan Railway**
  - Maak `nixpacks.toml` of gebruik Railway's buildpack
  - Of: Voeg FFmpeg installatie toe aan build proces

---

## 📚 Documentatie Updates

### Documentatie die nog geüpdatet moet worden
- [ ] **README.md** - Download functionaliteit toevoegen aan features
- [ ] **PROJECT_DOCUMENTATIE.md** - Download endpoint documenteren
- [ ] **RAILWAY_DEPLOYMENT.md** - FFmpeg installatie instructies toevoegen

---

## 🧪 Testing & Verificatie

### Functionaliteit Testen
- [ ] Test alle pagina's werken
- [ ] Test alle API endpoints
- [ ] Test download functionaliteit (na FFmpeg setup)
- [ ] Test responsive design op verschillende schermen
- [ ] Test error handling

### Code Kwaliteit
- [ ] Run `npm run lint` en fix eventuele errors
- [ ] Check TypeScript errors
- [ ] Verifieer alle imports werken

---

## 🚀 Deployment Checklist

### Voor Productie
- [ ] Alle environment variables geconfigureerd
- [ ] Database scripts uitgevoerd in Supabase
- [ ] Storage buckets aangemaakt
- [ ] Railway Python API draait
- [ ] Vercel frontend gedeployed
- [ ] FFmpeg geïnstalleerd op Railway (voor downloads)

---

## 📝 Schoolopdracht Specifiek

### Documentatie Compleet
- [x] README.md compleet
- [x] PROJECT_DOCUMENTATIE.md gemaakt
- [x] SCHOOLOPDRACHT_OVERZICHT.md gemaakt
- [x] STRUCTUUR_OVERZICHT.md gemaakt
- [ ] Download functionaliteit documenteren

### Code Organisatie
- [x] Project structuur georganiseerd
- [x] Documentatie in docs/ folder
- [x] SQL scripts in sql/ folder
- [x] .gitignore aanwezig

---

## 🔧 Optionele Verbeteringen

### Nice-to-Have Features
- [ ] Download geschiedenis
- [ ] Download queue voor meerdere downloads
- [ ] Progress indicator voor downloads
- [ ] Automatische analyse na download
- [ ] Direct toevoegen aan library na download

### Performance
- [ ] Caching voor downloads
- [ ] Background processing voor lange downloads
- [ ] Queue systeem voor downloads

---

## ⚠️ Belangrijk: FFmpeg Setup voor Railway

De download functionaliteit vereist FFmpeg op Railway. Hier zijn opties:

### Optie 1: Nixpacks (Aanbevolen)
Maak `nixpacks.toml` in root:
```toml
[phases.setup]
nixPkgs = ["ffmpeg"]

[phases.install]
cmds = ["pip install -r requirements.txt"]
```

### Optie 2: Build Script
Maak `build.sh`:
```bash
#!/bin/bash
apt-get update && apt-get install -y ffmpeg
pip install -r requirements.txt
```

### Optie 3: Railway Buildpack
Railway kan automatisch FFmpeg detecteren als je de juiste buildpack gebruikt.

---

## 📋 Quick Start voor Downloads

1. **FFmpeg installeren op Railway** (zie hierboven)
2. **Herdeploy Railway service** na FFmpeg toevoeging
3. **Test download endpoint** via `/download` pagina
4. **Verifieer 320 kbps output**

---

**Status:** Download functionaliteit is geïmplementeerd, maar vereist FFmpeg op Railway om te werken.

