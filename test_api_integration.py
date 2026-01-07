#!/usr/bin/env python3
"""
Test de API integratie - simuleert wat de API route doet
"""
import sys
import os
import json
import subprocess
import tempfile
import shutil

# Voeg app directory toe aan path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from music_analyzer_standalone import analyze_audio_simple

def test_api_integration():
    """Test de API integratie zoals de route.ts het zou doen"""
    test_file = "public/Marlon Hoffstadt & Pegassi - It's That Time Yoyoyo (RTDV MASHUP).mp3"
    
    if not os.path.exists(test_file):
        print(f"❌ Bestand niet gevonden: {test_file}")
        return False
    
    print("=" * 70)
    print("🧪 TEST: API Integratie (Simulatie)")
    print("=" * 70)
    print(f"\n📁 Test bestand: {test_file}\n")
    
    try:
        # Simuleer wat de API route doet
        print("1️⃣  Simuleer API route proces...")
        
        # Stap 1: Kopieer bestand naar temp (zoals API doet)
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"test_audio_{os.getpid()}.mp3")
        shutil.copy2(test_file, temp_file)
        print(f"   ✅ Bestand gekopieerd naar: {temp_file}")
        
        # Stap 2: Roep analyzer aan zoals API route doet
        print("\n2️⃣  Roep analyzer aan (zoals API route)...")
        app_dir = os.path.join(os.path.dirname(__file__), 'app')
        
        # Simuleer de exacte command die de API route gebruikt
        python_cmd = f'''python3 -c "import sys; sys.path.insert(0, '{app_dir}'); from music_analyzer_standalone import analyze_audio_simple; import json; result = analyze_audio_simple('{temp_file}', include_waveform=True); print(json.dumps(result))"'''
        
        result = subprocess.run(
            python_cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__)
        )
        
        if result.returncode != 0:
            print(f"   ❌ Fout: {result.stderr}")
            return False
        
        # Parse output
        analyzer_result = json.loads(result.stdout)
        print("   ✅ Analyzer resultaat ontvangen")
        
        # Stap 3: Formatteer zoals API response
        print("\n3️⃣  Formatteer API response...")
        api_response = {
            "success": True,
            "data": {
                "title": analyzer_result['song_name'],
                "duration": analyzer_result['duration_formatted'],
                "durationSeconds": analyzer_result['duration'],
                "bpm": analyzer_result['bpm'],
                "key": analyzer_result['key'],
                "metadata": {
                    "bitrate": analyzer_result['bitrate'],
                    "sampleRate": analyzer_result.get('waveform', {}).get('sample_rate') if 'waveform' in analyzer_result else None,
                },
                "waveform": analyzer_result.get('waveform'),
            }
        }
        
        print("\n✅ API RESPONSE:")
        print(json.dumps(api_response, indent=2, ensure_ascii=False))
        
        # Stap 4: Validatie
        print("\n4️⃣  Validatie API response...")
        checks = []
        
        if api_response['success']:
            checks.append(("✅ Success flag", True))
        else:
            checks.append(("❌ Success flag", False))
        
        if 'data' in api_response:
            checks.append(("✅ Data object aanwezig", True))
            
            data = api_response['data']
            if data.get('bpm'):
                checks.append(("✅ BPM aanwezig", True))
            else:
                checks.append(("❌ BPM ontbreekt", False))
            
            if data.get('key'):
                checks.append(("✅ Key aanwezig", True))
            else:
                checks.append(("❌ Key ontbreekt", False))
            
            if data.get('title'):
                checks.append(("✅ Title aanwezig", True))
            else:
                checks.append(("❌ Title ontbreekt", False))
            
            if data.get('waveform'):
                checks.append(("✅ Waveform aanwezig", True))
            else:
                checks.append(("⚠️  Waveform niet opgenomen", False))
        else:
            checks.append(("❌ Data object ontbreekt", False))
        
        for check_name, passed in checks:
            print(f"   {check_name}")
        
        # Cleanup
        if os.path.exists(temp_file):
            os.remove(temp_file)
            print(f"\n   🧹 Temp bestand verwijderd: {temp_file}")
        
        all_passed = all(passed for _, passed in checks)
        
        print("\n" + "=" * 70)
        if all_passed:
            print("✅ API INTEGRATIE TEST GESLAAGD!")
        else:
            print("⚠️  SOMIGE CHECKS GEFAALD")
        print("=" * 70)
        
        return all_passed
        
    except Exception as e:
        print(f"\n❌ FOUT: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_api_integration()
    sys.exit(0 if success else 1)

