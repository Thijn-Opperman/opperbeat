# 🚀 Vercel Deployment Guide

Complete stappenplan om je applicatie met Supabase te deployen op Vercel.

---

## 📋 Voorbereiding

### Stap 1: Code naar GitHub Pushen

Zorg dat alle code op GitHub staat:

```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

**Belangrijk:** Check dat `.env.local` NIET in git staat (staat al in `.gitignore`)

---

## 🚀 Deel 1: Vercel Deployment

### Stap 1.1: Vercel Account & Project

1. Ga naar [vercel.com](https://vercel.com)
2. Login met GitHub
3. Klik **"Add New..."** → **"Project"**
4. Selecteer je repository (`opperbeat`)
5. Klik **"Import"**

### Stap 1.2: Project Configuratie

Vercel detecteert automatisch Next.js, maar check deze instellingen:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build` (automatisch)
- **Output Directory**: `.next` (automatisch)
- **Install Command**: `npm install` (automatisch)

### Stap 1.3: Environment Variables Toevoegen

**BELANGRIJK:** Voeg deze environment variables toe in Vercel:

Klik op **"Environment Variables"** en voeg toe:

#### Supabase Variables (VERPLICHT):
```
NEXT_PUBLIC_SUPABASE_URL=https://kitirbgzeiwupoyovcra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGlyYmd6ZWl3dXBveW92Y3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTU2NzUsImV4cCI6MjA4MzQzMTY3NX0.OLNW6p_EZFOlBPh3BFDjvbeVGkGmAp3viiprLY0J24A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGlyYmd6ZWl3dXBveW92Y3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1NTY3NSwiZXhwIjoyMDgzNDMxNjc1fQ.f1r851T59F_YzLeq1nTsthoYlnvA0zjCcIHoAPFdcJE
```

**Voor elke variable:**
- ✅ Vink aan: **Production**
- ✅ Vink aan: **Preview**  
- ✅ Vink aan: **Development**

#### Python API Variable (Als je Railway gebruikt):
```
PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
NEXT_PUBLIC_PYTHON_API_URL=https://your-railway-app.up.railway.app/api/analyze
```

**Vervang** `your-railway-app` met je echte Railway URL.

### Stap 1.4: Deploy

1. Klik **"Deploy"**
2. Wacht tot deployment klaar is (2-5 minuten)
3. ✅ Je applicatie is nu live!

---

## ✅ Na Deployment: Verificatie

### Check 1: Applicatie is Live
- Ga naar je Vercel URL (bijv. `https://opperbeat.vercel.app`)
- Check of de applicatie laadt

### Check 2: Supabase Verbinding
- Ga naar: `https://your-app.vercel.app/api/test-supabase`
- Check of response `"status": "success"` toont

### Check 3: Test Analyse
1. Ga naar `/analyze` pagina
2. Upload een klein test bestand (<4MB)
3. Check of checkbox "Opslaan in database" werkt
4. Check browser console voor `✅ Analyse opgeslagen`

### Check 4: Supabase Dashboard
- Check Table Editor → `music_analyses` voor nieuwe records
- Check Storage → `audio-files` voor geüploade bestanden

---

## 🔧 Environment Variables Checklist

Zorg dat deze allemaal zijn ingesteld in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PYTHON_API_URL` (als je Railway gebruikt)
- [ ] `NEXT_PUBLIC_PYTHON_API_URL` (als je Railway gebruikt)

**Voor alle environments:**
- [ ] Production
- [ ] Preview
- [ ] Development

---

## 🐛 Troubleshooting

### Probleem: "Missing Supabase environment variables"
**Oplossing:**
- Check of alle 3 Supabase variables zijn toegevoegd
- Check of ze zijn aangevinkt voor Production/Preview/Development
- Herdeploy na toevoegen van variables

### Probleem: Build faalt
**Oplossing:**
- Check build logs in Vercel dashboard
- Check of alle dependencies correct zijn geïnstalleerd
- Check TypeScript errors

### Probleem: Supabase verbinding werkt niet
**Oplossing:**
- Test verbinding: `https://your-app.vercel.app/api/test-supabase`
- Check of environment variables correct zijn
- Check Supabase dashboard of project actief is

### Probleem: Bestanden worden niet opgeslagen
**Oplossing:**
- Check browser console voor errors
- Check Vercel function logs (in Vercel dashboard)
- Test met klein bestand eerst (<4MB)

---

## 📝 Quick Deploy Checklist

- [ ] Code gepusht naar GitHub
- [ ] Vercel project aangemaakt
- [ ] Supabase environment variables toegevoegd
- [ ] Python API URL toegevoegd (als gebruikt)
- [ ] Alle variables aangevinkt voor Production/Preview/Development
- [ ] Deployment gestart
- [ ] Deployment succesvol
- [ ] Test endpoint werkt (`/api/test-supabase`)
- [ ] Test analyse werkt

---

## 🔄 Herdeployen na Wijzigingen

Na code changes:

1. Push naar GitHub:
   ```bash
   git add .
   git commit -m "Update code"
   git push origin main
   ```

2. Vercel deployt automatisch (als auto-deploy aan staat)
   - Of: Ga naar Vercel dashboard → **Deployments** → **Redeploy**

3. Check deployment logs voor errors

---

## 🎯 Post-Deployment

Na succesvolle deployment:

1. **Test alle functionaliteit:**
   - Login/Register
   - Analyse upload (klein en groot bestand)
   - Opslaan in database
   - Analyses ophalen

2. **Monitor:**
   - Vercel Analytics (optioneel)
   - Supabase Dashboard → Logs
   - Error tracking

3. **Optimalisatie:**
   - Check Vercel function execution times
   - Monitor Supabase storage usage
   - Check database query performance

---

**Klaar om te deployen?** Volg de stappen hierboven en je applicatie staat binnen 5 minuten live! 🚀

