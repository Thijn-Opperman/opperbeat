# 🔧 Problemen Oplossen

## ✅ Wat Werkt:

Het lokale test script (`test-save-locally.js`) werkt perfect:
- ✅ Database accepteert NULL user_id
- ✅ Storage upload werkt
- ✅ Alle tests geslaagd

**Dit betekent: Supabase is correct ingesteld!**

---

## 🔍 Mogelijke Problemen:

### Probleem 1: SQL Fix Niet Uitgevoerd

Als je nog steeds errors ziet over foreign key constraint:

**Oplossing:**
1. Ga naar Supabase Dashboard → **SQL Editor**
2. Open `fix_foreign_key.sql`
3. Kopieer volledige inhoud
4. Plak in SQL Editor
5. **Klik op "Run"** (of druk F5)

**Check of het werkt:**
```bash
node test-save-locally.js
```

Als dit werkt, is de SQL fix succesvol.

---

### Probleem 2: Checkbox Niet Aangevinkt

De checkbox "Opslaan in database na analyse" moet aangevinkt zijn.

**Check:**
- Ga naar http://localhost:3000/analyze
- Zie je de checkbox onder de upload button?
- Is deze aangevinkt? (standaard zou dit zo moeten zijn)

---

### Probleem 3: Grote Bestanden (>4MB)

Voor bestanden **groter dan 4MB** wordt direct naar Railway gestuurd, en die route slaat **NIET** op in Supabase.

**Oplossing:**
- Test eerst met een **klein bestand** (<4MB) om te zien of opslaan werkt
- Voor grote bestanden: de opslag functionaliteit moet nog worden toegevoegd

---

### Probleem 4: Console Logs Checken

**In Browser:**
1. Druk F12 → Console tab
2. Upload een bestand
3. Zoek naar errors of warnings
4. Zoek naar: `✅ Analyse opgeslagen in database met ID: ...`

**In Server Terminal:**
1. Kijk waar `npm run dev` draait
2. Check voor errors met `❌` of `⚠️`
3. Check voor success met `✅`

---

## 🧪 Testen:

### Test 1: Lokaal Script
```bash
node test-save-locally.js
```

Verwacht: Alle tests geslaagd ✅

### Test 2: Via Browser
1. Ga naar http://localhost:3000/analyze
2. Upload een **klein** MP3 bestand (<4MB)
3. Zorg dat checkbox is aangevinkt
4. Check browser console voor `✅ Analyse opgeslagen`

### Test 3: Debug Endpoint
```bash
curl http://localhost:3000/api/debug-supabase
```

Verwacht: Geen foreign key errors

---

## 📝 Checklist:

- [ ] SQL fix uitgevoerd (`fix_foreign_key.sql`)
- [ ] Lokaal test script werkt (`node test-save-locally.js`)
- [ ] Checkbox "Opslaan in database" is zichtbaar
- [ ] Test met klein bestand (<4MB)
- [ ] Check browser console voor errors
- [ ] Check server logs voor errors
- [ ] Check Supabase Dashboard → Table Editor → `music_analyses` voor records

---

## 🚨 Als Niets Werkt:

1. **Stop de development server** (Ctrl+C)
2. **Herstart server:**
   ```bash
   npm run dev
   ```
3. **Test opnieuw:**
   ```bash
   node test-save-locally.js
   ```

Als lokaal script werkt maar browser niet:
- Check browser console voor JavaScript errors
- Check of checkbox is aangevinkt
- Check of bestand klein genoeg is (<4MB)

---

**Test eerst met het lokaal script om te bevestigen dat Supabase werkt!**

