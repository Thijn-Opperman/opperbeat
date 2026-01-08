'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Upload, FileAudio, BarChart3, Music, Waves, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

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
  const { t } = useI18n();
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
      setError(t.errors.invalidFileType);
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
          throw new Error(t.errors.couldNotFetchRailwayUrl);
        }
        const config = await configResponse.json();
        const railwayUrl = config.apiUrl;
        
        if (!railwayUrl) {
          throw new Error(t.errors.railwayUrlNotConfigured);
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
              title: railwayResult.song_name || file.name.replace(/\.[^/.]+$/, '') || t.metadata.unknown,
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
            throw new Error(t.errors.analysisTimeout);
          }
          // Check voor network errors
          if (fetchError.message && fetchError.message.includes('Load failed')) {
            throw new Error(t.errors.connectionLost);
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
          throw new Error(errorData.error || t.errors.somethingWentWrong);
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
        throw new Error(t.errors.noDataReceived);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight gradient-text">{t.analyze.title}</h1>
            <p className="text-secondary text-sm">{t.analyze.subtitle}</p>
          </div>

          {/* Upload Section */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 lg:p-8 border border-theme mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-glow)] transition-all">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 border-2 border-dashed rounded-xl transition-all ${
                isDragging
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg shadow-[var(--primary-glow)]'
                  : 'border-[var(--primary)]/30 hover:border-[var(--primary)]/60 hover:bg-[var(--primary)]/5'
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
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--primary)] mb-4 animate-spin drop-shadow-[0_0_12px_var(--primary-glow)]" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 text-center px-4">{t.analyze.analyzing}</h3>
                  <p className="text-secondary text-xs sm:text-sm mb-2 text-center px-4">{t.analyze.analyzingDescription}</p>
                  {elapsedTime > 25 && (
                    <div className="mt-2 px-4 py-2 bg-[var(--warning)]/20 rounded-lg border border-[var(--warning)]/30 shadow-lg shadow-[var(--warning-glow)]">
                      <p className="text-[var(--warning)] text-xs font-medium">
                        {t.analyze.analysisTimeout}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 px-4 py-2 bg-[var(--primary)]/20 rounded-lg border border-[var(--primary)]/30 shadow-lg shadow-[var(--primary-glow)]">
                    <p className="text-[var(--primary)] text-sm font-bold">
                      {t.analyze.elapsedTime}: <span className="text-[var(--secondary)]">{formatTime(elapsedTime)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-muted mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 text-center px-4">{t.analyze.uploadMusicFile}</h3>
                  <p className="text-secondary text-xs sm:text-sm mb-6 text-center px-4">{t.analyze.dragDropOrClick}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[var(--primary)] hover:opacity-90 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-lg shadow-[var(--primary-glow)] hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    {t.analyze.selectFile}
                  </button>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveToDatabase"
                      checked={saveToDatabase}
                      onChange={(e) => setSaveToDatabase(e.target.checked)}
                      className="w-4 h-4 text-[var(--primary)] bg-surface-elevated border-[var(--primary)]/30 rounded focus:ring-[var(--primary)] focus:ring-2"
                    />
                    <label htmlFor="saveToDatabase" className="text-secondary text-sm cursor-pointer">
                      {t.analyze.saveToDatabase}
                    </label>
                  </div>
                  <p className="text-muted text-xs mt-4">{t.analyze.supportedFormats}</p>
                </>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-[var(--error)]/20 border border-[var(--error)]/30 rounded-lg shadow-lg shadow-[var(--error-glow)]">
                <p className="text-[var(--error)] text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Audio Waveform */}
            <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-glow)] transition-all card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--primary)]/20 rounded-lg shadow-lg shadow-[var(--primary-glow)]">
                  <Waves className="w-5 h-5 text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]" />
                </div>
                <h3 className="text-primary font-bold">{t.analyze.audioWaveform}</h3>
              </div>
              <div className="h-48 bg-surface rounded-lg border border-theme flex items-center justify-center">
                <p className="text-muted text-sm">{t.analyze.waveformPlaceholder}</p>
              </div>
            </div>

            {/* Track Information */}
            <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-glow)] transition-all card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--accent)]/20 rounded-lg shadow-lg shadow-[var(--accent-glow)]">
                  <FileAudio className="w-5 h-5 text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]" />
                </div>
                <h3 className="text-primary font-bold">{t.analyze.trackInfo}</h3>
              </div>
              <div className="space-y-3">
                <InfoRow label={t.analyze.titleLabel} value={analysisData?.title || '-'} />
                <InfoRow label={t.analyze.artist} value={analysisData?.metadata.artist || '-'} />
                <InfoRow label={t.analyze.album} value={analysisData?.metadata.album || '-'} />
                <InfoRow label={t.analyze.genre} value={analysisData?.metadata.genre || '-'} />
                <InfoRow label={t.analyze.duration} value={analysisData?.duration || '-'} />
                <InfoRow 
                  label={t.analyze.bitrate} 
                  value={analysisData?.metadata.bitrate ? `${Math.round(analysisData.metadata.bitrate / 1000)} kbps` : '-'} 
                />
                <InfoRow 
                  label={t.analyze.sampleRate} 
                  value={analysisData?.metadata.sampleRate ? `${Math.round(analysisData.metadata.sampleRate / 1000)} kHz` : '-'} 
                />
              </div>
            </div>

            {/* Audio Analysis */}
            <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-glow)] transition-all card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--primary)]/20 rounded-lg shadow-lg shadow-[var(--primary-glow)]">
                  <BarChart3 className="w-5 h-5 text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]" />
                </div>
                <h3 className="text-primary font-bold">{t.analyze.audioAnalysis}</h3>
                {isUploading && (
                  <div className="ml-auto flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin drop-shadow-[0_0_8px_var(--primary-glow)]" />
                    <span className="text-secondary text-xs font-medium">{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <AnalysisMetric 
                  label="BPM" 
                  value={analysisData?.bpm ? analysisData.bpm.toString() : (isUploading ? t.errors.analyzing : '-')}
                  confidence={analysisData?.confidence?.bpm}
                />
                <AnalysisMetric 
                  label="Key" 
                  value={analysisData?.key || (isUploading ? t.errors.analyzing : '-')}
                  confidence={analysisData?.confidence?.key}
                />
                <AnalysisMetric label={t.analyze.energy} value="-" />
                <AnalysisMetric label={t.analyze.danceability} value="-" />
                <AnalysisMetric label={t.analyze.valence} value="-" />
                <AnalysisMetric label={t.analyze.acousticness} value="-" />
              </div>
            </div>

            {/* Spectral Analysis */}
            <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-glow)] transition-all card-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--secondary)]/20 rounded-lg shadow-lg shadow-[var(--secondary-glow)]">
                  <Music className="w-5 h-5 text-[var(--secondary)] drop-shadow-[0_0_8px_var(--secondary-glow)]" />
                </div>
                <h3 className="text-primary font-bold">{t.analyze.audioAnalysis}</h3>
              </div>
              <div className="h-64 bg-surface rounded-lg border border-theme flex items-center justify-center">
                <p className="text-muted text-sm">{t.analyze.waveformPlaceholder}</p>
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
    <div className="flex justify-between items-center py-2.5 border-b border-theme last:border-0">
      <span className="text-secondary text-sm font-medium">{label}</span>
      <span className="text-primary font-bold text-sm">{value}</span>
    </div>
  );
}

function AnalysisMetric({ label, value, confidence }: { label: string; value: string; confidence?: number | null }) {
  const { t } = useI18n();
  const confidencePercent = confidence ? Math.round(confidence * 100) : null;
  const confidenceColor = confidence 
    ? confidence >= 0.8 ? 'bg-[var(--success)]' 
    : confidence >= 0.6 ? 'bg-[var(--warning)]' 
    : 'bg-[var(--error)]'
    : 'bg-[var(--primary)]';
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-primary text-sm font-bold">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{value}</span>
          {confidence != null && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${
              confidence >= 0.8 ? 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30 shadow-sm shadow-[var(--success-glow)]' 
              : confidence >= 0.6 ? 'bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30 shadow-sm shadow-[var(--warning-glow)]' 
              : 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/30 shadow-sm shadow-[var(--error-glow)]'
            }`}>
              {confidencePercent}%
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-surface rounded-full h-2 shadow-inner">
        <div 
          className={`${confidenceColor} h-2 rounded-full transition-all duration-300 shadow-lg`} 
          style={{ width: confidencePercent ? `${confidencePercent}%` : '0%' }}
        ></div>
      </div>
      {confidence != null && (
        <div className="mt-1.5 text-xs text-tertiary font-medium">
          {confidence >= 0.8 ? t.analyze.veryAccurate
           : confidence >= 0.6 ? t.analyze.accurate
           : t.analyze.moderatelyAccurate}
        </div>
      )}
    </div>
  );
}

