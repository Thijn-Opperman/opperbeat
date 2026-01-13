'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles,
  Music,
  Loader2,
  AlertCircle,
  Save,
  Play,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface Peak {
  id: string;
  time: number; // Tijd in minuten (0-120)
  bpm: number; // BPM waarde (60-180)
}

interface Track {
  id: string;
  title: string;
  artist: string | null;
  bpm: number | null;
  genre: string | null;
  duration_seconds: number;
  duration_formatted: string;
  artwork_public_url: string | null;
}

interface GeneratedSet {
  time: number;
  track: Track;
  bpm: number;
}

const STORAGE_KEY = 'opperbeat_mixes';
const SETS_STORAGE_KEY = 'opperbeat_sets';

// Helper functies
const getMixesFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveSetToStorage = (setData: any) => {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(SETS_STORAGE_KEY);
    const sets = stored ? JSON.parse(stored) : [];
    sets.push(setData);
    localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify(sets));
  } catch (e) {
    console.error('Error saving set:', e);
  }
};

// BPM ranges voor snelle selectie
const BPM_RANGES = [
  { label: 'Chill (60-80)', min: 60, max: 80, color: '#8B5CF6' },
  { label: 'Slow (80-100)', min: 80, max: 100, color: '#3B82F6' },
  { label: 'Medium (100-120)', min: 100, max: 120, color: '#22C55E' },
  { label: 'Upbeat (120-140)', min: 120, max: 140, color: '#F59E0B' },
  { label: 'High (140-160)', min: 140, max: 160, color: '#EF4444' },
  { label: 'Extreme (160+)', min: 160, max: 180, color: '#EC4899' },
];

export default function SetBuilderPage() {
  const router = useRouter();
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<Peak[]>([]);
  const [setDuration, setSetDuration] = useState(60); // Minuten
  const [generatedSet, setGeneratedSet] = useState<GeneratedSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setNameValue, setSetNameValue] = useState('');
  const [selectedBpmRange, setSelectedBpmRange] = useState<number | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    drawGraph();
  }, [peaks, setDuration]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyses?limit=200');
      const data = await response.json();
      
      if (response.ok && data.data) {
        setAvailableTracks(data.data.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          bpm: track.bpm,
          genre: track.genre,
          duration_seconds: track.duration_seconds,
          duration_formatted: track.duration_formatted,
          artwork_public_url: track.artwork_public_url,
        })));
      }
    } catch (err) {
      console.error('Error fetching tracks:', err);
      setError('Fout bij ophalen van tracks');
    } finally {
      setLoading(false);
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get CSS variable values
    const getCSSVar = (varName: string): string => {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#0F1115';
    };

    const bgColor = getCSSVar('--background');
    const borderColor = getCSSVar('--border');
    const primaryColor = getCSSVar('--primary');
    const textMutedColor = getCSSVar('--text-muted');
    const textPrimaryColor = getCSSVar('--text-primary');
    const surfaceColor = getCSSVar('--surface');

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = surfaceColor;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (BPM levels: 60-180)
    const bpmRange = 180 - 60; // 120 BPM range
    for (let i = 0; i <= 12; i++) {
      const y = padding + (graphHeight / 12) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // BPM Labels
      const bpm = 180 - (i * 10);
      ctx.fillStyle = textMutedColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${bpm}`, padding - 8, y + 4);
    }

    // Vertical grid lines (time)
    for (let i = 0; i <= 12; i++) {
      const x = padding + (graphWidth / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      
      // Time Labels
      ctx.fillStyle = textMutedColor;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const minutes = Math.floor((setDuration / 12) * i);
      ctx.fillText(`${minutes}m`, x, height - padding + 18);
    }

    // Draw BPM curve
    if (peaks.length > 0) {
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();

      // Sort peaks by time
      const sortedPeaks = [...peaks].sort((a, b) => a.time - b.time);

      // Start from first peak
      const firstPeak = sortedPeaks[0];
      const startX = padding + (firstPeak.time / setDuration) * graphWidth;
      const startY = padding + graphHeight - ((firstPeak.bpm - 60) / bpmRange) * graphHeight;
      ctx.moveTo(startX, startY);

      // Draw line to each peak
      sortedPeaks.forEach((peak) => {
        const x = padding + (peak.time / setDuration) * graphWidth;
        const y = padding + graphHeight - ((peak.bpm - 60) / bpmRange) * graphHeight;
        ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Fill area under curve
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.15;
      const lastPeak = sortedPeaks[sortedPeaks.length - 1];
      const endX = padding + (lastPeak.time / setDuration) * graphWidth;
      const endY = padding + graphHeight - ((lastPeak.bpm - 60) / bpmRange) * graphHeight;
      ctx.lineTo(endX, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Draw peaks
    peaks.forEach((peak) => {
      const x = padding + (peak.time / setDuration) * graphWidth;
      const y = padding + graphHeight - ((peak.bpm - 60) / bpmRange) * graphHeight;

      // Peak circle
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Peak border
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Peak label
      ctx.fillStyle = textPrimaryColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(peak.bpm)}`, x, y - 18);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 50;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    // Check if click is within graph area
    if (x < padding || x > canvas.width - padding || y < padding || y > canvas.height - padding) {
      return;
    }

    // Calculate time and BPM from click position
    const time = ((x - padding) / graphWidth) * setDuration;
    const bpm = 180 - ((y - padding) / graphHeight) * 120; // 60-180 BPM range

    // Check if click is near existing peak (to delete)
    const clickedPeak = peaks.find((peak) => {
      const peakX = padding + (peak.time / setDuration) * graphWidth;
      const peakY = padding + graphHeight - ((peak.bpm - 60) / 120) * graphHeight;
      const distance = Math.sqrt(Math.pow(x - peakX, 2) + Math.pow(y - peakY, 2));
      return distance < 20;
    });

    if (clickedPeak) {
      // Delete peak
      setPeaks(peaks.filter((p) => p.id !== clickedPeak.id));
    } else {
      // Add new peak
      const newPeak: Peak = {
        id: crypto.randomUUID(),
        time: Math.max(0, Math.min(setDuration, time)),
        bpm: Math.max(60, Math.min(180, Math.round(bpm))),
      };
      setPeaks([...peaks, newPeak].sort((a, b) => a.time - b.time));
    }
  };

  const addPeakFromRange = (rangeIndex: number) => {
    const range = BPM_RANGES[rangeIndex];
    const avgBpm = Math.round((range.min + range.max) / 2);
    
    // Vind de volgende beschikbare tijd positie
    const sortedPeaks = [...peaks].sort((a, b) => a.time - b.time);
    let newTime = 0;
    
    if (sortedPeaks.length > 0) {
      // Voeg toe na de laatste piek
      const lastPeak = sortedPeaks[sortedPeaks.length - 1];
      newTime = Math.min(setDuration, lastPeak.time + (setDuration / 10)); // 10% van duur verder
    } else {
      // Eerste piek op 10% van de duur
      newTime = setDuration * 0.1;
    }

    const newPeak: Peak = {
      id: crypto.randomUUID(),
      time: newTime,
      bpm: avgBpm,
    };
    
    setPeaks([...peaks, newPeak].sort((a, b) => a.time - b.time));
  };

  const generateSet = async () => {
    if (peaks.length < 2) {
      setError('Voeg minimaal 2 pieken toe om een set te genereren');
      return;
    }

    if (availableTracks.length === 0) {
      setError('Geen tracks beschikbaar. Upload eerst wat muziek!');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Sorteer peaks op tijd
      const sortedPeaks = [...peaks].sort((a, b) => a.time - b.time);
      
      // Genereer BPM curve tussen pieken
      const bpmCurve: { time: number; bpm: number }[] = [];
      const timeStep = 0.5; // Elke 30 seconden een punt
      
      for (let t = 0; t <= setDuration; t += timeStep) {
        let bpm = 120; // Default BPM
        
        // Vind de twee dichtstbijzijnde pieken
        for (let i = 0; i < sortedPeaks.length - 1; i++) {
          const peak1 = sortedPeaks[i];
          const peak2 = sortedPeaks[i + 1];
          
          if (t >= peak1.time && t <= peak2.time) {
            // Interpoleer tussen pieken
            const ratio = (t - peak1.time) / (peak2.time - peak1.time);
            bpm = peak1.bpm + (peak2.bpm - peak1.bpm) * ratio;
            break;
          }
        }
        
        // Check eerste en laatste piek
        if (t < sortedPeaks[0].time) {
          bpm = sortedPeaks[0].bpm;
        } else if (t > sortedPeaks[sortedPeaks.length - 1].time) {
          bpm = sortedPeaks[sortedPeaks.length - 1].bpm;
        }
        
        bpmCurve.push({ time: t, bpm });
      }

      // Match tracks op basis van BPM
      const generated: GeneratedSet[] = [];
      let currentTime = 0;
      const usedTrackIds = new Set<string>();

      for (let i = 0; i < bpmCurve.length - 1; i++) {
        const segment = bpmCurve[i];
        const nextSegment = bpmCurve[i + 1];
        const segmentDuration = (nextSegment.time - segment.time) * 60; // In seconden
        const targetBpm = segment.bpm;

        // BPM tolerance: ±5 BPM
        const bpmTolerance = 5;
        const minBpm = targetBpm - bpmTolerance;
        const maxBpm = targetBpm + bpmTolerance;

        // Vind geschikte track
        const suitableTracks = availableTracks.filter(
          (track) =>
            track.bpm &&
            track.bpm >= minBpm &&
            track.bpm <= maxBpm &&
            !usedTrackIds.has(track.id) &&
            track.duration_seconds >= segmentDuration * 0.7 // Track moet lang genoeg zijn
        );

        if (suitableTracks.length > 0) {
          // Kies willekeurige track uit geschikte tracks
          const selectedTrack = suitableTracks[Math.floor(Math.random() * suitableTracks.length)];
          usedTrackIds.add(selectedTrack.id);

          generated.push({
            time: currentTime,
            track: selectedTrack,
            bpm: targetBpm,
          });

          currentTime += segmentDuration;
        } else {
          // Fallback: gebruik willekeurige track met dichtstbijzijnde BPM
          const fallbackTracks = availableTracks
            .filter((t) => !usedTrackIds.has(t.id) && t.bpm)
            .map(t => ({
              track: t,
              diff: Math.abs((t.bpm || 120) - targetBpm)
            }))
            .sort((a, b) => a.diff - b.diff);
            
          if (fallbackTracks.length > 0) {
            const selectedTrack = fallbackTracks[0].track;
            usedTrackIds.add(selectedTrack.id);

            generated.push({
              time: currentTime,
              track: selectedTrack,
              bpm: targetBpm,
            });

            currentTime += selectedTrack.duration_seconds;
          }
        }

        // Stop als we de gewenste duur hebben bereikt
        if (currentTime >= setDuration * 60) break;
      }

      setGeneratedSet(generated);
    } catch (err) {
      console.error('Error generating set:', err);
      setError(err instanceof Error ? err.message : 'Fout bij genereren van set');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSet = () => {
    if (!setNameValue.trim()) {
      setError('Geef de set een naam');
      return;
    }

    if (generatedSet.length === 0) {
      setError('Genereer eerst een set');
      return;
    }

    try {
      const setId = crypto.randomUUID();
      const setData = {
        id: setId,
        name: setNameValue.trim(),
        peaks: peaks,
        setDuration: setDuration,
        tracks: generatedSet.map((item) => ({
          trackId: item.track.id,
          track: item.track, // Sla volledige track info op
          startTime: item.time,
          bpm: item.bpm,
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      saveSetToStorage(setData);
      
      // Maak ook een mix aan
      const mixes = getMixesFromStorage();
      const totalDuration = generatedSet.reduce((sum, item) => sum + item.track.duration_seconds, 0);
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.floor((totalDuration % 3600) / 60);
      const seconds = totalDuration % 60;
      const durationFormatted = hours > 0 
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      const newMix = {
        id: setId, // Gebruik zelfde ID als set
        name: setNameValue.trim(),
        description: `Set gegenereerd op basis van BPM curve`,
        venue: undefined,
        event_date: undefined,
        date: new Date().toLocaleDateString('nl-NL'),
        tracks: generatedSet.length,
        duration: durationFormatted,
        durationSeconds: totalDuration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Sla volledige track data op voor later gebruik
        _tracks: generatedSet.map((item, index) => ({
          id: item.track.id,
          position: index,
          title: item.track.title,
          artist: item.track.artist,
          album: undefined,
          genre: item.track.genre,
          duration: item.track.duration_formatted,
          durationSeconds: item.track.duration_seconds,
          bpm: item.track.bpm || item.bpm,
          key: undefined,
          artwork: item.track.artwork_public_url,
          transition_type: undefined,
          transition_start_time: item.time,
          notes: `BPM: ${Math.round(item.bpm)}`,
        })),
      };
      mixes.push(newMix);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));

      router.push('/mixes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan');
    }
  };

  const totalDuration = generatedSet.reduce((sum, item) => sum + item.track.duration_seconds, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const durationFormatted = hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor((totalDuration % 60)).toString().padStart(2, '0')}`
    : `${minutes}:${Math.floor((totalDuration % 60)).toString().padStart(2, '0')}`;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header met naam invoer */}
          <div className="mb-6 flex items-center justify-between gap-4 animate-fade-in-down">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => router.push('/mixes')}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200 button-press hover-scale flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={setNameValue}
                  onChange={(e) => setSetNameValue(e.target.value)}
                  placeholder="Geef je set een naam..."
                  className="w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200 text-lg font-semibold"
                />
              </div>
            </div>
            <button
              onClick={generateSet}
              disabled={isGenerating || peaks.length < 2}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm button-press hover-scale flex-shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Genereren...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Genereer Set
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px] animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                  <p className="text-[var(--error)] text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-[var(--error)]/20 rounded-[4px] transition-all duration-200"
                >
                  <X className="w-4 h-4 text-[var(--error)]" />
                </button>
              </div>
            </div>
          )}

          {/* BPM Range Filters */}
          <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Voeg snel een piek toe:
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {BPM_RANGES.map((range, index) => (
                <button
                  key={index}
                  onClick={() => addPeakFromRange(index)}
                  className="px-3 py-1.5 bg-[var(--background)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)] text-xs font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
                  style={{
                    borderColor: selectedBpmRange === index ? range.color : undefined,
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: range.color }}
                  />
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm text-[var(--text-primary)] font-medium">
                Set Duur (minuten):
              </label>
              <input
                type="number"
                min="15"
                max="120"
                value={setDuration}
                onChange={(e) => setSetDuration(Math.max(15, Math.min(120, parseInt(e.target.value) || 60)))}
                className="w-20 px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
              />
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span>{peaks.length} pieken</span>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setPeaks([])}
                disabled={peaks.length === 0}
                className="px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Wis Alle Pieken
              </button>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                BPM Curve
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Klik op de grafiek om een piek toe te voegen • Klik op een piek om te verwijderen
              </p>
            </div>
            <div className="relative w-full overflow-x-auto">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                onClick={handleCanvasClick}
                className="cursor-crosshair border border-[var(--border)] rounded-[4px]"
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Y-as: BPM (60-180)</span>
              <span>X-as: Tijd (0-{setDuration} minuten)</span>
            </div>
          </div>

          {/* Generated Set */}
          {generatedSet.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Gegenereerde Set
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {generatedSet.length} tracks • {durationFormatted}
                  </p>
                </div>
                <button
                  onClick={saveSet}
                  disabled={!setNameValue.trim()}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm button-press hover-scale"
                >
                  <Save className="w-4 h-4" />
                  Opslaan
                </button>
              </div>

              <div className="space-y-2">
                {generatedSet.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[var(--surface)] rounded-[4px] p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.track.artwork_public_url ? (
                          <img
                            src={item.track.artwork_public_url}
                            alt={item.track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[var(--text-primary)] font-medium text-sm truncate">
                          {item.track.title}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-xs truncate">
                          {item.track.artist || 'Onbekende artiest'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" />
                          <span className="font-mono">{item.track.bpm || '—'} BPM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.track.duration_formatted}</span>
                        </div>
                        <div className="px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded font-mono text-xs">
                          {Math.round(item.bpm)} BPM
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <span className="ml-3 text-[var(--text-secondary)]">Tracks laden...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
