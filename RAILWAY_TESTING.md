# 🧪 Railway API Testen Stappenplan

Complete gids om je Railway Python API te testen en te verifiëren dat alles werkt.

---

## 📋 Stap 1: Check Railway Deployment Status

### 1.1: Ga naar Railway Dashboard
1. Ga naar [railway.app](https://railway.app)
2. Log in met je account
3. Selecteer je project

### 1.2: Check Service Status
1. Klik op je service (waarschijnlijk "web")
2. Check de **Deployments** tab
3. Zorg dat de laatste deployment **"Succeeded"** is (groen vinkje)
4. Als het "Failed" is, klik erop en check de logs

### 1.3: Check Logs
1. Ga naar **Logs** tab
2. Je zou moeten zien:
   - ✅ "Application startup complete"
   - ✅ "Uvicorn running on..."
   - ❌ Geen errors

---

## 🧪 Stap 2: Test Health Check Endpoint

### 2.1: Test in Browser
1. Open een nieuw tabblad
2. Ga naar: `https://web-production-60d41.up.railway.app/`
3. Je zou moeten zien:
   ```json
   {"status":"ok","service":"Python Audio Analyzer API"}
   ```

### 2.2: Test met curl (Terminal)
```bash
curl https://web-production-60d41.up.railway.app/
```

**Verwacht resultaat:**
```json
{"status":"ok","service":"Python Audio Analyzer API"}
```

✅ **Als dit werkt**: Je API is online en bereikbaar!

---

## 🎵 Stap 3: Test Analyze Endpoint (Zonder Audio)

### 3.1: Test met Lege Request
```bash
curl -X POST https://web-production-60d41.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Verwacht resultaat:**
```json
{"detail":"file_path of file_data is vereist"}
```

✅ **Als je deze error ziet**: De endpoint werkt, maar verwacht data!

---

## 📁 Stap 4: Test met Echt Audio Bestand

### 4.1: Bereid Test Audio Voor
1. Download een klein MP3 bestand (bijv. 1-2 MB)
2. Of gebruik een bestaand audio bestand

### 4.2: Converteer naar Base64
**Op Mac/Linux:**
```bash
base64 -i jouw-bestand.mp3 > audio_base64.txt
```

**Of gebruik Python:**
```python
import base64

with open('jouw-bestand.mp3', 'rb') as f:
    audio_base64 = base64.b64encode(f.read()).decode('utf-8')
    print(audio_base64)
```

### 4.3: Test met Base64 Data
```bash
curl -X POST https://web-production-60d41.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "file_data": "BASE64_STRING_HIER",
    "include_waveform": true
  }'
```

**Verwacht resultaat:**
```json
{
  "bpm": 128,
  "bpm_confidence": 0.85,
  "key": "C major",
  "key_confidence": 0.72,
  "song_name": "Track Name",
  "duration": 180.5,
  "duration_formatted": "3:00",
  "bitrate": 320,
  "waveform": {...}
}
```

---

## 🌐 Stap 5: Test via Vercel Frontend

### 5.1: Check Environment Variable
1. Ga naar Vercel Dashboard
2. Project → Settings → Environment Variables
3. Check of `PYTHON_API_URL` bestaat en correct is:
   - Value: `https://web-production-60d41.up.railway.app/api/analyze`

### 5.2: Test Upload in Browser
1. Ga naar je Vercel frontend URL
2. Ga naar `/analyze` pagina
3. Upload een audio bestand
4. Check of analyse werkt

### 5.3: Check Browser Console
1. Open Developer Tools (F12)
2. Ga naar **Console** tab
3. Upload een bestand
4. Je zou moeten zien:
   - ✅ "Roep Python analyzer API aan..."
   - ✅ "Analyzer resultaat ontvangen: {...}"

### 5.4: Check Network Tab
1. In Developer Tools, ga naar **Network** tab
2. Upload een bestand
3. Zoek naar request naar `/api/analyze`
4. Check:
   - ✅ Status: 200 OK
   - ✅ Response bevat BPM, key, etc.

---

## 🔍 Stap 6: Check Railway Logs Tijdens Test

### 6.1: Open Railway Logs
1. Ga naar Railway Dashboard
2. Klik op je service
3. Ga naar **Logs** tab
4. Houd deze open tijdens testen

### 6.2: Test en Observeer
1. Upload een bestand via Vercel frontend
2. Kijk in Railway logs
3. Je zou moeten zien:
   - ✅ Request binnenkomt
   - ✅ Audio wordt geanalyseerd
   - ✅ Response wordt teruggestuurd
   - ❌ Geen errors

---

## 🐛 Troubleshooting

### Probleem: Health Check Werkt Niet
**Oplossing:**
- Check Railway deployment status
- Check of service "Running" is
- Check logs voor errors

### Probleem: "file_path of file_data is vereist"
**Dit is normaal!** De endpoint werkt, maar je moet data meesturen.

### Probleem: Base64 Decode Error
**Oplossing:**
- Check of base64 string correct is
- Zorg dat er geen newlines in zitten
- Test met kleinere audio file eerst

### Probleem: Timeout Error
**Oplossing:**
- Audio bestand is mogelijk te groot
- Check Railway logs voor details
- Probeer kleiner bestand (bijv. < 5 MB)

### Probleem: CORS Error
**Oplossing:**
- Check of CORS middleware is toegevoegd (al gedaan ✅)
- Check Railway logs
- Check browser console voor specifieke error

### Probleem: "Python API URL niet geconfigureerd"
**Oplossing:**
- Check Vercel environment variables
- Zorg dat `PYTHON_API_URL` bestaat
- Herdeploy Vercel na toevoegen variable

---

## ✅ Checklist

Gebruik deze checklist om te verifiëren:

- [ ] Railway deployment is "Succeeded"
- [ ] Health check endpoint werkt (`/`)
- [ ] Analyze endpoint reageert (zelfs met error)
- [ ] Test met echt audio bestand werkt
- [ ] Vercel frontend kan audio uploaden
- [ ] Analyse resultaten worden getoond
- [ ] Geen errors in Railway logs
- [ ] Geen errors in browser console
- [ ] BPM wordt correct gedetecteerd
- [ ] Key wordt correct gedetecteerd

---

## 🎯 Quick Test Commands

### Test 1: Health Check
```bash
curl https://web-production-60d41.up.railway.app/
```

### Test 2: Analyze Endpoint (zonder data)
```bash
curl -X POST https://web-production-60d41.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test 3: Analyze Endpoint (met data - vereist base64)
```bash
# Eerst: base64 -i audio.mp3 > base64.txt
# Dan: gebruik de base64 string in de curl command
curl -X POST https://web-production-60d41.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"file_data": "BASE64_HIER", "include_waveform": true}'
```

---

## 📊 Monitoring

### Real-time Logs Bekijken
1. Railway Dashboard → Service → Logs tab
2. Logs worden real-time getoond
3. Filter op "error" of "exception" voor problemen

### Metrics Bekijken
1. Railway Dashboard → Service → Metrics tab
2. Check:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🎉 Klaar!

Als alle tests slagen, werkt je Railway API correct en is het klaar voor productie gebruik!

**Problemen?** Check de Troubleshooting sectie hierboven of de logs in Railway.


