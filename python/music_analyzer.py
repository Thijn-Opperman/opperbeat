"""
Music Analyzer - Pure functies voor serverless gebruik
Extraheert: BPM, Key, Naam, Duur, Bitrate, Waveform

Gebruik:
    from python.music_analyzer import analyze_audio
    result = analyze_audio('track.mp3')
"""

import librosa
import numpy as np
from pathlib import Path
try:
    from mutagen import File as MutagenFile
    MUTAGEN_AVAILABLE = True
except ImportError:
    MUTAGEN_AVAILABLE = False


# Keys voor key detectie
KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Krumhansl-Schmuckler profiles voor majeur en minor
# Gebaseerd op psychologisch onderzoek naar tooncentrum perceptie
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def detect_bpm_accurate(y, sr):
    """
    Nauwkeurige BPM detectie met multi-tempo analyse
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        bpm: BPM waarde (integer, afgerond)
        confidence: Betrouwbaarheid (0-1)
    """
    # Methode 1: Standaard beat tracking
    tempo1, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units='time')
    tempo1 = float(tempo1[0] if isinstance(tempo1, np.ndarray) else tempo1)
    
    # Methode 2: Tempogram analyse (meer robuust)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo2 = librosa.beat.tempo(onset_envelope=onset_env, sr=sr, aggregate=np.median)
    tempo2 = float(tempo2[0] if isinstance(tempo2, np.ndarray) else tempo2)
    
    # Methode 3: Multi-tempo detectie
    tempos = librosa.beat.tempo(y=y, sr=sr, aggregate=None)
    if isinstance(tempos, np.ndarray) and len(tempos) > 0:
        tempo3 = float(np.median(tempos))
    else:
        tempo3 = tempo1
    
    # Combineer resultaten (gewogen gemiddelde)
    # Geef meer gewicht aan tempogram (meest betrouwbaar)
    combined_tempo = (tempo1 * 0.3 + tempo2 * 0.5 + tempo3 * 0.2)
    
    # Bereken confidence op basis van consistentie
    tempos_list = [tempo1, tempo2, tempo3]
    std_dev = np.std(tempos_list)
    mean_tempo = np.mean(tempos_list)
    confidence = max(0, 1 - (std_dev / mean_tempo))  # Lagere std = hogere confidence
    
    # Rond af naar dichtstbijzijnde integer
    final_tempo = round(combined_tempo)
    
    return final_tempo, confidence


def detect_key_accurate(y, sr):
    """
    Nauwkeurige key detectie met Krumhansl-Schmuckler algoritme
    Detecteert zowel chroma als majeur/minor mode
    
    Args:
        y: Audio time series
        sr: Sample rate
    
    Returns:
        key: Toonsoort (bijv. 'C', 'D#', etc.)
        mode: 'major' of 'minor'
        confidence: Betrouwbaarheid (0-1)
    """
    # Chromagram voor tonaliteit
    chromagram = librosa.feature.chroma_stft(y=y, sr=sr)
    
    # Gemiddelde chroma vector
    chroma_mean = np.mean(chromagram, axis=1)
    
    # Normaliseer chroma vector
    chroma_norm = chroma_mean / (np.sum(chroma_mean) + 1e-6)
    
    # Test alle 24 mogelijkheden (12 keys × 2 modes)
    correlations = []
    
    for key_idx in range(12):
        # Rotate profiles voor elke key
        major_rotated = np.roll(MAJOR_PROFILE, key_idx)
        minor_rotated = np.roll(MINOR_PROFILE, key_idx)
        
        # Bereken correlatie
        major_corr = np.corrcoef(chroma_norm, major_rotated)[0, 1]
        minor_corr = np.corrcoef(chroma_norm, minor_rotated)[0, 1]
        
        correlations.append((key_idx, 'major', major_corr))
        correlations.append((key_idx, 'minor', minor_corr))
    
    # Vind beste match
    best_match = max(correlations, key=lambda x: x[2])
    key_index, mode, correlation = best_match
    
    # Normaliseer confidence (correlatie kan negatief zijn)
    confidence = max(0, min(1, (correlation + 1) / 2))
    
    key = KEYS[key_index]
    
    return key, mode, confidence


def get_bitrate(filename):
    """
    Haal bitrate op uit audio bestand metadata
    
    Args:
        filename: Pad naar audio bestand
    
    Returns:
        bitrate: Bitrate in kbps (None als niet beschikbaar)
    """
    if not MUTAGEN_AVAILABLE:
        return None
    
    try:
        audio_file = MutagenFile(filename)
        if audio_file is None:
            return None
        
        # Probeer bitrate uit info te halen
        if hasattr(audio_file, 'info') and hasattr(audio_file.info, 'bitrate'):
            bitrate = audio_file.info.bitrate
            # Convert naar kbps als nodig (sommige formats geven bps)
            if bitrate > 1000:
                bitrate = bitrate / 1000
            return int(bitrate)
        
        # Alternatieve methode voor sommige formats
        if hasattr(audio_file, 'info') and hasattr(audio_file.info, 'bitrate_mode'):
            # Voor MP3: probeer andere attributen
            pass
        
    except Exception as e:
        print(f"Waarschuwing: Kon bitrate niet ophalen: {e}")
        return None
    
    return None


def get_song_name(filename):
    """
    Haal song naam op uit metadata of filename
    
    Args:
        filename: Pad naar audio bestand
    
    Returns:
        song_name: Naam van het nummer
    """
    # Probeer eerst metadata
    if MUTAGEN_AVAILABLE:
        try:
            audio_file = MutagenFile(filename)
            if audio_file is not None:
                # Probeer verschillende metadata tags
                for tag_key in ['TIT2', 'TITLE', '©nam', 'title']:
                    if tag_key in audio_file:
                        title = audio_file[tag_key][0]
                        if title:
                            return str(title)
        except:
            pass
    
    # Fallback naar filename (zonder extensie)
    return Path(filename).stem


def extract_waveform(y, sr, max_samples=5000):
    """
    Extraheer waveform data voor opslag
    Downsampled voor efficiënte opslag (niet het originele bestand)
    
    Args:
        y: Audio time series
        sr: Sample rate
        max_samples: Maximum aantal samples voor waveform (default: 5000)
                    Voor visualisatie is dit meestal voldoende
    
    Returns:
        waveform: Downsampled waveform array (list voor JSON serialisatie)
        waveform_samples: Aantal samples in waveform
        original_samples: Aantal samples in origineel
        sample_rate: Sample rate
    """
    original_samples = len(y)
    
    # Downsample als nodig
    if len(y) > max_samples:
        # Gebruik lineaire interpolatie voor downsampling
        indices = np.linspace(0, len(y) - 1, max_samples)
        waveform = np.interp(indices, np.arange(len(y)), y)
    else:
        waveform = y.copy()
    
    # Converteer naar list voor JSON serialisatie
    waveform_list = waveform.tolist()
    
    return {
        "waveform": waveform_list,
        "waveform_samples": len(waveform_list),
        "original_samples": int(original_samples),
        "sample_rate": int(sr),
        "downsampled": original_samples > max_samples
    }


def analyze_audio(filename, sample_rate=44100, include_waveform=True, waveform_samples=5000):
    """
    Analyseer audio bestand en extraheer alle gewenste informatie
    
    Args:
        filename: Pad naar audio bestand (mp3, wav, m4a, flac, etc.)
        sample_rate: Sample rate voor analyse (default: 44100)
        include_waveform: Of waveform data moet worden opgenomen (default: True)
        waveform_samples: Maximum aantal samples voor waveform (default: 5000)
    
    Returns:
        Dictionary met:
            - bpm: BPM waarde (integer)
            - bpm_confidence: Betrouwbaarheid BPM (0-1)
            - key: Toonsoort (bijv. 'C', 'D#')
            - mode: 'major' of 'minor'
            - key_confidence: Betrouwbaarheid key (0-1)
            - song_name: Naam van het nummer
            - duration: Duur in seconden (float)
            - duration_formatted: Duur geformatteerd (bijv. "3:45")
            - bitrate: Bitrate in kbps (None als niet beschikbaar)
            - waveform: Waveform data (downsampled, alleen als include_waveform=True)
            - filename: Originele bestandsnaam
    """
    # Laad audio
    y, sr = librosa.load(filename, sr=sample_rate)
    
    # BPM detectie
    bpm, bpm_confidence = detect_bpm_accurate(y, sr)
    
    # Key detectie
    key, mode, key_confidence = detect_key_accurate(y, sr)
    
    # Duur berekenen
    duration_seconds = len(y) / sr
    minutes = int(duration_seconds // 60)
    seconds = int(duration_seconds % 60)
    duration_formatted = f"{minutes}:{seconds:02d}"
    
    # Song naam
    song_name = get_song_name(filename)
    
    # Bitrate
    bitrate = get_bitrate(filename)
    
    # Waveform extractie
    waveform_data = None
    if include_waveform:
        waveform_data = extract_waveform(y, sr, max_samples=waveform_samples)
    
    # Resultaat
    result = {
        "bpm": bpm,
        "bpm_confidence": round(bpm_confidence, 3),
        "key": key,
        "mode": mode,
        "key_full": f"{key} {mode}",  # Bijv. "C major" of "A minor"
        "key_confidence": round(key_confidence, 3),
        "song_name": song_name,
        "duration": round(duration_seconds, 2),
        "duration_formatted": duration_formatted,
        "bitrate": bitrate,
        "bitrate_kbps": bitrate,  # Alias voor duidelijkheid
        "filename": Path(filename).name,
        "filepath": str(filename)
    }
    
    # Voeg waveform toe als gevraagd
    if waveform_data:
        result["waveform"] = waveform_data
    
    return result


def analyze_audio_simple(filename, sample_rate=44100, include_waveform=False):
    """
    Vereenvoudigde versie - retourneert alleen de essentiële velden
    
    Args:
        filename: Pad naar audio bestand
        sample_rate: Sample rate voor analyse (default: 44100)
        include_waveform: Of waveform data moet worden opgenomen (default: False)
    
    Returns:
        Dictionary met: bpm, key, song_name, duration, bitrate, (optioneel: waveform)
    """
    result = analyze_audio(filename, sample_rate, include_waveform=include_waveform)
    
    simple_result = {
        "bpm": result["bpm"],
        "bpm_confidence": result.get("bpm_confidence"),
        "key": result["key_full"],
        "key_confidence": result.get("key_confidence"),
        "song_name": result["song_name"],
        "duration": result["duration"],
        "duration_formatted": result["duration_formatted"],
        "bitrate": result["bitrate"]
    }
    
    # Voeg waveform toe als gevraagd
    if include_waveform and "waveform" in result:
        simple_result["waveform"] = result["waveform"]
    
    return simple_result

