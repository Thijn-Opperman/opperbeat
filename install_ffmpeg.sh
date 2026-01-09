#!/bin/bash
# Script om FFmpeg te installeren op Railway
# Dit script wordt uitgevoerd tijdens de build fase

set -e

echo "Checking for FFmpeg..."

# Check if ffmpeg is already available
if command -v ffmpeg &> /dev/null; then
    echo "FFmpeg found at: $(which ffmpeg)"
    ffmpeg -version
    exit 0
fi

# Try to install via apt (if available)
if command -v apt-get &> /dev/null; then
    echo "Installing FFmpeg via apt-get..."
    apt-get update
    apt-get install -y ffmpeg
    ffmpeg -version
    exit 0
fi

# If nixpacks is used, FFmpeg should be installed via nixpacks.toml
echo "FFmpeg should be installed via nixpacks. Checking..."
which ffmpeg || echo "WARNING: FFmpeg not found. Make sure nixpacks.toml includes FFmpeg."

