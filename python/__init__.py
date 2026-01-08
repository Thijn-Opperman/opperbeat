"""
Python music analyzer module
"""

from .music_analyzer import (
    analyze_audio,
    analyze_audio_simple,
    detect_bpm_accurate,
    detect_key_accurate,
    get_bitrate,
    get_song_name,
    extract_waveform
)

__all__ = [
    'analyze_audio',
    'analyze_audio_simple',
    'detect_bpm_accurate',
    'detect_key_accurate',
    'get_bitrate',
    'get_song_name',
    'extract_waveform'
]


