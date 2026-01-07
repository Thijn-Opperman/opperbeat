#!/usr/bin/env python3
"""
Test de analyzer met het bestand uit de public folder
"""
import sys
import os
import json

# Voeg app directory toe aan path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from music_analyzer_standalone import analyze_audio, analyze_audio_simple

def test_public_file():
    """Test met het bestand uit public folder"""
    test_file = "public/Marlon Hoffstadt & Pegassi - It's That Time Yoyoyo (RTDV MASHUP).mp3"
    
    if not os.path.exists(test_file):
        print(f"❌ Bestand niet gevonden: {test_file}")
        return False
    
    print("=" * 70)
    print("🧪 TEST: Music Analyzer met Public Folder Bestand")
    print("=" * 70)
    print(f"\n📁 Bestand: {test_file}\n")
    
    try:
        # Test 1: Volledige analyse
        print("1️⃣  Volledige analyse (met waveform)...")
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
                print(f"                  (Downsampled van {wf['original_samples']:,} samples)")
        
        # Test 2: Vereenvoudigde analyse (zoals API gebruikt)
        print("\n2️⃣  Vereenvoudigde analyse (zoals API gebruikt)...")
        simple_result = analyze_audio_simple(test_file, include_waveform=True)
        
        print("\n✅ API-STYLE RESULTATEN:")
        print(f"   🎵 Naam:        {simple_result['song_name']}")
        print(f"   🎯 BPM:         {simple_result['bpm']}")
        if 'bpm_confidence' in simple_result and simple_result['bpm_confidence']:
            print(f"      Confidence:  {simple_result['bpm_confidence']*100:.0f}%")
        print(f"   🎹 Key:         {simple_result['key']}")
        if 'key_confidence' in simple_result and simple_result['key_confidence']:
            print(f"      Confidence:  {simple_result['key_confidence']*100:.0f}%")
        print(f"   ⏱️  Duur:        {simple_result['duration_formatted']}")
        print(f"   📡 Bitrate:     {simple_result['bitrate']} kbps" if simple_result['bitrate'] else "   📡 Bitrate:     Niet beschikbaar")
        
        if 'waveform' in simple_result:
            wf = simple_result['waveform']
            print(f"   🌊 Waveform:    {wf['waveform_samples']} samples beschikbaar")
        
        # Test 3: JSON output (zoals API zou retourneren)
        print("\n3️⃣  JSON Output (API format)...")
        api_format = {
            "success": True,
            "data": {
                "title": simple_result['song_name'],
                "duration": simple_result['duration_formatted'],
                "durationSeconds": simple_result['duration'],
                "bpm": simple_result['bpm'],
                "key": simple_result['key'],
                "metadata": {
                    "bitrate": simple_result['bitrate'],
                    "sampleRate": simple_result.get('waveform', {}).get('sample_rate') if 'waveform' in simple_result else None,
                },
                "waveform": simple_result.get('waveform'),
            }
        }
        
        json_str = json.dumps(api_format, indent=2, ensure_ascii=False)
        print(f"   ✅ JSON grootte: {len(json_str):,} bytes")
        print(f"   ✅ JSON valid:   {json.loads(json_str) is not None}")
        
        # Test 4: Validatie
        print("\n4️⃣  Validatie...")
        checks = []
        
        # Check BPM
        if simple_result['bpm'] and 1 <= simple_result['bpm'] <= 300:
            checks.append(("✅ BPM binnen bereik", True))
        else:
            checks.append(("❌ BPM buiten bereik", False))
        
        # Check Key
        if simple_result['key'] and ('major' in simple_result['key'] or 'minor' in simple_result['key']):
            checks.append(("✅ Key format correct", True))
        else:
            checks.append(("❌ Key format incorrect", False))
        
        # Check Duration
        if simple_result['duration'] > 0:
            checks.append(("✅ Duration positief", True))
        else:
            checks.append(("❌ Duration niet positief", False))
        
        # Check Waveform
        if 'waveform' in simple_result:
            wf = simple_result['waveform']
            if wf['waveform_samples'] > 0:
                checks.append(("✅ Waveform data aanwezig", True))
            else:
                checks.append(("❌ Waveform leeg", False))
        else:
            checks.append(("⚠️  Waveform niet opgenomen", False))
        
        for check_name, passed in checks:
            print(f"   {check_name}")
        
        all_passed = all(passed for _, passed in checks)
        
        print("\n" + "=" * 70)
        if all_passed:
            print("✅ ALLE TESTS GESLAAGD!")
        else:
            print("⚠️  SOMIGE TESTS GEFAALD")
        print("=" * 70)
        
        return all_passed
        
    except Exception as e:
        print(f"\n❌ FOUT: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_public_file()
    sys.exit(0 if success else 1)

