# 🚀 Supabase Variables Toevoegen in Vercel - Quick Guide

## Probleem
Je hebt alleen de Python API variable in Vercel, maar de Supabase variables ontbreken. Daarom worden analyses niet opgeslagen in de database.

## Oplossing: Voeg 3 Supabase Variables Toe

### Stap 1: Ga naar Environment Variables

1. Open **Vercel Dashboard**
2. Selecteer je project (`opperbeat`)
3. Klik op **"Settings"** (bovenaan)
4. Klik op **"Environment Variables"** (in de sidebar)

---

### Stap 2: Voeg Variable 1 Toe - Supabase URL

**Klik op "Add New"**

- **Key** (linker veld):
  ```
  NEXT_PUBLIC_SUPABASE_URL
  ```

- **Value** (rechter veld):
  ```
  https://kitirbgzeiwupoyovcra.supabase.co
  ```

- **Environment** (checkboxes onderaan):
  - ✅ **Production**
  - ✅ **Preview**
  - ✅ **Development**

**Klik "Save"**

---

### Stap 3: Voeg Variable 2 Toe - Supabase Anon Key

**Klik opnieuw op "Add New"**

- **Key**:
  ```
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  ```

- **Value**:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGlyYmd6ZWl3dXBveW92Y3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTU2NzUsImV4cCI6MjA4MzQzMTY3NX0.OLNW6p_EZFOlBPh3BFDjvbeVGkGmAp3viiprLY0J24A
  ```

- **Environment**:
  - ✅ **Production**
  - ✅ **Preview**
  - ✅ **Development**

**Klik "Save"**

---

### Stap 4: Voeg Variable 3 Toe - Supabase Service Role Key

**Klik opnieuw op "Add New"**

- **Key**:
  ```
  SUPABASE_SERVICE_ROLE_KEY
  ```

- **Value**:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdGlyYmd6ZWl3dXBveW92Y3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1NTY3NSwiZXhwIjoyMDgzNDMxNjc1fQ.f1r851T59F_YzLeq1nTsthoYlnvA0zjCcIHoAPFdcJE
  ```

- **Environment**:
  - ✅ **Production**
  - ✅ **Preview**
  - ✅ **Development**

**Klik "Save"**

---

## ✅ Na Toevoegen: Redeploy

**BELANGRIJK:** Na het toevoegen van de variables moet je je project **herdeployen**:

### Optie 1: Via Vercel Dashboard
1. Ga naar **"Deployments"** tab
2. Klik op de **"..."** menu (3 puntjes) naast je laatste deployment
3. Kies **"Redeploy"**
4. Wacht tot deployment klaar is

### Optie 2: Via Git Push
```bash
# Maak een kleine wijziging en push
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

---

## 📋 Checklist

Na het toevoegen zou je **4 environment variables** moeten hebben:

1. ✅ `PYTHON_API_URL` (of `NEXT_PUBLIC_PYTHON_API_URL`) - **Heb je al**
2. ✅ `NEXT_PUBLIC_SUPABASE_URL` - **Toevoegen**
3. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - **Toevoegen**
4. ✅ `SUPABASE_SERVICE_ROLE_KEY` - **Toevoegen**

**Elke variable moet aangevinkt zijn voor:**
- Production
- Preview
- Development

---

## 🧪 Test Na Deployment

Na het redeployen, test of het werkt:

1. **Test Supabase connectie:**
   ```
   https://jouw-app.vercel.app/api/debug-supabase
   ```
   Verwacht: Alle checks moeten "success" zijn

2. **Test analyse met opslag:**
   - Upload een nummer op je Vercel deployment
   - Check dat de checkbox "Opslaan in database" is aangevinkt
   - Check Vercel logs voor `✅ Analyse opgeslagen in database met ID: ...`
   - Check Supabase database of het record is toegevoegd

---

## ⚠️ Belangrijk

- **Kopieer de values EXACT** - geen extra spaties voor of na
- **Check alle 3 environments** zijn aangevinkt (Production, Preview, Development)
- **Redeploy is verplicht** - nieuwe variables worden pas actief na redeploy
- **Service Role Key is PRIVÉ** - deze wordt alleen server-side gebruikt

---

## 🎯 Waarom Deze Variables?

- **NEXT_PUBLIC_SUPABASE_URL**: Supabase project URL (nodig voor connectie)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public key voor client-side Supabase calls
- **SUPABASE_SERVICE_ROLE_KEY**: Private key voor server-side admin operaties (database inserts, storage uploads)

Zonder deze 3 variables kan de applicatie niet verbinden met Supabase en worden analyses niet opgeslagen.

---

**Klaar!** Na het toevoegen van deze 3 variables en redeployen zou database opslag moeten werken! 🚀



