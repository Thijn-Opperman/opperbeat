# Music Analyzer Standalone

Een standalone versie van de music analyzer die je eenvoudig kunt overnemen naar andere projecten.

## Functies

Extraheert nauwkeurig:
- ✅ **BPM** (Beats Per Minute) - met multi-tempo analyse
- ✅ **Key** (Toonsoort) - met Krumhansl-Schmuckler algoritme (majeur/minor)
- ✅ **Naam** - uit metadata of filename
- ✅ **Duur** - in seconden en geformatteerd (bijv. "3:45")
- ✅ **Bitrate** - in kbps (uit metadata)
- ✅ **Waveform** - audio waveform data (downsampled voor efficiënte opslag)

**Belangrijk:** Alleen de geanalyseerde informatie wordt opgeslagen, niet het originele audio bestand zelf.

## Installatie

```bash
pip install -r requirements_standalone.txt
```

Of handmatig:
```bash
pip install librosa==0.10.1 numpy==1.24.3 mutagen==1.47.0
```

## Gebruik

### Basis gebruik

```python
from music_analyzer_standalone import analyze_audio

# Analyseer een audio bestand (met waveform)
result = analyze_audio('track.mp3', include_waveform=True)

print(f"Naam: {result['song_name']}")
print(f"BPM: {result['bpm']}")
print(f"Key: {result['key_full']}")  # Bijv. "C major" of "A minor"
print(f"Duur: {result['duration_formatted']}")  # Bijv. "3:45"
print(f"Bitrate: {result['bitrate']} kbps")
print(f"Waveform samples: {result['waveform']['waveform_samples']}")
```

### Zonder waveform (kleinere bestanden)

```python
# Zonder waveform voor kleinere JSON bestanden
result = analyze_audio('track.mp3', include_waveform=False)
```

### Vereenvoudigde versie

```python
from music_analyzer_standalone import analyze_audio_simple

result = analyze_audio_simple('track.mp3')
# Retourneert alleen: bpm, key, song_name, duration, duration_formatted, bitrate
```

### Command line

```bash
python music_analyzer_standalone.py track.mp3
```

Dit toont de resultaten en slaat ze op als JSON.

## Resultaat structuur

### Volledige versie (`analyze_audio`)

```python
{
    "bpm": 128,                          # Integer BPM
    "bpm_confidence": 0.95,              # Betrouwbaarheid (0-1)
    "key": "C",                          # Toonsoort
    "mode": "major",                     # 'major' of 'minor'
    "key_full": "C major",               # Volledige key string
    "key_confidence": 0.87,              # Betrouwbaarheid (0-1)
    "song_name": "My Song",              # Naam uit metadata of filename
    "duration": 225.5,                   # Duur in seconden (float)
    "duration_formatted": "3:45",         # Geformatteerde duur
    "bitrate": 320,                      # Bitrate in kbps (None als niet beschikbaar)
    "bitrate_kbps": 320,                 # Alias voor duidelijkheid
    "waveform": {                        # Waveform data (alleen als include_waveform=True)
        "waveform": [...],               # Array met waveform samples (downsampled)
        "waveform_samples": 5000,        # Aantal samples in waveform
        "original_samples": 9922500,     # Aantal samples in origineel
        "sample_rate": 44100,            # Sample rate
        "downsampled": true              # Of waveform is downsampled
    },
    "filename": "track.mp3",             # Bestandsnaam
    "filepath": "/path/to/track.mp3"     # Volledig pad
}
```

### Vereenvoudigde versie (`analyze_audio_simple`)

```python
{
    "bpm": 128,
    "key": "C major",
    "song_name": "My Song",
    "duration": 225.5,
    "duration_formatted": "3:45",
    "bitrate": 320
}
```

## Ondersteunde formaten

- MP3
- WAV
- M4A
- FLAC
- En andere formaten die librosa ondersteunt

## Technische details

### BPM Detectie
- Gebruikt 3 verschillende methoden:
  1. Standaard beat tracking (`librosa.beat.beat_track`)
  2. Tempogram analyse (`librosa.beat.tempo`)
  3. Multi-tempo detectie
- Combineert resultaten met gewogen gemiddelde
- Berekent confidence op basis van consistentie

### Key Detectie
- Gebruikt Krumhansl-Schmuckler algoritme
- Detecteert zowel chroma als majeur/minor mode
- Test alle 24 mogelijkheden (12 keys × 2 modes)
- Berekent confidence op basis van correlatie

### Bitrate
- Gebruikt `mutagen` voor metadata extractie
- Werkt voor MP3, M4A, FLAC en andere formaten
- Retourneert `None` als bitrate niet beschikbaar is

### Waveform
- Extraheert audio waveform data voor visualisatie
- Wordt automatisch downsampled naar max 5000 samples (standaard)
- Bespaart ruimte: origineel kan miljoenen samples hebben
- Perfect voor visualisatie zonder het originele bestand op te slaan
- Kan worden uitgeschakeld met `include_waveform=False`

## Voorbeeld output

```
==================================================
🎵 Analyseren: my_track.mp3
==================================================

📊 RESULTATEN:
==================================================
🎵 Naam:        My Awesome Track
🎯 BPM:         128 (95% confidence)
🎹 Key:         C major (87% confidence)
⏱️  Duur:        3:45 (225.50 sec)
📡 Bitrate:     320 kbps
🌊 Waveform:    5000 samples
                (Downsampled van 9922500 samples)
==================================================

💾 Resultaten opgeslagen in: my_track_analysis.json
```

**Belangrijk:** Het originele audio bestand wordt NIET opgeslagen, alleen de geanalyseerde data en waveform.

## Waveform gebruiken voor visualisatie

De waveform data kan worden gebruikt om een visualisatie te maken zonder het originele bestand:

```python
import json
import matplotlib.pyplot as plt
import numpy as np

# Laad geanalyseerde data
with open('track_analysis.json', 'r') as f:
    data = json.load(f)

# Haal waveform op
if 'waveform' in data:
    waveform = np.array(data['waveform']['waveform'])
    sample_rate = data['waveform']['sample_rate']
    duration = data['duration']

# Maak tijd-as (in seconden)
time_axis = np.linspace(0, duration, len(waveform))

# Visualiseer
plt.figure(figsize=(12, 4))
plt.plot(time_axis, waveform, alpha=0.7)
plt.title(f"{data['song_name']} - BPM: {data['bpm']} | Key: {data['key_full']}")
plt.xlabel('Time (seconds)')
plt.ylabel('Amplitude')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('waveform_visualization.png')
plt.close()
```

## Kopiëren naar nieuw project

1. Kopieer `music_analyzer_standalone.py` naar je nieuwe project
2. Kopieer `requirements_standalone.txt` en installeer dependencies
3. Importeer en gebruik:

```python
from music_analyzer_standalone import analyze_audio
result = analyze_audio('your_track.mp3')
```

Dat is alles! 🎵

