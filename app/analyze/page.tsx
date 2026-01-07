'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Upload, FileAudio, BarChart3, Music, Waves, Loader2 } from 'lucide-react';

interface AnalysisData {
  title: string;
  duration: string;
  durationSeconds: number;
  bpm: number | null;
  key: string | null;
  metadata: {
    artist: string | null;
    album: string | null;
    genre: string | null;
    bitrate: number | null;
    sampleRate: number | null;
  };
}

export default function AnalyzePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect voor elapsed time
  useEffect(() => {
    if (isUploading) {
      setElapsedTime(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isUploading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Valideer bestandstype
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/x-m4a'];
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    const isValidType = validTypes.includes(fileType) || 
      fileName.endsWith('.mp3') || 
      fileName.endsWith('.wav') || 
      fileName.endsWith('.flac') || 
      fileName.endsWith('.m4a');

    if (!isValidType) {
      setError('Ongeldig bestandstype. Gebruik MP3, WAV, FLAC of M4A.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setElapsedTime(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fout bij het analyseren van het bestand');
      }

      const result = await response.json();
      console.log('API Response:', result);
      if (result.success && result.data) {
        console.log('Analysis Data:', result.data);
        setAnalysisData(result.data);
      } else {
        throw new Error('Geen data ontvangen van de server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      setAnalysisData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Muziek Analyse</h1>
            <p className="text-white/60">Upload en analyseer je muziekstukken voor gedetailleerde inzichten</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white/5 rounded-lg p-8 border border-white/10 mb-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg transition-colors ${
                isDragging
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-white/20 hover:border-pink-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.m4a"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {isUploading ? (
                <>
                  <Loader2 className="w-16 h-16 text-pink-500 mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-white mb-2">Bestand wordt geanalyseerd...</h3>
                  <p className="text-white/60 text-sm mb-2">Dit kan even duren, vooral voor BPM en key detectie</p>
                  <div className="mt-4 px-4 py-2 bg-pink-500/20 rounded-lg border border-pink-500/30">
                    <p className="text-pink-400 text-sm font-medium">
                      Verstreken tijd: <span className="text-pink-300">{formatTime(elapsedTime)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-white/40 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Muziekbestand</h3>
                  <p className="text-white/60 text-sm mb-4">Sleep een bestand hierheen of klik om te selecteren</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Bestand Selecteren
                  </button>
                  <p className="text-white/40 text-xs mt-4">Ondersteunde formaten: MP3, WAV, FLAC, M4A</p>
                </>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Waveform */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Waves className="w-5 h-5 text-pink-500" />
                <h3 className="text-white font-semibold">Audio Waveform</h3>
              </div>
              <div className="h-48 bg-black/20 rounded flex items-center justify-center">
                <p className="text-white/40 text-sm">Waveform visualisatie verschijnt hier</p>
              </div>
            </div>

            {/* Track Information */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileAudio className="w-5 h-5 text-pink-500" />
                <h3 className="text-white font-semibold">Track Informatie</h3>
              </div>
              <div className="space-y-3">
                <InfoRow label="Titel" value={analysisData?.title || '-'} />
                <InfoRow label="Artiest" value={analysisData?.metadata.artist || '-'} />
                <InfoRow label="Album" value={analysisData?.metadata.album || '-'} />
                <InfoRow label="Genre" value={analysisData?.metadata.genre || '-'} />
                <InfoRow label="Duur" value={analysisData?.duration || '-'} />
                <InfoRow 
                  label="Bitrate" 
                  value={analysisData?.metadata.bitrate ? `${Math.round(analysisData.metadata.bitrate / 1000)} kbps` : '-'} 
                />
                <InfoRow 
                  label="Sample Rate" 
                  value={analysisData?.metadata.sampleRate ? `${Math.round(analysisData.metadata.sampleRate / 1000)} kHz` : '-'} 
                />
              </div>
            </div>

            {/* Audio Analysis */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-pink-500" />
                <h3 className="text-white font-semibold">Audio Analyse</h3>
                {isUploading && (
                  <div className="ml-auto flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                    <span className="text-white/60 text-xs">{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <AnalysisMetric 
                  label="BPM" 
                  value={analysisData?.bpm ? analysisData.bpm.toString() : (isUploading ? 'Analyseren...' : '-')} 
                />
                <AnalysisMetric 
                  label="Key" 
                  value={analysisData?.key || (isUploading ? 'Analyseren...' : '-')} 
                />
                <AnalysisMetric label="Energy" value="-" />
                <AnalysisMetric label="Danceability" value="-" />
                <AnalysisMetric label="Valence" value="-" />
                <AnalysisMetric label="Acousticness" value="-" />
              </div>
            </div>

            {/* Spectral Analysis */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Music className="w-5 h-5 text-pink-500" />
                <h3 className="text-white font-semibold">Spectrale Analyse</h3>
              </div>
              <div className="h-64 bg-black/20 rounded flex items-center justify-center">
                <p className="text-white/40 text-sm">Spectrogram verschijnt hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}

function AnalysisMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/80 text-sm">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-2">
        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '0%' }}></div>
      </div>
    </div>
  );
}

