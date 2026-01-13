"""
Python Analyzer API voor Railway/Fly.io deployment
Gebruikt FastAPI voor serverless deployment
"""

import os
import tempfile
import base64
import traceback
import logging
import subprocess
import re
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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


class DownloadRequest(BaseModel):
    """Request model voor muziek download"""
    source: str  # 'youtube', 'soundcloud', 'search'
    input: str   # URL of zoekterm


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
    include_waveform: Optional[str] = Form(None)
):
    """
    Analyseer audio bestand
    
    Accepteert:
    - file: UploadFile (multipart/form-data)
    - file_path: pad naar audio bestand (als al op server) - via form field
    - include_waveform: boolean via form field (string: "true" of "false", optioneel)
    """
    should_cleanup = False
    temp_file_path = None
    
    try:
        logger.info("Received analyze request")
        logger.info(f"File provided: {file is not None}")
        if file:
            logger.info(f"File name: {file.filename}, content_type: {file.content_type}")
        logger.info(f"File path provided: {file_path is not None}")
        logger.info(f"Include waveform: {include_waveform} (type: {type(include_waveform)})")
        
        # Check of file of file_path is gegeven
        if not file and not file_path:
            logger.error("No file or file_path provided")
            raise HTTPException(
                status_code=400,
                detail="file of file_path is vereist"
            )
        
        # Als we een uploaded file hebben
        if file:
            # Sanitize filename voor veiligheid
            safe_filename = file.filename or "audio_file"
            # Verwijder speciale karakters die problemen kunnen veroorzaken
            safe_filename = "".join(c for c in safe_filename if c.isalnum() or c in "._- ")
            logger.info(f"Processing uploaded file: {safe_filename}, content_type: {file.content_type}")
            
            # Maak temp file met veilige naam
            temp_dir = tempfile.gettempdir()
            file_ext = os.path.splitext(safe_filename)[1] or ".tmp"
            temp_file_path = os.path.join(temp_dir, f"audio_{os.urandom(8).hex()}{file_ext}")
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
            # Check bestandsgrootte EERST voor optimalisatie
            file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
            logger.info(f"File size: {file_size_mb:.2f} MB")
            
            # Converteer include_waveform string naar boolean (veilige conversie)
            if include_waveform is None or include_waveform == "":
                include_waveform_bool = False  # Default False voor performance
            else:
                include_waveform_str = str(include_waveform).lower().strip()
                include_waveform_bool = include_waveform_str in ('true', '1', 'yes', 'on')
            
            logger.info(f"Waveform setting after conversion: {include_waveform_bool} (original: {include_waveform})")
            
            # Voor bestanden >5MB: gebruik optimalisaties om Railway timeout te voorkomen
            # Railway heeft een timeout van ~30 seconden, dus we moeten sneller zijn
            waveform_samples = 5000  # Standaard aantal samples
            if file_size_mb > 5:
                logger.info("Large file detected (>5MB), optimizing analysis for Railway timeout...")
                sample_rate = 22050  # Lagere sample rate voor snellere analyse
                # Behoud waveform setting van request, maar gebruik minder samples voor snellere verwerking
                waveform_samples = 2000 if include_waveform_bool else 5000  # Minder samples voor grote bestanden
                max_duration = 120  # Analyseer alleen eerste 2 minuten voor grote bestanden
                logger.info(f"Using optimized settings: sample_rate={sample_rate}, waveform={include_waveform_bool}, waveform_samples={waveform_samples}, max_duration={max_duration}s")
            elif file_size_mb > 3:
                # Voor middelgrote bestanden (3-5MB): gebruik lagere sample rate maar wel waveform
                logger.info("Medium file detected (3-5MB), using medium optimization...")
                sample_rate = 22050  # Lagere sample rate
                # Behoud waveform setting van request
                max_duration = None  # Analyseer volledig bestand
                logger.info(f"Using medium optimization: sample_rate={sample_rate}, waveform={include_waveform_bool}")
            else:
                # Kleine bestanden (<3MB): volledige analyse
                sample_rate = 44100  # Standaard sample rate
                max_duration = None  # Analyseer volledig bestand
                logger.info(f"Small file, using full analysis: sample_rate={sample_rate}, waveform={include_waveform_bool}")
            
            logger.info(f"Starting audio analysis for: {file_path}, sample_rate: {sample_rate}, include_waveform: {include_waveform_bool}, waveform_samples: {waveform_samples}, max_duration: {max_duration}")
            result = analyze_audio_simple(
                file_path,
                sample_rate=sample_rate,
                include_waveform=include_waveform_bool,
                waveform_samples=waveform_samples,
                max_duration=max_duration
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
            
    except ValidationError as ve:
        # Pydantic validation errors
        logger.error(f"Validation error: {str(ve)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=422,
            detail=f"Validatiefout: {str(ve)}"
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


def is_youtube_url(url: str) -> bool:
    """Check of URL een YouTube URL is"""
    youtube_patterns = [
        r'(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)',
    ]
    for pattern in youtube_patterns:
        if re.search(pattern, url):
            return True
    return False


def is_soundcloud_url(url: str) -> bool:
    """Check of URL een SoundCloud URL is"""
    return 'soundcloud.com' in url.lower()


def search_youtube(query: str) -> Optional[str]:
    """Zoek YouTube video op basis van query"""
    try:
        import yt_dlp
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'default_search': 'ytsearch1',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(query, download=False)
            if info and 'entries' in info and len(info['entries']) > 0:
                return info['entries'][0]['url']
    except Exception as e:
        logger.error(f"Error searching YouTube: {str(e)}")
    return None


def search_soundcloud(query: str) -> Optional[str]:
    """Zoek SoundCloud track op basis van query"""
    try:
        import yt_dlp
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'default_search': 'scsearch1',
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(query, download=False)
            if info and 'entries' in info and len(info['entries']) > 0:
                return info['entries'][0]['url']
    except Exception as e:
        logger.error(f"Error searching SoundCloud: {str(e)}")
    return None


@app.post("/download")
async def download_music(request: DownloadRequest):
    """
    Download muziek van YouTube, SoundCloud of zoek op naam
    Converteert naar 320 kbps MP3
    """
    temp_dir = tempfile.gettempdir()
    output_file = None
    actual_output = None
    
    try:
        source = request.source.lower()
        input_text = request.input.strip()
        
        if not input_text:
            raise HTTPException(status_code=400, detail="Input is verplicht")
        
        logger.info(f"Download request: source={source}, input={input_text[:50]}")
        
        # Bepaal URL
        url = None
        
        if source == 'youtube':
            if is_youtube_url(input_text):
                url = input_text
            else:
                # Zoek op YouTube
                logger.info(f"Searching YouTube for: {input_text}")
                url = search_youtube(input_text)
                if not url:
                    raise HTTPException(status_code=404, detail="Geen YouTube video gevonden")
        
        elif source == 'soundcloud':
            if is_soundcloud_url(input_text):
                url = input_text
            else:
                # Zoek op SoundCloud
                logger.info(f"Searching SoundCloud for: {input_text}")
                url = search_soundcloud(input_text)
                if not url:
                    raise HTTPException(status_code=404, detail="Geen SoundCloud track gevonden")
        
        elif source == 'search':
            # Probeer eerst YouTube, dan SoundCloud
            logger.info(f"Searching for: {input_text}")
            url = search_youtube(input_text)
            if not url:
                url = search_soundcloud(input_text)
            if not url:
                raise HTTPException(status_code=404, detail="Geen resultaat gevonden")
        
        else:
            raise HTTPException(status_code=400, detail="Ongeldige source. Gebruik 'youtube', 'soundcloud' of 'search'")
        
        if not url:
            raise HTTPException(status_code=404, detail="Geen URL gevonden")
        
        logger.info(f"Downloading from URL: {url}")
        
        # Download en converteer naar 320 kbps MP3
        try:
            import yt_dlp
        except ImportError:
            raise HTTPException(status_code=500, detail="yt-dlp niet geïnstalleerd. Installeer via: pip install yt-dlp")
        
        # Genereer output filename
        output_base = os.path.join(temp_dir, f"download_{os.urandom(8).hex()}")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_base + '.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get('title', 'download')
            # Sanitize filename
            title = re.sub(r'[^\w\s-]', '', title)[:100]
            
            # Find the actual output file
            actual_output = output_base + '.mp3'
            if not os.path.exists(actual_output):
                # Try to find the file with different extensions
                for ext in ['.m4a', '.webm', '.opus', '.ogg']:
                    test_file = output_base + ext
                    if os.path.exists(test_file):
                        # Convert to MP3
                        logger.info(f"Converting {ext} to MP3...")
                        actual_output = output_base + '.mp3'
                        result = subprocess.run(
                            ['ffmpeg', '-i', test_file, '-codec:a', 'libmp3lame', '-b:a', '320k', actual_output, '-y'],
                            capture_output=True,
                            text=True
                        )
                        if result.returncode != 0:
                            logger.error(f"FFmpeg error: {result.stderr}")
                            raise HTTPException(status_code=500, detail="Conversie naar MP3 mislukt")
                        # Remove original
                        try:
                            os.unlink(test_file)
                        except:
                            pass
                        break
            
            if not os.path.exists(actual_output):
                raise HTTPException(status_code=500, detail="Download mislukt - bestand niet gevonden")
            
            logger.info(f"Download complete: {actual_output}")
            
            # Return file as download
            return FileResponse(
                actual_output,
                media_type='audio/mpeg',
                filename=f"{title}.mp3",
                headers={
                    'Content-Disposition': f'attachment; filename="{title}.mp3"'
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Fout bij downloaden: {str(e)}"
        )
    finally:
        # Cleanup temp files (na een delay zodat download kan voltooien)
        # In productie zou je dit via een background task kunnen doen
        pass

