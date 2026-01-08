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
  confidence?: {
    bpm: number | null;
    key: number | null;
  };
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
  const [saveToDatabase, setSaveToDatabase] = useState(true); // Standaard opslaan
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
      const fileSizeMB = file.size / (1024 * 1024);
      const isLargeFile = fileSizeMB > 4; // Vercel limit is ~4.5MB
      
      let result: any;
      
      if (isLargeFile) {
        // Voor grote bestanden: stuur direct naar Railway om Vercel's body size limit te omzeilen
        console.log(`Large file detected (${fileSizeMB.toFixed(2)}MB), sending directly to Railway...`);
        
        // Haal Railway URL op
        const configResponse = await fetch('/api/analyze/config');
        if (!configResponse.ok) {
          throw new Error('Kon Railway API URL niet ophalen');
        }
        const config = await configResponse.json();
        const railwayUrl = config.apiUrl;
        
        if (!railwayUrl) {
          throw new Error('Railway API URL niet geconfigureerd');
        }
        
        // Stuur direct naar Railway
        // Voor bestanden >5MB: gebruik geen waveform om Railway timeout te voorkomen
        const formData = new FormData();
        formData.append('file', file);
        // Geen waveform voor bestanden >5MB (sneller, voorkomt timeout)
        formData.append('include_waveform', fileSizeMB > 5 ? 'false' : 'true');
        
        // Verhoog timeout naar 5 minuten voor grote bestanden
        const timeoutMs = 300000; // 5 minuten
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          console.log(`Uploading to Railway (timeout: ${timeoutMs / 1000}s)...`);
          const railwayResponse = await fetch(railwayUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            // Geen timeout headers - laat de browser de timeout bepalen
            keepalive: false, // Disable keepalive voor lange requests
          });
          
          clearTimeout(timeoutId);
          
          if (!railwayResponse.ok) {
            const errorText = await railwayResponse.text();
            throw new Error(`Railway API error: ${railwayResponse.status} - ${errorText}`);
          }
          
          const railwayResult = await railwayResponse.json();
          
          // Format resultaat zoals Vercel API route dat doet
          result = {
            success: true,
            data: {
              title: railwayResult.song_name || file.name.replace(/\.[^/.]+$/, '') || 'Onbekend',
              duration: railwayResult.duration_formatted || '0:00',
              durationSeconds: railwayResult.duration || 0,
              bpm: railwayResult.bpm || null,
              key: railwayResult.key || null,
              confidence: {
                bpm: railwayResult.bpm_confidence || null,
                key: railwayResult.key_confidence || null,
              },
              metadata: {
                artist: null,
                album: null,
                genre: null,
                bitrate: railwayResult.bitrate || null,
                sampleRate: null,
              },
              ...(railwayResult.waveform && { waveform: railwayResult.waveform }),
            },
          };

          // Als saveToDatabase = true, sla op in Supabase
          if (saveToDatabase) {
            try {
              console.log('💾 Opslaan in Supabase...');
              
              const saveFormData = new FormData();
              saveFormData.append('file', file);
              saveFormData.append('analysisData', JSON.stringify(result.data));

              const saveResponse = await fetch('/api/analyze/save', {
                method: 'POST',
                body: saveFormData,
              });

              if (saveResponse.ok) {
                const saveResult = await saveResponse.json();
                console.log('✅ Analyse opgeslagen met ID:', saveResult.analysisId);
                
                // Voeg save info toe aan result
                result.saved = true;
                result.analysisId = saveResult.analysisId;
                if (result.data) {
                  result.data.id = saveResult.analysisId;
                }
              } else {
                const saveError = await saveResponse.json();
                console.warn('⚠️ Opslaan mislukt:', saveError.error);
                result.saveWarning = saveError.error || 'Kon niet opslaan in database';
              }
            } catch (saveError: any) {
              console.warn('⚠️ Fout bij opslaan:', saveError.message);
              result.saveWarning = 'Kon niet opslaan in database: ' + saveError.message;
            }
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Analyse timeout: De analyse duurt te lang. Probeer een kleiner bestand of korter nummer (max 2 minuten voor grote bestanden).');
          }
          // Check voor network errors
          if (fetchError.message && fetchError.message.includes('Load failed')) {
            throw new Error('Verbinding met Railway verloren. Dit kan gebeuren bij zeer grote bestanden. Probeer een kleiner bestand of wacht even en probeer opnieuw.');
          }
          throw fetchError;
        }
      } else {
        // Voor kleine bestanden: gebruik Vercel API route (met metadata parsing)
        console.log(`Small file (${fileSizeMB.toFixed(2)}MB), using Vercel API route...`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('save', saveToDatabase ? 'true' : 'false'); // Voeg save parameter toe

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fout bij het analyseren van het bestand');
        }

        result = await response.json();
      }
      
      console.log('API Response:', result);
      if (result.success && result.data) {
        console.log('Analysis Data:', result.data);
        setAnalysisData(result.data);
        
        // Toon succesmelding als opgeslagen
        if (result.saved && result.analysisId) {
          console.log('✅ Analyse opgeslagen met ID:', result.analysisId);
        }
        
        // Sla analyse op in localStorage voor overview widget
        try {
          localStorage.setItem('lastAnalysis', JSON.stringify(result.data));
          const currentCount = localStorage.getItem('analysisCount');
          const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
          localStorage.setItem('analysisCount', newCount.toString());
          
          // Dispatch custom event om widgets te updaten
          window.dispatchEvent(new Event('analysisUpdated'));
        } catch (e) {
          console.warn('Kon analyse niet opslaan in localStorage:', e);
        }
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
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Muziek Analyse</h1>
            <p className="text-[#f5f5f7]/70 text-sm">Upload en analyseer je muziekstukken voor gedetailleerde inzichten</p>
          </div>

          {/* Upload Section */}
          <div className="bg-[#1a1a22] rounded-xl p-8 border border-white/8 mb-6 shadow-lg">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl transition-all ${
                isDragging
                  ? 'border-[#3b82f6] bg-[#3b82f6]/5'
                  : 'border-white/10 hover:border-[#3b82f6]/40'
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
                  <Loader2 className="w-16 h-16 text-[#3b82f6] mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-white mb-2">Bestand wordt geanalyseerd...</h3>
                  <p className="text-[#f5f5f7]/70 text-sm mb-2">Dit kan even duren, vooral voor BPM en key detectie</p>
                  {elapsedTime > 25 && (
                    <div className="mt-2 px-4 py-2 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/20">
                      <p className="text-[#f59e0b] text-xs">
                        ⚠️ Analyse duurt langer dan verwacht. Voor grote bestanden wordt alleen het begin geanalyseerd.
                      </p>
                    </div>
                  )}
                  <div className="mt-4 px-4 py-2 bg-[#3b82f6]/10 rounded-lg border border-[#3b82f6]/20">
                    <p className="text-[#3b82f6] text-sm font-medium">
                      Verstreken tijd: <span className="text-[#60a5fa]">{formatTime(elapsedTime)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-[#f5f5f7]/30 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Muziekbestand</h3>
                  <p className="text-[#f5f5f7]/70 text-sm mb-6">Sleep een bestand hierheen of klik om te selecteren</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    Bestand Selecteren
                  </button>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveToDatabase"
                      checked={saveToDatabase}
                      onChange={(e) => setSaveToDatabase(e.target.checked)}
                      className="w-4 h-4 text-[#3b82f6] bg-[#1a1a22] border-white/20 rounded focus:ring-[#3b82f6] focus:ring-2"
                    />
                    <label htmlFor="saveToDatabase" className="text-[#f5f5f7]/70 text-sm cursor-pointer">
                      Opslaan in database na analyse
                    </label>
                  </div>
                  <p className="text-[#f5f5f7]/50 text-xs mt-4">Ondersteunde formaten: MP3, WAV, FLAC, M4A</p>
                </>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                <p className="text-[#ef4444] text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Waveform */}
            <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <Waves className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold">Audio Waveform</h3>
              </div>
              <div className="h-48 bg-[#14141a] rounded-lg border border-white/5 flex items-center justify-center">
                <p className="text-[#f5f5f7]/40 text-sm">Waveform visualisatie verschijnt hier</p>
              </div>
            </div>

            {/* Track Information */}
            <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <FileAudio className="w-5 h-5 text-[#3b82f6]" />
                </div>
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
            <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold">Audio Analyse</h3>
                {isUploading && (
                  <div className="ml-auto flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#3b82f6] animate-spin" />
                    <span className="text-[#f5f5f7]/70 text-xs">{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <AnalysisMetric 
                  label="BPM" 
                  value={analysisData?.bpm ? analysisData.bpm.toString() : (isUploading ? 'Analyseren...' : '-')}
                  confidence={analysisData?.confidence?.bpm}
                />
                <AnalysisMetric 
                  label="Key" 
                  value={analysisData?.key || (isUploading ? 'Analyseren...' : '-')}
                  confidence={analysisData?.confidence?.key}
                />
                <AnalysisMetric label="Energy" value="-" />
                <AnalysisMetric label="Danceability" value="-" />
                <AnalysisMetric label="Valence" value="-" />
                <AnalysisMetric label="Acousticness" value="-" />
              </div>
            </div>

            {/* Spectral Analysis */}
            <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <Music className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold">Spectrale Analyse</h3>
              </div>
              <div className="h-64 bg-[#14141a] rounded-lg border border-white/5 flex items-center justify-center">
                <p className="text-[#f5f5f7]/40 text-sm">Spectrogram verschijnt hier</p>
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
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
      <span className="text-[#f5f5f7]/70 text-sm font-medium">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}

function AnalysisMetric({ label, value, confidence }: { label: string; value: string; confidence?: number | null }) {
  const confidencePercent = confidence ? Math.round(confidence * 100) : null;
  const confidenceColor = confidence 
    ? confidence >= 0.8 ? 'bg-[#10b981]' 
    : confidence >= 0.6 ? 'bg-[#f59e0b]' 
    : 'bg-[#ef4444]'
    : 'bg-[#3b82f6]';
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[#f5f5f7]/90 text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{value}</span>
          {confidence != null && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
              confidence >= 0.8 ? 'bg-[#10b981]/10 text-[#10b981]' 
              : confidence >= 0.6 ? 'bg-[#f59e0b]/10 text-[#f59e0b]' 
              : 'bg-[#ef4444]/10 text-[#ef4444]'
            }`}>
              {confidencePercent}%
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-[#14141a] rounded-full h-1.5">
        <div 
          className={`${confidenceColor} h-1.5 rounded-full transition-all duration-300`} 
          style={{ width: confidencePercent ? `${confidencePercent}%` : '0%' }}
        ></div>
      </div>
      {confidence != null && (
        <div className="mt-1.5 text-xs text-[#f5f5f7]/50">
          {confidence >= 0.8 ? 'Zeer accuraat' 
           : confidence >= 0.6 ? 'Accuraat' 
           : 'Matig accuraat'}
        </div>
      )}
    </div>
  );
}

