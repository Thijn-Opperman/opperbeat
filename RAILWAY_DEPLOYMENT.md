# 🚂 Railway Deployment Stappenplan

Complete gids om je Python Analyzer API op Railway te deployen en te koppelen aan je Vercel frontend.

---

## 📋 Voorbereiding

Zorg dat je hebt:
- ✅ GitHub repository met alle code
- ✅ Railway account (gratis aan te maken op [railway.app](https://railway.app))
- ✅ Vercel account (al gedeployed)

---

## 🎯 Deel 1: Railway Account & Project Aanmaken

### Stap 1.1: Maak Railway Account
1. Ga naar [railway.app](https://railway.app)
2. Klik op **"Login"** of **"Start a New Project"**
3. Kies **"Login with GitHub"**
4. Autoriseer Railway om toegang te krijgen tot je GitHub repositories

### Stap 1.2: Maak Nieuw Project
1. In Railway dashboard, klik op **"New Project"**
2. Kies **"Deploy from GitHub repo"**
3. Selecteer je repository: `Thijn-Opperman/opperbeat` (of jouw repo naam)
4. Railway maakt automatisch een nieuw project aan

---

## 🐍 Deel 2: Python Service Configureren

### Stap 2.1: Railway Detecteert Python Automatisch
Railway zou automatisch moeten detecteren:
- ✅ `requirements.txt` → Installeert Python dependencies
- ✅ `Procfile` → Start commando
- ✅ Python bestanden in `/api/` en `/python/`

**Als Railway NIET automatisch detecteert:**
1. Klik op je service in Railway
2. Ga naar **Settings** tab
3. Bij **"Build Command"**: Laat leeg (Railway doet dit automatisch)
4. Bij **"Start Command"**: 
   ```
   uvicorn api.analyze:app --host 0.0.0.0 --port $PORT
   ```

### Stap 2.2: Check Service Settings
1. In je Railway service, ga naar **Settings**
2. Controleer:
   - **Source**: GitHub repo is gekoppeld
   - **Branch**: `main` (of jouw default branch)
   - **Root Directory**: `/` (root van repo)

### Stap 2.3: Wacht op Eerste Deployment
1. Railway start automatisch een build
2. Je ziet de build progress in de **Deployments** tab
3. Dit kan 5-10 minuten duren (eerste keer installeren van librosa/numpy is traag)
4. Check de **Logs** tab voor progress

---

## 🔍 Deel 3: Deployment Verifiëren

### Stap 3.1: Check Build Logs
1. Ga naar **Deployments** tab
2. Klik op de laatste deployment
3. Check de logs voor:
   - ✅ "Installing dependencies from requirements.txt"
   - ✅ "Starting uvicorn"
   - ✅ "Application startup complete"

### Stap 3.2: Test Health Check Endpoint
1. Ga naar **Settings** tab
2. Scroll naar **"Domains"** sectie
3. Railway heeft automatisch een domain aangemaakt (bijv. `your-app.up.railway.app`)
4. Kopieer deze URL
5. Test in browser of met curl:
   ```bash
   curl https://your-app.up.railway.app/
   ```
   
   **Verwacht resultaat:**
   ```json
   {"status":"ok","service":"Python Audio Analyzer API"}
   ```

### Stap 3.3: Test Analyze Endpoint (Optioneel)
```bash
curl -X POST https://your-app.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"file_data": "base64_encoded_audio_here"}'
```

---

## 🔗 Deel 4: Koppelen aan Vercel Frontend

### Stap 4.1: Kopieer Railway URL
1. In Railway, ga naar je service → **Settings**
2. Scroll naar **"Domains"**
3. Kopieer de **Public Domain** URL
   - Bijvoorbeeld: `https://your-app.up.railway.app`
4. Voeg `/api/analyze` toe voor de volledige endpoint URL:
   - `https://your-app.up.railway.app/api/analyze`

### Stap 4.2: Voeg Environment Variable Toe in Vercel
1. Ga naar [vercel.com](https://vercel.com)
2. Selecteer je project
3. Ga naar **Settings** → **Environment Variables**
4. Klik **"Add New"**
5. Vul in:
   - **Key**: `PYTHON_API_URL`
   - **Value**: `https://your-app.up.railway.app/api/analyze`
     (Vervang `your-app` met jouw Railway domain)
   - **Environment**: Selecteer alle drie:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
6. Klik **"Save"**

### Stap 4.3: Herdeploy Vercel Project
1. In Vercel dashboard, ga naar je project
2. Klik op **"Deployments"** tab
3. Klik op de **"..."** menu naast de laatste deployment
4. Kies **"Redeploy"**
5. Of: Push een nieuwe commit naar GitHub (trigger automatische deploy)

---

## ✅ Deel 5: Testen End-to-End

### Stap 5.1: Test in Browser
1. Ga naar je Vercel frontend URL
2. Ga naar de `/analyze` pagina
3. Upload een audio bestand
4. Check of de analyse werkt

### Stap 5.2: Check Browser Console
1. Open Developer Tools (F12)
2. Ga naar **Console** tab
3. Upload een bestand
4. Je zou moeten zien:
   - ✅ "Roep Python analyzer API aan..."
   - ✅ "Analyzer resultaat ontvangen: {...}"

### Stap 5.3: Check Network Tab
1. In Developer Tools, ga naar **Network** tab
2. Upload een bestand
3. Zoek naar de request naar `/api/analyze`
4. Check:
   - ✅ Status: 200 OK
   - ✅ Response bevat BPM, key, etc.

---

## 🐛 Troubleshooting

### Probleem: Railway Build Faalt
**Oplossing:**
1. Check **Logs** tab in Railway
2. Veelvoorkomende errors:
   - **"Module not found"**: Check of `requirements.txt` alle dependencies heeft
   - **"Port already in use"**: Check of `$PORT` environment variable wordt gebruikt
   - **"Import error"**: Check of `/python/` folder correct is

### Probleem: CORS Error in Browser
**Oplossing:**
1. Check of CORS middleware is toegevoegd in `api/analyze.py` (al gedaan ✅)
2. Als je specifieke origins wilt, pas aan:
   ```python
   allow_origins=["https://your-app.vercel.app"]
   ```

### Probleem: "Python API URL niet geconfigureerd"
**Oplossing:**
1. Check of `PYTHON_API_URL` is ingesteld in Vercel
2. Check of de URL correct is (moet eindigen op `/api/analyze`)
3. Herdeploy Vercel project na toevoegen environment variable

### Probleem: Railway Service Start Niet
**Oplossing:**
1. Check **Logs** tab voor errors
2. Check of `Procfile` correct is:
   ```
   web: uvicorn api.analyze:app --host 0.0.0.0 --port $PORT
   ```
3. Check of `api/analyze.py` bestaat en correct is

### Probleem: Timeout bij Audio Analyse
**Oplossing:**
1. Railway heeft standaard timeout van 60 seconden
2. Voor langere analyses, upgrade Railway plan
3. Of: Optimaliseer audio analyse (kleinere bestanden, lagere sample rate)

---

## 📊 Monitoring

### Railway Logs Bekijken
1. Ga naar je service in Railway
2. Klik op **"Logs"** tab
3. Je ziet real-time logs van je API

### Vercel Logs Bekijken
1. Ga naar je project in Vercel
2. Klik op **"Functions"** tab
3. Selecteer `/api/analyze` route
4. Bekijk logs voor errors

---

## 🔄 Updates Deployen

### Na Code Wijzigingen:
1. Push naar GitHub:
   ```bash
   git add .
   git commit -m "Update Python API"
   git push
   ```
2. Railway deployt automatisch (binnen 1-2 minuten)
3. Vercel frontend blijft hetzelfde (geen wijzigingen nodig)

---

## 💰 Kosten

### Railway:
- **Free Tier**: $5 gratis credits per maand
- **Starter Plan**: $5/maand (als je meer nodig hebt)
- Voor deze app: Free tier is meestal genoeg

### Vercel:
- **Free Tier**: Meer dan genoeg voor frontend
- Geen extra kosten

---

## ✅ Checklist

Gebruik deze checklist om te verifiëren dat alles werkt:

- [ ] Railway account aangemaakt
- [ ] Project aangemaakt en GitHub repo gekoppeld
- [ ] Service detecteert Python automatisch
- [ ] Build succesvol (check logs)
- [ ] Health check endpoint werkt (`/`)
- [ ] Railway public domain URL gekopieerd
- [ ] `PYTHON_API_URL` environment variable toegevoegd in Vercel
- [ ] Vercel project herdeployed
- [ ] Frontend kan audio uploaden
- [ ] Analyse werkt end-to-end
- [ ] Geen CORS errors in browser console
- [ ] BPM en key worden correct gedetecteerd

---

## 🎉 Klaar!

Als alles werkt, heb je nu:
- ✅ Frontend op Vercel (snel, gratis)
- ✅ Backend op Railway (kan grote dependencies hebben)
- ✅ Alles gekoppeld en werkend!

**Problemen?** Check de Troubleshooting sectie hierboven of de logs in Railway/Vercel.


