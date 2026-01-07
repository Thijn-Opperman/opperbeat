"""
Vercel Serverless API endpoint voor audio analyse
Gebruikt FastAPI voor serverless deployment
"""

import os
import tempfile
import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from python.music_analyzer import analyze_audio_simple

app = FastAPI()


class AnalyzeRequest(BaseModel):
    """Request model voor audio analyse"""
    file_path: Optional[str] = None
    file_data: Optional[str] = None  # base64 encoded audio
    include_waveform: bool = True


@app.post("/")
async def analyze(request: AnalyzeRequest):
    """
    Analyseer audio bestand
    
    Accepteert:
    - file_path: pad naar audio bestand (als al op server)
    - file_data: base64 encoded audio data
    """
    should_cleanup = False
    temp_file_path = None
    
    try:
        # Als we file_data hebben (base64), schrijf naar temp file
        if request.file_data:
            # Decode base64
            try:
                audio_bytes = base64.b64decode(request.file_data)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Ongeldige base64 data: {str(e)}"
                )
            
            # Maak temp file
            temp_dir = tempfile.gettempdir()
            temp_file_path = os.path.join(temp_dir, f"audio_{os.urandom(8).hex()}.tmp")
            
            with open(temp_file_path, 'wb') as f:
                f.write(audio_bytes)
            
            file_path = temp_file_path
            should_cleanup = True
            
        elif request.file_path:
            file_path = request.file_path
            
            # Check of file bestaat
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=404,
                    detail=f"Bestand niet gevonden: {file_path}"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail="file_path of file_data is vereist"
            )
        
        # Analyseer audio
        try:
            result = analyze_audio_simple(
                file_path,
                include_waveform=request.include_waveform
            )
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Fout bij audio analyse: {str(e)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )
    finally:
        # Cleanup temp file als we die hebben gemaakt
        if should_cleanup and temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass

