"""
Python Analyzer API voor Railway/Fly.io deployment
Gebruikt FastAPI voor serverless deployment
"""

import os
import tempfile
import base64
import traceback
import logging
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Optional
from python.music_analyzer import analyze_audio_simple
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware voor cross-origin requests van Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In productie: specifieke origins zoals ["https://your-app.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event voor logging
@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI application starting up...")
    try:
        # Test import
        from python.music_analyzer import analyze_audio_simple
        logger.info("Successfully imported analyze_audio_simple")
    except Exception as e:
        logger.error(f"Failed to import analyze_audio_simple: {str(e)}")
        logger.error(traceback.format_exc())


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

@app.get("/health")
async def health():
    """Health check endpoint voor Railway"""
    return {"status": "healthy", "service": "Python Audio Analyzer API"}


@app.post("/api/analyze")
async def analyze(
    file: Optional[UploadFile] = File(None),
    file_path: Optional[str] = Form(None),
    include_waveform: str = Form("true")
):
    """
    Analyseer audio bestand
    
    Accepteert:
    - file: UploadFile (multipart/form-data)
    - file_path: pad naar audio bestand (als al op server) - via form field
    - include_waveform: boolean via form field
    """
    should_cleanup = False
    temp_file_path = None
    
    try:
        logger.info("Received analyze request")
        logger.info(f"File provided: {file is not None}")
        logger.info(f"File path provided: {file_path is not None}")
        
        # Check of file of file_path is gegeven
        if not file and not file_path:
            logger.error("No file or file_path provided")
            raise HTTPException(
                status_code=400,
                detail="file of file_path is vereist"
            )
        
        # Als we een uploaded file hebben
        if file:
            logger.info(f"Processing uploaded file: {file.filename}, content_type: {file.content_type}")
            
            # Maak temp file
            temp_dir = tempfile.gettempdir()
            temp_file_path = os.path.join(temp_dir, f"audio_{os.urandom(8).hex()}.tmp")
            logger.info(f"Writing temp file: {temp_file_path}")
            
            # Schrijf uploaded file naar temp file
            with open(temp_file_path, 'wb') as f:
                content = await file.read()
                f.write(content)
                logger.info(f"File written, size: {len(content)} bytes")
            
            file_path = temp_file_path
            should_cleanup = True
            logger.info(f"Temp file created: {file_path}")
            
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
            # Converteer include_waveform string naar boolean
            include_waveform_bool = include_waveform.lower() in ('true', '1', 'yes', 'on')
            logger.info(f"Starting audio analysis for: {file_path}, include_waveform: {include_waveform_bool}")
            result = analyze_audio_simple(
                file_path,
                include_waveform=include_waveform_bool
            )
            logger.info(f"Audio analysis complete, BPM: {result.get('bpm')}, Key: {result.get('key')}")
            return result
            
        except Exception as e:
            logger.error(f"Audio analysis error: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Fout bij audio analyse: {str(e)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
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

