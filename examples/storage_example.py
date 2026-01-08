#!/usr/bin/env python3
"""
Voorbeeld: Opslag van geanalyseerde audio data
Toont hoe je resultaten kunt opslaan in JSON of database
"""
import sys
import os
import json
from pathlib import Path
from datetime import datetime

# Voeg app directory toe aan path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from music_analyzer_standalone import analyze_audio, analyze_audio_simple


# ============================================================================
# VOORBEELD 1: Opslag in JSON bestand
# ============================================================================

def save_to_json(result, output_dir="data/analyses"):
    """
    Sla analyse resultaat op als JSON bestand
    
    Args:
        result: Resultaat dictionary van analyze_audio
        output_dir: Directory waar JSON bestanden worden opgeslagen
    """
    # Maak directory aan als die niet bestaat
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Genereer bestandsnaam op basis van song naam
    safe_name = "".join(c for c in result['song_name'] if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_name = safe_name.replace(' ', '_')[:50]  # Limiteer lengte
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{safe_name}_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)
    
    # Voeg metadata toe
    result_with_meta = {
        **result,
        "analyzed_at": datetime.now().isoformat(),
        "analyzer_version": "1.0.0"
    }
    
    # Sla op
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(result_with_meta, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Opgeslagen in: {filepath}")
    return filepath


def load_from_json(filepath):
    """Laad analyse resultaat uit JSON bestand"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


# ============================================================================
# VOORBEELD 2: Opslag in SQLite database
# ============================================================================

def save_to_database(result, db_path="data/music_analyses.db"):
    """
    Sla analyse resultaat op in SQLite database
    
    Args:
        result: Resultaat dictionary van analyze_audio
        db_path: Pad naar SQLite database bestand
    """
    import sqlite3
    
    # Maak directory aan als die niet bestaat
    Path(os.path.dirname(db_path)).mkdir(parents=True, exist_ok=True)
    
    # Maak database connectie
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Maak tabel aan als die niet bestaat
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audio_analyses (
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
            waveform_data TEXT,  -- JSON string voor waveform
            analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            analyzer_version TEXT
        )
    ''')
    
    # Converteer waveform naar JSON string als het bestaat
    waveform_json = None
    if 'waveform' in result:
        waveform_json = json.dumps(result['waveform'])
    
    # Insert data
    cursor.execute('''
        INSERT INTO audio_analyses (
            song_name, filename, filepath,
            bpm, bpm_confidence,
            key, mode, key_full, key_confidence,
            duration, duration_formatted,
            bitrate, waveform_data, analyzer_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        result['song_name'],
        result.get('filename'),
        result.get('filepath'),
        result['bpm'],
        result.get('bpm_confidence'),
        result['key'],
        result.get('mode'),
        result.get('key_full'),
        result.get('key_confidence'),
        result['duration'],
        result['duration_formatted'],
        result.get('bitrate'),
        waveform_json,
        "1.0.0"
    ))
    
    conn.commit()
    analysis_id = cursor.lastrowid
    conn.close()
    
    print(f"✅ Opgeslagen in database (ID: {analysis_id})")
    return analysis_id


def query_database(db_path="data/music_analyses.db", limit=10):
    """Haal analyses op uit database"""
    import sqlite3
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Maak rows toegankelijk als dict
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM audio_analyses 
        ORDER BY analyzed_at DESC 
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    # Converteer naar dictionaries
    results = []
    for row in rows:
        result = dict(row)
        # Parse waveform JSON als het bestaat
        if result.get('waveform_data'):
            result['waveform'] = json.loads(result['waveform_data'])
        results.append(result)
    
    return results


# ============================================================================
# VOORBEELD 3: Batch verwerking en opslag
# ============================================================================

def batch_analyze_and_save(audio_files, output_format="json", output_path="data/analyses"):
    """
    Analyseer meerdere bestanden en sla ze op
    
    Args:
        audio_files: List van paden naar audio bestanden
        output_format: "json" of "database"
        output_path: Pad voor output (JSON directory of database bestand)
    """
    results = []
    
    for i, audio_file in enumerate(audio_files, 1):
        print(f"\n[{i}/{len(audio_files)}] Analyseren: {Path(audio_file).name}")
        
        try:
            # Analyseer (zonder waveform voor snellere verwerking)
            result = analyze_audio_simple(audio_file, include_waveform=False)
            
            # Sla op
            if output_format == "json":
                save_to_json(result, output_path)
            elif output_format == "database":
                save_to_database(result, output_path)
            
            results.append(result)
            
        except Exception as e:
            print(f"❌ Fout bij {audio_file}: {e}")
            continue
    
    print(f"\n✅ {len(results)} bestanden geanalyseerd en opgeslagen")
    return results


# ============================================================================
# VOORBEELD 4: Gebruik in API/Web context
# ============================================================================

def analyze_and_save_for_api(audio_file_path, include_waveform=True):
    """
    Analyseer audio en retourneer data geschikt voor API response
    Optioneel: sla ook op in database
    
    Args:
        audio_file_path: Pad naar audio bestand
        include_waveform: Of waveform moet worden meegenomen
    
    Returns:
        Dictionary met analyse resultaten
    """
    # Analyseer
    result = analyze_audio(audio_file_path, include_waveform=include_waveform)
    
    # Optioneel: sla op in database
    # save_to_database(result)
    
    # Retourneer data geschikt voor API
    return {
        "success": True,
        "data": {
            "title": result['song_name'],
            "duration": result['duration_formatted'],
            "durationSeconds": result['duration'],
            "bpm": result['bpm'],
            "key": result.get('key_full', f"{result['key']} {result.get('mode', '')}"),
            "metadata": {
                "bitrate": result.get('bitrate'),
                "sampleRate": result.get('waveform', {}).get('sample_rate') if 'waveform' in result else None,
            },
            "waveform": result.get('waveform'),
            "confidence": {
                "bpm": result.get('bpm_confidence'),
                "key": result.get('key_confidence'),
            }
        }
    }


# ============================================================================
# MAIN: Demonstratie
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Gebruik: python storage_example.py <audio_file> [json|database]")
        print("\nVoorbeelden:")
        print("  python storage_example.py track.mp3 json")
        print("  python storage_example.py track.mp3 database")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    storage_type = sys.argv[2] if len(sys.argv) > 2 else "json"
    
    if not os.path.exists(audio_file):
        print(f"❌ Bestand niet gevonden: {audio_file}")
        sys.exit(1)
    
    print("=" * 60)
    print("📊 ANALYSE EN OPSLAG VOORBEELD")
    print("=" * 60)
    
    # Analyseer
    print(f"\n🎵 Analyseren: {Path(audio_file).name}")
    result = analyze_audio(audio_file, include_waveform=True)
    
    print(f"\n✅ Resultaten:")
    print(f"   BPM: {result['bpm']}")
    print(f"   Key: {result['key_full']}")
    print(f"   Duur: {result['duration_formatted']}")
    
    # Sla op
    print(f"\n💾 Opslaan als {storage_type}...")
    if storage_type == "json":
        save_to_json(result)
    elif storage_type == "database":
        save_to_database(result)
        # Toon query voorbeeld
        print("\n📋 Query voorbeeld:")
        analyses = query_database(limit=5)
        print(f"   {len(analyses)} analyses gevonden in database")
    else:
        print(f"❌ Onbekend opslag type: {storage_type}")
    
    print("\n" + "=" * 60)


