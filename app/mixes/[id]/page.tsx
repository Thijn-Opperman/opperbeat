'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { 
  ArrowLeft, 
  Music, 
  Clock, 
  Play, 
  Loader2, 
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface MixTrack {
  id: string;
  position: number;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: string;
  durationSeconds?: number;
  bpm?: number;
  key?: string;
  artwork?: string;
  transition_type?: string;
  transition_start_time?: number;
  notes?: string;
}

interface Mix {
  id: string;
  name: string;
  description?: string;
  venue?: string;
  event_date?: string;
  date: string;
  tracks: number;
  duration: string;
  durationSeconds: number;
  created_at: string;
  updated_at: string;
  _tracks?: MixTrack[];
}

const STORAGE_KEY = 'opperbeat_mixes';
const SETS_STORAGE_KEY = 'opperbeat_sets';

const getMixesFromStorage = (): Mix[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

interface SetData {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  tracks: Array<{
    trackId: string;
    track?: {
      title: string;
      artist?: string | null;
      genre?: string | null;
      duration_formatted: string;
      duration_seconds: number;
      bpm?: number | null;
      artwork_public_url?: string | null;
    };
    startTime: number;
    bpm: number;
  }>;
}

const getSetsFromStorage = (): SetData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export default function MixViewPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const mixId = params.id as string;

  const [mix, setMix] = useState<Mix | null>(null);
  const [tracks, setTracks] = useState<MixTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSet, setIsSet] = useState(false);
  const [setData, setSetData] = useState<any>(null);

  useEffect(() => {
    fetchMix();
  }, [mixId]);

  const fetchMix = () => {
    try {
      setLoading(true);
      setError(null);

      // Check eerst in mixes
      const mixes = getMixesFromStorage();
      const foundMix = mixes.find(m => m.id === mixId);

      if (foundMix) {
        setMix(foundMix);
        // Sorteer tracks op position
        const sortedTracks = (foundMix._tracks || []).sort((a, b) => a.position - b.position);
        setTracks(sortedTracks);
        setIsSet(false);
      } else {
        // Check in sets
        const sets = getSetsFromStorage();
        const foundSet = sets.find((s: SetData) => s.id === mixId);
        
        if (foundSet) {
          setIsSet(true);
          setSetData(foundSet);
          
          // Converteer set naar mix format voor weergave
          const convertedMix: Mix = {
            id: foundSet.id,
            name: foundSet.name,
            description: 'Set gegenereerd op basis van BPM curve',
            date: new Date(foundSet.created_at).toLocaleDateString('nl-NL'),
            tracks: foundSet.tracks.length,
            duration: '0:00', // Wordt berekend
            durationSeconds: 0,
            created_at: foundSet.created_at,
            updated_at: foundSet.updated_at || foundSet.created_at,
            _tracks: foundSet.tracks.map((item, index: number) => ({
              id: item.trackId,
              position: index,
              title: item.track?.title,
              artist: item.track?.artist || undefined,
              genre: item.track?.genre || undefined,
              duration: item.track?.duration_formatted,
              durationSeconds: item.track?.duration_seconds,
              bpm: item.track?.bpm || item.bpm,
              artwork: item.track?.artwork_public_url || undefined,
              transition_start_time: item.startTime,
              notes: item.bpm ? `BPM: ${Math.round(item.bpm)}` : undefined,
            })),
          };
          
          // Bereken duur
          const totalDuration = convertedMix._tracks?.reduce((sum, t) => sum + (t.durationSeconds || 0), 0) || 0;
          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          const seconds = totalDuration % 60;
          const finalMix: Mix = {
            ...convertedMix,
            duration: hours > 0 
              ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
              : `${minutes}:${seconds.toString().padStart(2, '0')}`,
            durationSeconds: totalDuration,
          };
          setMix(finalMix);
          // Sorteer tracks op position
          const sortedTracks = (finalMix._tracks || []).sort((a, b) => a.position - b.position);
          setTracks(sortedTracks);
        } else {
          setError('Mix of set niet gevonden');
        }
      }
    } catch (err) {
      console.error('Error fetching mix:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between animate-fade-in-down">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/mixes')}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200 button-press hover-scale"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {mix?.name || 'Mix'}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  {tracks.length} tracks • {mix?.duration || '0:00'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px] animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                <p className="text-[var(--error)] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <span className="ml-3 text-[var(--text-secondary)]">Laden...</span>
            </div>
          ) : mix ? (
            <>
              {/* Mix Info */}
              <div className="mb-6 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Informatie</h3>
                    <div className="space-y-2 text-sm">
                      {mix.description && (
                        <div>
                          <span className="text-[var(--text-muted)]">Beschrijving: </span>
                          <span className="text-[var(--text-secondary)]">{mix.description}</span>
                        </div>
                      )}
                      {mix.venue && (
                        <div>
                          <span className="text-[var(--text-muted)]">Locatie: </span>
                          <span className="text-[var(--text-secondary)]">{mix.venue}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[var(--text-muted)]">Datum: </span>
                        <span className="text-[var(--text-secondary)]">{mix.date}</span>
                      </div>
                      {isSet && setData && (
                        <div>
                          <span className="text-[var(--text-muted)]">Type: </span>
                          <span className="text-[var(--text-secondary)]">Set (BPM curve)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Statistieken</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Totaal tracks: </span>
                        <span className="text-[var(--text-secondary)] font-medium">{tracks.length}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Totale duur: </span>
                        <span className="text-[var(--text-secondary)] font-medium">{mix.duration}</span>
                      </div>
                      {tracks.length > 0 && (
                        <>
                          <div>
                            <span className="text-[var(--text-muted)]">Gemiddelde BPM: </span>
                            <span className="text-[var(--text-secondary)] font-medium">
                              {Math.round(
                                tracks.reduce((sum, t) => sum + (t.bpm || 0), 0) / tracks.filter(t => t.bpm).length
                              ) || 0}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracks List */}
              {tracks.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
                    <Music className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-medium mb-2">Geen tracks in deze {isSet ? 'set' : 'mix'}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Voeg tracks toe om te beginnen</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      Tracks ({tracks.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {tracks.map((track, index) => {
                      const position = track.position !== undefined ? track.position : index;
                      return (
                        <div
                          key={track.id || index}
                          className="bg-[var(--surface)] rounded-[4px] p-3 sm:p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 group animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            {/* Position Number - Prominent */}
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary)]/10 border-2 border-[var(--primary)] rounded-[4px] flex items-center justify-center">
                              <span className="text-[var(--primary)] font-bold text-base sm:text-lg font-mono">
                                {position + 1}
                              </span>
                            </div>
                            
                            {/* Artwork */}
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {track.artwork ? (
                                <img
                                  src={track.artwork}
                                  alt={track.title || 'Track'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-muted)]" />
                              )}
                            </div>
                            
                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[var(--text-primary)] font-medium text-sm sm:text-base mb-1 truncate">
                                {track.title || 'Onbekende track'}
                              </h3>
                              <div className="flex items-center gap-4 text-xs sm:text-sm text-[var(--text-secondary)] flex-wrap">
                                {track.artist && (
                                  <span className="truncate">{track.artist}</span>
                                )}
                                {track.genre && (
                                  <span className="text-[var(--text-muted)]">• {track.genre}</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Track Metadata */}
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--text-secondary)] flex-shrink-0">
                              {track.bpm && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-[4px]">
                                  <Play className="w-3.5 h-3.5 text-[var(--primary)]" />
                                  <span className="font-mono font-medium text-[var(--primary)]">{Math.round(track.bpm)}</span>
                                </div>
                              )}
                              {track.key && (
                                <div className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                                  <span>{track.key}</span>
                                </div>
                              )}
                              {track.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="font-mono">{track.duration}</span>
                                </div>
                              )}
                              {track.transition_start_time !== undefined && (
                                <div className="text-[var(--text-muted)] text-xs">
                                  {formatTime(track.transition_start_time)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Additional Info */}
                          {track.notes && (
                            <div className="mt-2 pt-2 border-t border-[var(--border)]">
                              <p className="text-xs text-[var(--text-muted)] italic">
                                {track.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <AlertCircle className="w-16 h-16 text-[var(--error)] mx-auto mb-4" />
              <h3 className="text-[var(--text-primary)] font-medium mb-2">Mix niet gevonden</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">De mix die je zoekt bestaat niet of is verwijderd.</p>
              <button
                onClick={() => router.push('/mixes')}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 button-press hover-scale"
              >
                Terug naar Mixes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
