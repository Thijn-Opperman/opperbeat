# 🔑 Vercel Environment Variables - Exact Invoeren

## Stap-voor-stap: Environment Variables Toevoegen in Vercel

### Waar vind je dit?
1. In Vercel Dashboard → Je Project
2. Klik op **"Settings"** (in de top menu)
3. Klik op **"Environment Variables"** (in de sidebar)

---

## 📝 Variable 1: Supabase URL

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
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Klik "Save"**

---

## 📝 Variable 2: Supabase Anon Key

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
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Klik "Save"**

---

## 📝 Variable 3: Supabase Service Role Key

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
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Klik "Save"**

---

## 📝 Variable 4: Python API URL (Als je Railway gebruikt)

**Klik opnieuw op "Add New"**

- **Key**:
  ```
  PYTHON_API_URL
  ```

- **Value**:
  ```
  https://your-railway-app.up.railway.app/api/analyze
  ```
  *(Vervang `your-railway-app` met je echte Railway URL)*

- **Environment**:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Klik "Save"**

---

## 📝 Variable 5: Python API URL Public (Als je Railway gebruikt)

**Klik opnieuw op "Add New"**

- **Key**:
  ```
  NEXT_PUBLIC_PYTHON_API_URL
  ```

- **Value**:
  ```
  https://your-railway-app.up.railway.app/api/analyze
  ```
  *(Zelfde URL als hierboven)*

- **Environment**:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Klik "Save"**

---

## ✅ Na Toevoegen

Na het toevoegen van alle variables:

1. **Herdeploy je project:**
   - Ga naar **"Deployments"** tab
   - Klik op de **"..."** menu naast de laatste deployment
   - Kies **"Redeploy"**
   - Of: Push een nieuwe commit naar GitHub (trigger automatische deploy)

2. **Wacht tot deployment klaar is**

3. **Test:**
   - Ga naar: `https://your-app.vercel.app/api/test-supabase`
   - Check of alles werkt

---

## 📸 Visuele Checklist

Je zou nu **3-5 variables** moeten zien in de lijst:

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY`
4. ✅ `PYTHON_API_URL` (optioneel)
5. ✅ `NEXT_PUBLIC_PYTHON_API_URL` (optioneel)

**Elke variable moet aangevinkt zijn voor:**
- Production
- Preview
- Development

---

## ⚠️ Belangrijk

- **Kopieer de values EXACT** - geen extra spaties
- **Check alle 3 environments** zijn aangevinkt
- **Herdeploy** na toevoegen van variables
- **Service Role Key is PRIVÉ** - nooit in client code, alleen server-side

---

**Klaar!** Na het toevoegen van alle variables en herdeployen zou alles moeten werken! 🚀

