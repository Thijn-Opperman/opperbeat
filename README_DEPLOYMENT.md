# Deployment Instructies

Deze applicatie bestaat uit twee delen:
1. **Next.js Frontend** → Deploy op Vercel
2. **Python Analyzer API** → Deploy op Railway of Fly.io

## 🚀 Deel 1: Next.js Frontend op Vercel

### Stappen:
1. Push code naar GitHub
2. Ga naar [Vercel Dashboard](https://vercel.com)
3. Importeer je GitHub repository
4. Vercel detecteert automatisch Next.js
5. **Belangrijk**: Voeg environment variable toe:
   - **Naam**: `PYTHON_API_URL`
   - **Waarde**: De URL van je Python API (bijv. `https://your-app.railway.app/api/analyze`)
6. Klik "Deploy"

✅ Frontend is nu live op Vercel!

---

## 🐍 Deel 2: Python Analyzer API op Railway

### Stappen:

#### 1. Maak Railway account
- Ga naar [railway.app](https://railway.app)
- Login met GitHub

#### 2. Maak nieuw project
- Klik "New Project"
- Kies "Deploy from GitHub repo"
- Selecteer je repository

#### 3. Configureer Python service
Railway detecteert automatisch Python, maar je moet een start commando instellen:

**Start Command**: 
```bash
uvicorn api.analyze:app --host 0.0.0.0 --port $PORT
```

Of maak een `Procfile`:
```
web: uvicorn api.analyze:app --host 0.0.0.0 --port $PORT
```

#### 4. Installeer dependencies
Railway gebruikt automatisch `requirements.txt` uit de root.

**Maak `requirements.txt` in de root** (niet in `/app/`):
```txt
fastapi>=0.104.0
pydantic>=2.0.0
uvicorn[standard]>=0.24.0
librosa>=0.10.0
numpy>=1.24.0
scipy>=1.2.0,<1.12.0
mutagen>=1.47.0
```

#### 5. Configureer route
Zorg dat je `api/analyze.py` heeft met FastAPI app.

#### 6. Deploy
- Railway deployt automatisch bij push
- Wacht tot deployment klaar is
- Kopieer de public URL (bijv. `https://your-app.railway.app`)

#### 7. Test endpoint
```bash
curl https://your-app.railway.app/api/analyze
```

---

## 🔗 Deel 3: Koppel Frontend aan Backend

### In Vercel Dashboard:
1. Ga naar je project → Settings → Environment Variables
2. Voeg toe:
   - **Key**: `PYTHON_API_URL`
   - **Value**: `https://your-app.railway.app/api/analyze`
   - **Environment**: Production, Preview, Development
3. Herdeploy je Vercel project

---

## 🧪 Local Development

### Frontend (Next.js):
```bash
npm run dev
```

### Backend (Python API):
```bash
# In root directory
uvicorn api.analyze:app --reload --port 8000
```

### Environment Variable:
Maak `.env.local` in root:
```
PYTHON_API_URL=http://localhost:8000/api/analyze
```

---

## 📁 Bestandsstructuur

```
opperbeat/
├── app/                    # Next.js frontend
│   └── api/
│       └── analyze/
│           └── route.ts    # Roept externe Python API aan
├── api/
│   └── analyze.py          # FastAPI endpoint (voor Railway)
├── python/
│   └── music_analyzer.py    # Pure analyzer functies
├── requirements.txt         # Python dependencies (voor Railway)
└── package.json            # Node.js dependencies (voor Vercel)
```

---

## ⚠️ Troubleshooting

### Frontend kan Python API niet bereiken
- Check of `PYTHON_API_URL` correct is ingesteld in Vercel
- Check of Railway service draait
- Check CORS settings in FastAPI (zie hieronder)

### CORS Error
Voeg toe aan `api/analyze.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Of specifiek: ["https://your-app.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Railway deployment faalt
- Check of `requirements.txt` in root staat
- Check of `api/analyze.py` bestaat
- Check Railway logs voor errors

---

## 💰 Kosten

- **Vercel**: Gratis tier (meer dan genoeg voor frontend)
- **Railway**: $5/maand starter plan (of gratis credits)

---

## 🎯 Alternatief: Fly.io

Als je Fly.io prefereert:

1. Installeer Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Init: `fly launch` (in root directory)
4. Deploy: `fly deploy`

Fly.io detecteert automatisch Python en gebruikt `requirements.txt`.

---

## ✅ Checklist

- [ ] Frontend gedeployed op Vercel
- [ ] Python API gedeployed op Railway/Fly.io
- [ ] `PYTHON_API_URL` environment variable ingesteld in Vercel
- [ ] Test upload werkt end-to-end
- [ ] CORS correct geconfigureerd (als nodig)

