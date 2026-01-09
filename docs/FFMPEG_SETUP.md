# 🎬 FFmpeg Setup voor Railway

FFmpeg is vereist voor de download functionaliteit om audio te converteren naar 320 kbps MP3.

## Probleem

Als je deze error krijgt:
```
ERROR: Postprocessing: ffprobe and ffmpeg not found. Please install or provide the path using --ffmpeg-location
```

Dan is FFmpeg niet geïnstalleerd op je Railway service.

## Oplossingen

### Optie 1: Nixpacks (Aanbevolen - Automatisch)

Railway gebruikt automatisch `nixpacks.toml` als het bestaat. Het bestand is al aangemaakt en bevat:

```toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

**Stappen:**
1. Zorg dat `nixpacks.toml` in de root van je repository staat
2. Herdeploy je Railway service
3. Railway installeert automatisch FFmpeg tijdens de build

### Optie 2: Dockerfile (Handmatig)

Als Nixpacks niet werkt, gebruik dan de Dockerfile:

**Stappen:**
1. Zorg dat `Dockerfile` in de root staat (al aangemaakt)
2. In Railway, ga naar je service → Settings
3. Bij "Build Command", laat leeg (Dockerfile wordt automatisch gebruikt)
4. Herdeploy je service

### Optie 3: Railway Buildpack (Alternatief)

1. In Railway service → Settings
2. Bij "Build Command", voeg toe:
   ```bash
   apt-get update && apt-get install -y ffmpeg && pip install -r requirements.txt
   ```

## Verificatie

Na deployment, check de Railway logs:

1. Ga naar Railway → Je service → Logs
2. Zoek naar: `"Found ffmpeg at: /usr/bin/ffmpeg"` of vergelijkbaar
3. Als je deze log ziet, is FFmpeg correct geïnstalleerd

## Testen

Test de download functionaliteit:
1. Ga naar `/download` pagina
2. Probeer een YouTube URL te downloaden
3. Check of de download werkt zonder FFmpeg errors

## Troubleshooting

### FFmpeg nog steeds niet gevonden

1. **Check Railway Logs:**
   - Ga naar Railway → Logs
   - Zoek naar FFmpeg installatie berichten
   - Check voor errors tijdens build

2. **Check Build Logs:**
   - Ga naar Railway → Deployments
   - Klik op laatste deployment
   - Check build logs voor FFmpeg installatie

3. **Verifieer Configuratie:**
   - Zorg dat `nixpacks.toml` in root staat
   - Of zorg dat `Dockerfile` in root staat
   - Check of bestanden correct zijn gecommit naar GitHub

4. **Herdeploy:**
   - Na configuratie wijzigingen, herdeploy altijd
   - Railway detecteert wijzigingen automatisch na GitHub push

### Alternatieve Locaties

Als FFmpeg geïnstalleerd is maar niet gevonden wordt, check deze locaties:
- `/usr/bin/ffmpeg`
- `/usr/local/bin/ffmpeg`
- `/bin/ffmpeg`

De code detecteert automatisch FFmpeg in deze locaties.

## Status

- ✅ `nixpacks.toml` - Aangemaakt
- ✅ `Dockerfile` - Aangemaakt
- ✅ FFmpeg detectie code - Geïmplementeerd
- ⏳ Railway deployment - Moet nog herdeployed worden

