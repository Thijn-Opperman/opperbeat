"""
Python Analyzer API voor Railway/Fly.io deployment
Gebruikt FastAPI voor serverless deployment
"""

import os
import tempfile
import base64
import traceback
import logging
from fastapi import FastAPI, HTTPException, Request
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
        logger.info("Received analyze request")
        
        # Parse request body - gebruik raw body om Pydantic validatie te vermijden
        try:
            # Lees raw body eerst
            raw_body = await request.body()
            logger.info(f"Raw body received, length: {len(raw_body)}")
            
            # Parse JSON
            body = json.loads(raw_body)
            logger.info(f"Request body parsed, keys: {list(body.keys())}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Ongeldige JSON: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error parsing request: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=400,
                detail=f"Fout bij parsen request: {str(e)}"
            )
        
        # Haal waarden direct uit body (skip strikte Pydantic validatie voor base64)
        file_data = body.get("file_data")
        file_path = body.get("file_path")
        include_waveform = body.get("include_waveform", True)
        
        logger.info(f"Request body keys: {list(body.keys())}")
        logger.info(f"file_data present: {file_data is not None}")
        logger.info(f"file_data type: {type(file_data)}")
        if file_data:
            logger.info(f"file_data length: {len(str(file_data))}")
        
        # Check of file_data is gegeven
        if not file_data and not file_path:
            logger.error("No file_data or file_path provided")
            raise HTTPException(
                status_code=400,
                detail="file_path of file_data is vereist"
            )
        
        # Als we file_data hebben (base64), schrijf naar temp file
        if file_data:
            logger.info(f"Processing file_data, length: {len(file_data) if file_data else 0}")
            # Decode base64
            try:
                # Zorg dat file_data een string is
                if not isinstance(file_data, str):
                    raise ValueError("file_data moet een string zijn")
                logger.info("Decoding base64...")
                audio_bytes = base64.b64decode(file_data)
                logger.info(f"Base64 decoded, audio size: {len(audio_bytes)} bytes")
            except Exception as e:
                logger.error(f"Base64 decode error: {str(e)}")
                logger.error(traceback.format_exc())
                raise HTTPException(
                    status_code=400,
                    detail=f"Ongeldige base64 data: {str(e)}"
                )
            
            # Maak temp file
            temp_dir = tempfile.gettempdir()
            temp_file_path = os.path.join(temp_dir, f"audio_{os.urandom(8).hex()}.tmp")
            logger.info(f"Writing temp file: {temp_file_path}")
            
            with open(temp_file_path, 'wb') as f:
                f.write(audio_bytes)
            
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
            logger.info(f"Starting audio analysis for: {file_path}")
            result = analyze_audio_simple(
                file_path,
                include_waveform=include_waveform
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

