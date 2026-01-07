#!/usr/bin/env python3
"""
Audio analysis script using librosa for BPM and key detection
"""
import sys
import json
import librosa
import numpy as np

def detect_key(y, sr):
    """Detect musical key using chroma features"""
    try:
        # Calculate chroma features using Constant-Q transform
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        
        # Average over time
        chroma_mean = np.mean(chroma, axis=1)
        
        # Key profiles (Krumhansl-Schmuckler)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        max_correlation = -np.inf
        detected_key = ''
        detected_mode = ''
        
        # Test all 12 keys in major and minor
        for key in range(12):
            # Major
            rotated_major = np.roll(major_profile, key)
            major_corr = np.corrcoef(chroma_mean, rotated_major)[0, 1]
            if major_corr > max_correlation:
                max_correlation = major_corr
                detected_key = note_names[key]
                detected_mode = 'maj'
            
            # Minor
            rotated_minor = np.roll(minor_profile, key)
            minor_corr = np.corrcoef(chroma_mean, rotated_minor)[0, 1]
            if minor_corr > max_correlation:
                max_correlation = minor_corr
                detected_key = note_names[key]
                detected_mode = 'min'
        
        if max_correlation > 0.3:
            return f"{detected_key} {detected_mode}"
        return None
    except Exception as e:
        print(f"Error in key detection: {e}", file=sys.stderr)
        return None

def analyze_audio(file_path):
    """Analyze audio file and return BPM and key"""
    try:
        # Load audio file (limit to first 30 seconds for speed)
        y, sr = librosa.load(file_path, duration=30)
        
        # Detect BPM
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        # Extract scalar value from numpy array
        tempo_value = float(tempo[0]) if hasattr(tempo, '__len__') and len(tempo) > 0 else float(tempo)
        bpm = round(tempo_value)
        
        # Validate BPM range
        if bpm < 1 or bpm > 300:
            bpm = None
        
        # Detect key
        key = detect_key(y, sr)
        
        return {
            'bpm': bpm,
            'key': key,
            'success': True
        }
    except Exception as e:
        return {
            'bpm': None,
            'key': None,
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No file path provided'}), file=sys.stderr)
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = analyze_audio(file_path)
    print(json.dumps(result))

