"""
Python Analyzer API voor Railway/Fly.io deployment
Gebruikt FastAPI voor serverless deployment
"""

import os
import tempfile
import base64
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Optional
from python.music_analyzer import analyze_audio_simple
import json

app = FastAPI()

# CORS middleware voor cross-origin requests van Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In productie: specifieke origins zoals ["https://your-app.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    """Request model voor audio analyse"""
    file_path: Optional[str] = None
    file_data: Optional[str] = None  # base64 encoded audio
    include_waveform: bool = True
    
    class Config:
        # Maak validatie minder strikt voor grote base64 strings
        str_strip_whitespace = False
        # Geen pattern validatie voor base64 strings
        extra = "allow"


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Python Audio Analyzer API"}


@app.post("/api/analyze")
async def analyze(request: Request):
    """
    Analyseer audio bestand
    
    Accepteert:
    - file_path: pad naar audio bestand (als al op server)
    - file_data: base64 encoded audio data
    """
    should_cleanup = False
    temp_file_path = None
    
    try:
        # Parse request body
        try:
            body = await request.json()
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Ongeldige JSON: {str(e)}"
            )
        
        # Haal waarden direct uit body (skip strikte Pydantic validatie voor base64)
        file_data = body.get("file_data")
        file_path = body.get("file_path")
        include_waveform = body.get("include_waveform", True)
        
        # Check of file_data is gegeven
        if not file_data and not file_path:
            raise HTTPException(
                status_code=400,
                detail="file_path of file_data is vereist"
            )
        
        # Als we file_data hebben (base64), schrijf naar temp file
        if file_data:
            # Decode base64
            try:
                # Zorg dat file_data een string is
                if not isinstance(file_data, str):
                    raise ValueError("file_data moet een string zijn")
                audio_bytes = base64.b64decode(file_data)
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
            
        elif file_path:
            # file_path is al gezet hierboven
            pass
            
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
                include_waveform=include_waveform
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

