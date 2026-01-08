#!/usr/bin/env python3
"""
Test script voor music_analyzer_standalone
"""
import sys
import os
import json

# Voeg app directory toe aan path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from music_analyzer_standalone import analyze_audio, analyze_audio_simple

def test_analyzer():
    """Test de analyzer met het test bestand"""
    test_file = "public/Marlon Hoffstadt & Pegassi - It's That Time Yoyoyo (RTDV MASHUP).mp3"
    
    if not os.path.exists(test_file):
        print(f"❌ Test bestand niet gevonden: {test_file}")
        return False
    
    print("=" * 60)
    print("🧪 TEST: Music Analyzer Standalone")
    print("=" * 60)
    print(f"\n📁 Test bestand: {test_file}\n")
    
    try:
        # Test volledige analyse
        print("1️⃣  Test volledige analyse (met waveform)...")
        result = analyze_audio(test_file, include_waveform=True)
        
        print("\n✅ RESULTATEN:")
        print(f"   🎵 Naam:        {result['song_name']}")
        print(f"   🎯 BPM:         {result['bpm']} (confidence: {result['bpm_confidence']*100:.0f}%)")
        print(f"   🎹 Key:         {result['key_full']} (confidence: {result['key_confidence']*100:.0f}%)")
        print(f"   ⏱️  Duur:        {result['duration_formatted']} ({result['duration']:.2f} sec)")
        print(f"   📡 Bitrate:     {result['bitrate']} kbps" if result['bitrate'] else "   📡 Bitrate:     Niet beschikbaar")
        
        if 'waveform' in result:
            wf = result['waveform']
            print(f"   🌊 Waveform:    {wf['waveform_samples']} samples")
            if wf['downsampled']:
                print(f"                  (Downsampled van {wf['original_samples']} samples)")
        
        # Test vereenvoudigde versie
        print("\n2️⃣  Test vereenvoudigde analyse (zonder waveform)...")
        simple_result = analyze_audio_simple(test_file, include_waveform=False)
        
        print("\n✅ VEREENVOUDIGDE RESULTATEN:")
        print(f"   🎵 Naam:        {simple_result['song_name']}")
        print(f"   🎯 BPM:         {simple_result['bpm']}")
        print(f"   🎹 Key:         {simple_result['key']}")
        print(f"   ⏱️  Duur:        {simple_result['duration_formatted']}")
        print(f"   📡 Bitrate:     {simple_result['bitrate']} kbps" if simple_result['bitrate'] else "   📡 Bitrate:     Niet beschikbaar")
        
        # Test JSON serialisatie
        print("\n3️⃣  Test JSON serialisatie...")
        json_str = json.dumps(result, indent=2, ensure_ascii=False)
        print(f"   ✅ JSON grootte: {len(json_str)} bytes")
        
        # Test opslag
        print("\n4️⃣  Test opslag naar JSON bestand...")
        output_file = "test_analysis_output.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"   ✅ Opgeslagen in: {output_file}")
        
        print("\n" + "=" * 60)
        print("✅ ALLE TESTS GESLAAGD!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ FOUT: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_analyzer()
    sys.exit(0 if success else 1)


