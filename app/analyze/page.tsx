'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Upload, FileAudio, BarChart3, Music, Waves, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { WaveformData, isWaveformObject } from '@/lib/types';

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
  waveform?: WaveformData | null;
  artworkUrl?: string | null;
  id?: string;
}

interface AnalysisApiResponse {
  success: boolean;
  data?: AnalysisData;
  saved?: boolean;
  analysisId?: string | null;
  saveWarning?: string;
}

interface BatchResult {
  filename: string;
  success: boolean;
  data?: AnalysisData;
  error?: string;
  analysisId?: string | null;
}

export default function AnalyzePage() {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saveToDatabase, setSaveToDatabase] = useState(true); // Standaard opslaan
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchFiles, setBatchFiles] = useState<File[]>([]); // Lijst van alle bestanden in batch
  const [expandedWaveforms, setExpandedWaveforms] = useState<Set<number>>(new Set()); // Track welke waveforms uitgeklapt zijn
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
    setBatchFiles([]); // Reset batch files voor enkel bestand
    setBatchResults([]); // Reset batch results

    try {
      const fileSizeMB = file.size / (1024 * 1024);
      const isLargeFile = fileSizeMB > 4; // Vercel limit is ~4.5MB
      
      let result: AnalysisApiResponse;
      
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
        const formData = new FormData();
        formData.append('file', file);
        // Altijd waveform ophalen voor visualisatie
        formData.append('include_waveform', 'true');
        
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
          
          console.log('Railway API Response:', railwayResult);
          console.log('Railway waveform data:', railwayResult.waveform ? 'Present' : 'Missing');
          if (railwayResult.waveform) {
            console.log('Railway waveform structure:', {
              hasWaveform: !!railwayResult.waveform.waveform,
              isArray: Array.isArray(railwayResult.waveform.waveform),
              length: railwayResult.waveform.waveform?.length || 0,
              keys: Object.keys(railwayResult.waveform)
            });
          }
          
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
          
          console.log('Formatted result with waveform:', result.data?.waveform ? 'Present' : 'Missing');

          // Als saveToDatabase = true, sla op in Supabase
          if (saveToDatabase) {
            try {
              console.log('💾 Opslaan in Supabase...');
              
              const saveFormData = new FormData();
              saveFormData.append('file', file);
              if (result.data) {
                saveFormData.append('analysisData', JSON.stringify(result.data));
              }

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
                  // Voeg artwork URL toe als beschikbaar
                  if (saveResult.artworkUrl) {
                    result.data.artworkUrl = saveResult.artworkUrl;
                  }
                }
              } else {
                const saveError = await saveResponse.json();
                console.warn('⚠️ Opslaan mislukt:', saveError.error);
                result.saveWarning = saveError.error || 'Kon niet opslaan in database';
              }
            } catch (saveError: unknown) {
              const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
              console.warn('⚠️ Fout bij opslaan:', errorMessage);
              result.saveWarning = 'Kon niet opslaan in database: ' + errorMessage;
            }
          }
        } catch (fetchError: unknown) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error) {
            if (fetchError.name === 'AbortError') {
              throw new Error(t.errors.analysisTimeout);
            }
            // Check voor network errors
            if (fetchError.message && fetchError.message.includes('Load failed')) {
              throw new Error(t.errors.connectionLost);
            }
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
        console.log('Vercel API Response:', result);
        if (result.data?.waveform) {
          const waveform = result.data.waveform;
          const waveformArray = isWaveformObject(waveform) ? waveform.waveform : (Array.isArray(waveform) ? waveform : []);
          console.log('Vercel waveform structure:', {
            hasWaveform: waveformArray.length > 0,
            isArray: Array.isArray(waveform),
            length: waveformArray.length,
            keys: isWaveformObject(waveform) ? Object.keys(waveform) : []
          });
        }
      }
      
      console.log('API Response:', result);
      if (result.success && result.data) {
        console.log('Analysis Data:', result.data);
        console.log('Waveform data:', result.data.waveform ? 'Present' : 'Missing');
        if (result.data.waveform) {
          const waveform = result.data.waveform;
          const waveformArray = isWaveformObject(waveform) ? waveform.waveform : (Array.isArray(waveform) ? waveform : []);
          console.log('Waveform structure:', {
            hasWaveform: waveformArray.length > 0,
            isArray: Array.isArray(waveform),
            length: waveformArray.length,
            keys: isWaveformObject(waveform) ? Object.keys(waveform) : []
          });
        }
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

  const handleBatchAnalyze = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setElapsedTime(0);
    setBatchResults([]);
    setBatchFiles(files); // Sla alle bestanden op voor progress display
    setBatchProgress({ current: 0, total: files.length });

    try {
      // Stuur start event
      console.log('🚀 Batch analyse gestart:', files.length, 'bestanden');
      
      let successful = 0;
      let failed = 0;

      // Verwerk elk bestand individueel om Vercel payload limiet te voorkomen
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n🔄 Analyseren bestand ${i + 1}/${files.length}: ${file.name}`);
        
        // Update progress
        setBatchProgress({ current: i + 1, total: files.length });

        try {
          // Check file size - gebruik grote file route als nodig
          const fileSizeMB = file.size / (1024 * 1024);
          const isLargeFile = fileSizeMB > 4; // Vercel limit is ~4.5MB
          
          let result: AnalysisApiResponse;
          
          if (isLargeFile) {
            // Voor grote bestanden: stuur direct naar Railway
            console.log(`Large file detected (${fileSizeMB.toFixed(2)}MB), sending directly to Railway...`);
            
            const configResponse = await fetch('/api/analyze/config');
            if (!configResponse.ok) {
              throw new Error(t.errors.couldNotFetchRailwayUrl);
            }
            const config = await configResponse.json();
            const railwayUrl = config.apiUrl;
            
            if (!railwayUrl) {
              throw new Error(t.errors.railwayUrlNotConfigured);
            }
            
            const formData = new FormData();
            formData.append('file', file);
            // Altijd waveform ophalen voor visualisatie
            formData.append('include_waveform', 'true');
            
            const timeoutMs = 300000; // 5 minuten
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            try {
              const railwayResponse = await fetch(railwayUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                keepalive: false,
              });
              
              clearTimeout(timeoutId);
              
              if (!railwayResponse.ok) {
                const errorText = await railwayResponse.text();
                throw new Error(`Railway API error: ${railwayResponse.status} - ${errorText}`);
              }
              
              const railwayResult = await railwayResponse.json();
              
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
                  const saveFormData = new FormData();
                  saveFormData.append('file', file);
                  saveFormData.append('analysisData', JSON.stringify(result.data));

                  const saveResponse = await fetch('/api/analyze/save', {
                    method: 'POST',
                    body: saveFormData,
                  });

                  if (saveResponse.ok) {
                    const saveResult = await saveResponse.json();
                    result.saved = true;
                    result.analysisId = saveResult.analysisId;
                    if (result.data) {
                      result.data.id = saveResult.analysisId;
                      // Voeg artwork URL toe als beschikbaar
                      if (saveResult.artworkUrl) {
                        result.data.artworkUrl = saveResult.artworkUrl;
                      }
                    }
                  } else {
                    const saveError = await saveResponse.json();
                    result.saveWarning = saveError.error || 'Kon niet opslaan in database';
                  }
                } catch (saveError: unknown) {
                  const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
                  result.saveWarning = 'Kon niet opslaan in database: ' + errorMessage;
                }
              }
            } catch (fetchError: unknown) {
              clearTimeout(timeoutId);
              if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error(t.errors.analysisTimeout);
              }
              throw fetchError;
            }
          } else {
            // Voor kleine bestanden: gebruik Vercel API route
            console.log(`Small file (${fileSizeMB.toFixed(2)}MB), using Vercel API route...`);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('save', saveToDatabase ? 'true' : 'false');

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
          
          // Succesvol resultaat
          if (result.success && result.data) {
            successful++;
            
            const newResult: BatchResult = {
              filename: file.name,
              success: true,
              data: result.data,
              analysisId: result.analysisId || null,
            };
            
            setBatchResults((prev) => {
              // Update localStorage voor eerste succesvolle analyse
              if (prev.length === 0) {
                try {
                  localStorage.setItem('lastAnalysis', JSON.stringify(result.data));
                } catch (e) {
                  console.warn('Kon analyse niet opslaan in localStorage:', e);
                }
              }
              
              return [...prev, newResult];
            });
            
            // Update localStorage voor succesvolle analyse
            try {
              const currentCount = localStorage.getItem('analysisCount');
              const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
              localStorage.setItem('analysisCount', newCount.toString());
            } catch (e) {
              console.warn('Kon analyse niet opslaan in localStorage:', e);
            }
            
            console.log(`✅ Bestand ${i + 1} succesvol geanalyseerd: ${file.name}`);
          } else {
            throw new Error('Onbekende fout');
          }
        } catch (error: unknown) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
          console.error(`❌ Fout bij analyseren ${file.name}:`, error);
          
          const errorResult: BatchResult = {
            filename: file.name,
            success: false,
            error: errorMessage,
          };
          
          setBatchResults((prev) => [...prev, errorResult]);
        }
      }

      // Batch voltooid
      console.log(`\n📊 Batch analyse voltooid:`);
      console.log(`   - Succesvol: ${successful}`);
      console.log(`   - Gefaald: ${failed}`);
      
      setIsUploading(false);
      setBatchProgress({ current: files.length, total: files.length });
      
      // Dispatch event voor alle succesvolle analyses
      window.dispatchEvent(new Event('analysisUpdated'));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      setIsUploading(false);
      setBatchProgress({ current: 0, total: 0 });
      setBatchFiles([]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Valideer bestandstypen
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/x-m4a'];
    const validatedFiles = files.filter((file) => {
      const fileType = file.type || '';
      const fileName = file.name.toLowerCase();
      return validTypes.includes(fileType) || 
        fileName.endsWith('.mp3') || 
        fileName.endsWith('.wav') || 
        fileName.endsWith('.flac') || 
        fileName.endsWith('.m4a');
    });

    if (validatedFiles.length === 0) {
      setError(t.errors.invalidFileType);
      return;
    }

    if (validatedFiles.length === 1) {
      // Enkel bestand: gebruik normale analyse
      handleFileSelect(validatedFiles[0]);
    } else {
      // Meerdere bestanden: batch analyse
      handleBatchAnalyze(validatedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;

    // Valideer bestandstypen
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/x-m4a'];
    const validatedFiles = files.filter((file) => {
      const fileType = file.type || '';
      const fileName = file.name.toLowerCase();
      return validTypes.includes(fileType) || 
        fileName.endsWith('.mp3') || 
        fileName.endsWith('.wav') || 
        fileName.endsWith('.flac') || 
        fileName.endsWith('.m4a');
    });

    if (validatedFiles.length === 0) {
      setError(t.errors.invalidFileType);
      return;
    }

    if (validatedFiles.length === 1) {
      handleFileSelect(validatedFiles[0]);
    } else {
      handleBatchAnalyze(validatedFiles);
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
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <h1 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight text-[var(--text-primary)]">{t.analyze.title}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{t.analyze.subtitle}</p>
          </div>

          {/* Upload Section */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 lg:p-8 border border-[var(--border)] mb-4 sm:mb-6 transition-all duration-200 hover:border-[var(--border-hover)] animate-fade-in-up stagger-1">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16 border-2 border-dashed rounded-[4px] transition-all duration-200 ${
                isDragging
                  ? 'border-[var(--primary)] bg-[var(--surface-hover)] scale-[1.02]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--background)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.m4a"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--primary)] mb-4 animate-spin" />
                  <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)] mb-2 text-center px-4">
                    {batchProgress.total > 1 ? t.analyze.analyzingBatch : t.analyze.analyzing}
                  </h3>
                  {batchProgress.total > 1 && (
                    <>
                      <div className="w-full max-w-md px-4 mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                            {t.analyze.analyzingProgress.replace('{current}', batchProgress.current.toString()).replace('{total}', batchProgress.total.toString())}
                          </p>
                          <span className="text-[var(--text-primary)] text-xs font-medium mono">
                            {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--background)] rounded-full h-2 border border-[var(--border)] overflow-hidden">
                          <div 
                            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      {batchResults.length > 0 && (
                        <p className="text-[var(--text-muted)] text-xs text-center px-4 mb-2">
                          {batchResults.filter(r => r.success).length} {t.analyze.completed}
                          {batchResults.filter(r => !r.success).length > 0 && (
                            <span className="ml-2 text-[var(--error)]">
                              • {batchResults.filter(r => !r.success).length} {t.analyze.failed}
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-3 text-center px-4">{t.analyze.analyzingDescription}</p>
                  {elapsedTime > 25 && (
                    <div className="mt-2 px-4 py-2 bg-[var(--surface)] border border-[var(--warning)] rounded-[4px]">
                      <p className="text-[var(--warning)] text-xs font-medium">
                        {t.analyze.analysisTimeout}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <p className="text-[var(--primary)] text-sm font-medium mono">
                      {t.analyze.elapsedTime}: <span className="text-[var(--text-primary)]">{formatTime(elapsedTime)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--text-muted)] mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)] mb-2 text-center px-4">{t.analyze.uploadMusicFile}</h3>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-2 text-center px-4">{t.analyze.dragDropOrClick}</p>
                  <p className="text-[var(--text-muted)] text-xs mb-6 text-center px-4">{t.analyze.batchModeDescription}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-[4px] transition-all duration-200 text-sm sm:text-base button-press hover-scale"
                  >
                    {t.analyze.selectFiles}
                  </button>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveToDatabase"
                      checked={saveToDatabase}
                      onChange={(e) => setSaveToDatabase(e.target.checked)}
                      className="w-4 h-4 text-[var(--primary)] bg-surface-elevated border-[var(--primary)]/30 rounded focus:ring-[var(--primary)] focus:ring-2"
                    />
                    <label htmlFor="saveToDatabase" className="text-[var(--text-secondary)] text-sm cursor-pointer">
                      {t.analyze.saveToDatabase}
                    </label>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs mt-4">{t.analyze.supportedFormats}</p>
                </>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px]">
                <p className="text-[var(--error)] text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Batch Results - Toon alleen na voltooiing */}
          {!isUploading && batchResults.length > 0 && (
            <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] mb-4 sm:mb-6 transition-all duration-200 hover:border-[var(--border-hover)] animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                  <Music className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[var(--text-primary)] font-medium">{t.analyze.batchMode}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {batchResults.filter(r => r.success).length} {t.analyze.completed}
                    {batchResults.filter(r => !r.success).length > 0 && (
                      <span className="ml-2 text-[var(--error)]">
                        • {batchResults.filter(r => !r.success).length} {t.analyze.failed}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {batchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-[4px] border transition-all duration-200 hover-scale animate-fade-in-up ${
                      result.success
                        ? 'bg-[var(--surface)] border-[var(--success)]/30'
                        : 'bg-[var(--surface)] border-[var(--error)]/30'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {result.success ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[var(--error)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)] font-medium text-sm truncate mb-1">
                          {result.filename}
                        </p>
                        {result.success && result.data && (
                          <div className="text-xs text-[var(--text-secondary)] space-y-1">
                            <div className="flex gap-4">
                              {result.data.bpm && (
                                <span>BPM: <span className="font-medium">{result.data.bpm}</span></span>
                              )}
                              {result.data.key && (
                                <span>Key: <span className="font-medium">{result.data.key}</span></span>
                              )}
                              <span>Duur: <span className="font-medium">{result.data.duration}</span></span>
                            </div>
                          </div>
                        )}
                        {!result.success && result.error && (
                          <p className="text-xs text-[var(--error)]">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results Grid - Toon alleen wanneer er data is of tijdens batch analyse */}
          {(analysisData || (isUploading && batchFiles.length > 1)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Audio Waveform */}
            {analysisData && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up stagger-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <Waves className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-medium">{t.analyze.audioWaveform}</h3>
                </div>
                <WaveformVisualization waveform={analysisData?.waveform || null} />
              </div>
            )}

            {/* Track Information */}
            {analysisData && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up stagger-3">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <FileAudio className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-medium">{t.analyze.trackInfo}</h3>
                </div>
                
                {/* Artwork en Basis Info */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Album Artwork */}
                  <div className="flex-shrink-0">
                    {analysisData.artworkUrl ? (
                      <img 
                        src={analysisData.artworkUrl} 
                        alt={analysisData.metadata.album || analysisData.title || 'Album artwork'}
                        className="w-full sm:w-32 h-32 object-cover rounded-[4px] border border-[var(--border)] shadow-sm"
                        onError={(e) => {
                          // Fallback naar placeholder als image niet laadt
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full sm:w-32 h-32 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-[4px] border border-[var(--border)] flex items-center justify-center ${analysisData.artworkUrl ? 'hidden' : ''}`}
                    >
                      <Music className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                  </div>
                  
                  {/* Track Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1 truncate">
                      {analysisData.title || '-'}
                    </h4>
                    {analysisData.metadata.artist && (
                      <p className="text-sm text-[var(--text-secondary)] mb-1 truncate">
                        {analysisData.metadata.artist}
                      </p>
                    )}
                    {analysisData.metadata.album && (
                      <p className="text-xs text-[var(--text-muted)] mb-3 truncate">
                        {analysisData.metadata.album}
                      </p>
                    )}
                    
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[var(--background)] rounded-[4px] p-2 border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">{t.analyze.duration}</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{analysisData.duration || '-'}</p>
                      </div>
                      <div className="bg-[var(--background)] rounded-[4px] p-2 border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">{t.analyze.genre}</p>
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {analysisData.metadata.genre || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Track Information Details */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Track Informatie</h5>
                  <div className="space-y-2">
                    <InfoRow label={t.analyze.titleLabel} value={analysisData?.title || '-'} />
                    {analysisData?.metadata.artist && (
                      <InfoRow label={t.analyze.artist} value={analysisData.metadata.artist} />
                    )}
                    {analysisData?.metadata.album && (
                      <InfoRow label={t.analyze.album} value={analysisData.metadata.album} />
                    )}
                    {analysisData?.metadata.genre && (
                      <InfoRow label={t.analyze.genre} value={analysisData.metadata.genre} />
                    )}
                    <InfoRow label={t.analyze.duration} value={analysisData?.duration || '-'} />
                  </div>
                </div>
                
                {/* Technical Details */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Technische Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow label={t.analyze.bitrate} 
                      value={analysisData?.metadata.bitrate ? `${Math.round(analysisData.metadata.bitrate / 1000)} kbps` : '-'} 
                    />
                    <InfoRow 
                      label={t.analyze.sampleRate} 
                      value={analysisData?.metadata.sampleRate ? `${Math.round(analysisData.metadata.sampleRate / 1000)} kHz` : '-'} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Audio Analysis */}
            {analysisData && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up stagger-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-medium">{t.analyze.audioAnalysis}</h3>
                </div>
                
                {/* Primary Metrics - BPM & Key */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--background)] rounded-[4px] p-4 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">BPM</span>
                      {analysisData?.confidence?.bpm && (
                        <span className={`text-xs px-2 py-0.5 rounded-[4px] font-medium ${
                          analysisData.confidence.bpm >= 0.8 
                            ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30' 
                            : analysisData.confidence.bpm >= 0.6 
                            ? 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30' 
                            : 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30'
                        }`}>
                          {Math.round(analysisData.confidence.bpm * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mono">
                      {analysisData?.bpm ? analysisData.bpm.toString() : '-'}
                    </p>
                  </div>
                  
                  <div className="bg-[var(--background)] rounded-[4px] p-4 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Key</span>
                      {analysisData?.confidence?.key && (
                        <span className={`text-xs px-2 py-0.5 rounded-[4px] font-medium ${
                          analysisData.confidence.key >= 0.8 
                            ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30' 
                            : analysisData.confidence.key >= 0.6 
                            ? 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30' 
                            : 'bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30'
                        }`}>
                          {Math.round(analysisData.confidence.key * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {analysisData?.key || '-'}
                    </p>
                  </div>
                </div>
                
                {/* Secondary Metrics */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Audio Eigenschappen</h5>
                  <div className="space-y-3">
                    <AnalysisMetric label={t.analyze.energy} value="-" />
                    <AnalysisMetric label={t.analyze.danceability} value="-" />
                    <AnalysisMetric label={t.analyze.valence} value="-" />
                    <AnalysisMetric label={t.analyze.acousticness} value="-" />
                  </div>
                </div>
              </div>
            )}

            {/* Batch Progress - Toon alleen tijdens batch analyse */}
            {isUploading && batchFiles.length > 1 && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up stagger-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <Music className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[var(--text-primary)] font-medium">Analyse Voortgang</h3>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                      {batchProgress.current} van {batchProgress.total} voltooid
                    </p>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {batchFiles.map((file, index) => {
                    const result = batchResults.find(r => r.filename === file.name);
                    const isCurrent = index + 1 === batchProgress.current && !result;
                    const isCompleted = result?.success;
                    const isFailed = result && !result.success;
                    const isPending = index + 1 > batchProgress.current;
                    const hasWaveform = isCompleted && result?.data?.waveform;
                    const isExpanded = expandedWaveforms.has(index);

                    return (
                      <div
                        key={index}
                        className={`rounded-[4px] border transition-all duration-200 ${
                          isCompleted
                            ? 'bg-[var(--surface)] border-[var(--success)]/30'
                            : isFailed
                            ? 'bg-[var(--surface)] border-[var(--error)]/30'
                            : isCurrent
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)] shadow-sm'
                            : isPending
                            ? 'bg-[var(--background)] border-[var(--border)] opacity-60'
                            : 'bg-[var(--surface)] border-[var(--border)]'
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                              ) : isFailed ? (
                                <XCircle className="w-5 h-5 text-[var(--error)]" />
                              ) : isCurrent ? (
                                <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                                  <span className="text-[var(--text-muted)] text-xs font-medium">{index + 1}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm font-medium truncate ${
                                  isCurrent ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                                }`}>
                                  {file.name}
                                </p>
                                {hasWaveform && (
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedWaveforms);
                                      if (isExpanded) {
                                        newExpanded.delete(index);
                                      } else {
                                        newExpanded.add(index);
                                      }
                                      setExpandedWaveforms(newExpanded);
                                    }}
                                    className="flex-shrink-0 p-1 hover:bg-[var(--background)] rounded-[4px] transition-colors"
                                    aria-label={isExpanded ? 'Waveform verbergen' : 'Waveform tonen'}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {isCompleted && result?.data && (
                                <div className="text-xs text-[var(--text-secondary)] space-y-1 mt-1">
                                  <div className="flex gap-4 flex-wrap">
                                    {result.data.bpm && (
                                      <span className="flex items-center gap-1">
                                        <span className="text-[var(--text-muted)]">BPM:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{result.data.bpm}</span>
                                      </span>
                                    )}
                                    {result.data.key && (
                                      <span className="flex items-center gap-1">
                                        <span className="text-[var(--text-muted)]">Key:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{result.data.key}</span>
                                      </span>
                                    )}
                                    {result.data.duration && (
                                      <span className="flex items-center gap-1">
                                        <span className="text-[var(--text-muted)]">Duur:</span>
                                        <span className="font-medium text-[var(--text-primary)]">{result.data.duration}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {isFailed && result?.error && (
                                <p className="text-xs text-[var(--error)] mt-1">{result.error}</p>
                              )}
                              {isCurrent && (
                                <p className="text-xs text-[var(--primary)] font-medium mt-1 flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Wordt geanalyseerd...
                                </p>
                              )}
                              {isPending && (
                                <p className="text-xs text-[var(--text-muted)] mt-1">In wachtrij</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Waveform expandable sectie */}
                        {hasWaveform && isExpanded && result && result.data && (
                          <div className="px-3 pb-3 pt-0 border-t border-[var(--border)] mt-3">
                            <div className="mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Waves className="w-4 h-4 text-[var(--primary)]" />
                                <span className="text-xs font-medium text-[var(--text-secondary)]">Audio Waveform</span>
                              </div>
                              <WaveformVisualization waveform={result.data.waveform || null} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Waveform visualization component
function WaveformVisualization({ waveform }: { waveform: WaveformData | null }) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('WaveformVisualization - waveform prop:', waveform);
    if (!waveform || !canvasRef.current) {
      console.log('WaveformVisualization - No waveform or canvas, returning');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('WaveformVisualization - Could not get canvas context');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    
    // Handle different waveform formats
    let waveformData: number[] = [];
    if (isWaveformObject(waveform)) {
      waveformData = waveform.waveform;
      console.log('WaveformVisualization - Using waveform.waveform array, length:', waveformData.length);
    } else if (Array.isArray(waveform)) {
      waveformData = waveform;
      console.log('WaveformVisualization - Using waveform as array, length:', waveformData.length);
    } else {
      console.log('WaveformVisualization - Waveform format not recognized:', waveform);
      return;
    }

    if (waveformData.length === 0) {
      console.log('WaveformVisualization - Waveform data is empty');
      return;
    }
    
    console.log('WaveformVisualization - Drawing waveform with', waveformData.length, 'samples');

    ctx.clearRect(0, 0, width, height);
    
    // Background - use CSS variable for background color
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#1a1a1a';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Waveform color - use primary color from CSS variables
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#3b82f6';
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1;

    const centerY = height / 2;
    const step = width / waveformData.length;
    const maxValue = Math.max(...waveformData.map(Math.abs));
    const minBarHeight = 1; // Minimum bar height in pixels

    console.log('WaveformVisualization - Drawing params:', {
      width,
      height,
      dataLength: waveformData.length,
      step,
      maxValue,
      centerY
    });

    // Draw waveform bars
    for (let i = 0; i < waveformData.length; i++) {
      const value = Math.abs(waveformData[i]);
      const normalizedValue = maxValue > 0 ? value / maxValue : 0;
      const barHeight = Math.max(minBarHeight, (normalizedValue * height) / 2);
      const x = i * step;
      
      // Always draw bars, even if small
      ctx.fillRect(x, centerY - barHeight, Math.max(1, step - 0.5), barHeight * 2);
    }
    
    console.log('WaveformVisualization - Drawing complete');
  }, [waveform]);

  // Check if waveform data exists and is valid
  const hasValidWaveform = waveform && (
    (isWaveformObject(waveform) && waveform.waveform.length > 0) ||
    (Array.isArray(waveform) && waveform.length > 0)
  );

  if (!hasValidWaveform) {
    return (
      <div className="h-48 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">{t.analyze.waveformPlaceholder}</p>
      </div>
    );
  }

  return (
    <div className="h-48 bg-[var(--background)] rounded-[4px] border border-[var(--border)] p-2">
      <canvas
        ref={canvasRef}
        width={800}
        height={180}
        className="w-full h-full"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-[var(--text-secondary)] text-xs font-medium">{label}</span>
      <span className="text-[var(--text-primary)] font-medium text-xs">{value}</span>
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
        <span className="text-[var(--text-primary)] text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-primary)] font-medium mono">{value}</span>
          {confidence != null && (
            <span className={`text-xs px-2 py-0.5 rounded-[4px] font-medium border ${
              confidence >= 0.8 ? 'bg-[var(--surface)] text-[var(--success)] border-[var(--success)]' 
              : confidence >= 0.6 ? 'bg-[var(--surface)] text-[var(--warning)] border-[var(--warning)]' 
              : 'bg-[var(--surface)] text-[var(--error)] border-[var(--error)]'
            }`}>
              {confidencePercent}%
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-[var(--background)] rounded-[4px] h-1.5 border border-[var(--border)]">
      <div 
        className={`${confidenceColor} h-1.5 rounded-[4px] transition-all duration-500 ease-out`} 
        style={{ width: confidencePercent ? `${confidencePercent}%` : '0%' }}
      ></div>
      </div>
      {confidence != null && (
        <div className="mt-1.5 text-xs text-[var(--text-tertiary)] font-medium">
          {confidence >= 0.8 ? t.analyze.veryAccurate
           : confidence >= 0.6 ? t.analyze.accurate
           : t.analyze.moderatelyAccurate}
        </div>
      )}
    </div>
  );
}

