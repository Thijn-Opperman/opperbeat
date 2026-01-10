#!/bin/bash
# Start script voor Railway met PORT environment variable

PORT=${PORT:-8080}

uvicorn api.analyze:app --host 0.0.0.0 --port $PORT

