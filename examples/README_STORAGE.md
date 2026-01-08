# Opslag Voorbeelden voor Music Analyzer

Dit document toont verschillende manieren om geanalyseerde audio data op te slaan.

## Overzicht

De analyzer extraheert:
- ✅ BPM (met confidence)
- ✅ Key (majeur/minor met confidence)
- ✅ Song naam
- ✅ Duur
- ✅ Bitrate
- ✅ Waveform data (optioneel, downsampled)

**Belangrijk:** Alleen de geanalyseerde data wordt opgeslagen, niet het originele audio bestand.

## Voorbeeld 1: JSON Opslag

### Basis gebruik

```python
from music_analyzer_standalone import analyze_audio
from examples.storage_example import save_to_json

# Analyseer
result = analyze_audio('track.mp3', include_waveform=True)

# Sla op als JSON
save_to_json(result, output_dir="data/analyses")
```

### JSON Structuur

```json
{
  "bpm": 128,
  "bpm_confidence": 0.95,
  "key": "C",
  "mode": "major",
  "key_full": "C major",
  "key_confidence": 0.87,
  "song_name": "My Song",
  "duration": 225.5,
  "duration_formatted": "3:45",
  "bitrate": 320,
  "waveform": {
    "waveform": [...],
    "waveform_samples": 5000,
    "original_samples": 9922500,
    "sample_rate": 44100,
    "downsampled": true
  },
  "analyzed_at": "2024-01-15T10:30:00",
  "analyzer_version": "1.0.0"
}
```

### Laad JSON terug

```python
from examples.storage_example import load_from_json

data = load_from_json("data/analyses/My_Song_20240115_103000.json")
print(f"BPM: {data['bpm']}")
```

## Voorbeeld 2: SQLite Database Opslag

### Basis gebruik

```python
from music_analyzer_standalone import analyze_audio
from examples.storage_example import save_to_database, query_database

# Analyseer
result = analyze_audio('track.mp3', include_waveform=True)

# Sla op in database
analysis_id = save_to_database(result, db_path="data/music_analyses.db")

# Query analyses
analyses = query_database(limit=10)
for analysis in analyses:
    print(f"{analysis['song_name']}: {analysis['bpm']} BPM")
```

### Database Schema

```sql
CREATE TABLE audio_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_name TEXT NOT NULL,
    filename TEXT,
    filepath TEXT,
    bpm INTEGER,
    bpm_confidence REAL,
    key TEXT,
    mode TEXT,
    key_full TEXT,
    key_confidence REAL,
    duration REAL,
    duration_formatted TEXT,
    bitrate INTEGER,
    waveform_data TEXT,  -- JSON string
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzer_version TEXT
);
```

### Query Voorbeelden

```python
import sqlite3

conn = sqlite3.connect("data/music_analyses.db")
cursor = conn.cursor()

# Zoek op BPM range
cursor.execute("""
    SELECT song_name, bpm, key_full 
    FROM audio_analyses 
    WHERE bpm BETWEEN 120 AND 140
    ORDER BY bpm
""")

# Zoek op key
cursor.execute("""
    SELECT song_name, bpm 
    FROM audio_analyses 
    WHERE key = 'C' AND mode = 'major'
""")

# Groepeer op key
cursor.execute("""
    SELECT key_full, COUNT(*) as count, AVG(bpm) as avg_bpm
    FROM audio_analyses
    GROUP BY key_full
    ORDER BY count DESC
""")
```

## Voorbeeld 3: Batch Verwerking

```python
from examples.storage_example import batch_analyze_and_save

audio_files = [
    "track1.mp3",
    "track2.mp3",
    "track3.mp3"
]

# Analyseer en sla op als JSON
results = batch_analyze_and_save(
    audio_files, 
    output_format="json",
    output_path="data/analyses"
)

# Of sla op in database
results = batch_analyze_and_save(
    audio_files,
    output_format="database",
    output_path="data/music_analyses.db"
)
```

## Voorbeeld 4: Gebruik in API/Web Context

```python
from examples.storage_example import analyze_and_save_for_api

# Analyseer en krijg API-ready response
response = analyze_and_save_for_api(
    "track.mp3",
    include_waveform=True
)

# Response structuur:
# {
#     "success": True,
#     "data": {
#         "title": "...",
#         "duration": "...",
#         "bpm": 128,
#         "key": "C major",
#         "waveform": {...},
#         "confidence": {
#             "bpm": 0.95,
#             "key": 0.87
#         }
#     }
# }
```

## Opslag Strategieën

### Strategie 1: Alleen Metadata (Zonder Waveform)

```python
result = analyze_audio('track.mp3', include_waveform=False)
save_to_json(result)  # Kleinere bestanden
```

**Voordelen:**
- Kleinere bestanden
- Snellere verwerking
- Minder opslagruimte

### Strategie 2: Met Waveform

```python
result = analyze_audio('track.mp3', include_waveform=True)
save_to_json(result)  # Grotere bestanden, maar waveform beschikbaar
```

**Voordelen:**
- Waveform beschikbaar voor visualisatie
- Geen origineel audio bestand nodig voor visualisatie

### Strategie 3: Hybride (Metadata in DB, Waveform in JSON)

```python
result = analyze_audio('track.mp3', include_waveform=True)

# Sla metadata op in database
save_to_database(result)

# Sla waveform apart op als JSON (optioneel)
if 'waveform' in result:
    waveform_file = f"waveforms/{result['song_name']}_waveform.json"
    with open(waveform_file, 'w') as f:
        json.dump(result['waveform'], f)
```

## Best Practices

1. **Gebruik JSON voor:**
   - Eenvoudige opslag
   - Kleine datasets
   - Snelle ontwikkeling
   - Export/import

2. **Gebruik Database voor:**
   - Grote datasets
   - Complexe queries
   - Relaties tussen data
   - Productie omgevingen

3. **Waveform Opslag:**
   - Alleen opslaan als je visualisatie nodig hebt
   - Overweeg aparte opslag voor waveforms
   - Gebruik downsampling (standaard 5000 samples)

4. **Backup:**
   - Maak regelmatig backups van database
   - Archiveer JSON bestanden
   - Houd versie bij van analyzer

## Command Line Gebruik

```bash
# Analyseer en sla op als JSON
python examples/storage_example.py track.mp3 json

# Analyseer en sla op in database
python examples/storage_example.py track.mp3 database
```

## Integratie in Next.js API

De analyzer is al geïntegreerd in `/app/api/analyze/route.ts`. 
De API retourneert data die direct kan worden opgeslagen:

```typescript
// In je API route
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();

// Sla op in database of JSON
// Zie examples/storage_example.py voor Python implementatie
```


