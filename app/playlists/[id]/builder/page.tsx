'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  X, 
  Music, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Trash2,
  Filter,
  Play,
  Clock
} from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  duration_formatted: string;
  duration_seconds: number;
  artwork_public_url: string | null;
}

interface PlaylistTrack extends Track {
  position: number;
  playlistTrackId?: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
}

export default function PlaylistBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handmatig toevoegen
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  
  // Generatie
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateCriteria, setGenerateCriteria] = useState({
    bpmMin: '',
    bpmMax: '',
    key: '',
    genre: '',
    limit: '20',
  });

  useEffect(() => {
    fetchPlaylist();
    fetchTracks();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van playlist');
      }
      
      setPlaylist({
        id: data.data.id,
        name: data.data.name,
        description: data.data.description,
      });
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    }
  };

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van tracks');
      }
      
      setTracks(data.data.tracks || []);
    } catch (err) {
      console.error('Error fetching tracks:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const params = new URLSearchParams({
        search: searchQuery,
        limit: '50',
      });

      const response = await fetch(`/api/analyses?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij zoeken');
      }

      // Filter tracks die al in playlist zitten
      const existingTrackIds = new Set(tracks.map(t => t.id));
      const filtered = (data.data || []).filter((track: Track) => !existingTrackIds.has(track.id));
      
      setSearchResults(filtered);
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err.message : 'Fout bij zoeken');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const handleAddSelectedTracks = async () => {
    if (selectedTracks.size === 0) return;

    try {
      setSearching(true);
      const trackIds = Array.from(selectedTracks);
      
      // Voeg tracks één voor één toe (of maak bulk endpoint)
      for (const trackId of trackIds) {
        const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: trackId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Fout bij toevoegen van track');
        }
      }

      setSelectedTracks(new Set());
      setSearchQuery('');
      setSearchResults([]);
      setShowAddModal(false);
      await fetchTracks();
    } catch (err) {
      console.error('Error adding tracks:', err);
      setError(err instanceof Error ? err.message : 'Fout bij toevoegen van tracks');
    } finally {
      setSearching(false);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks?trackId=${trackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij verwijderen van track');
      }

      await fetchTracks();
    } catch (err) {
      console.error('Error removing track:', err);
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen van track');
    }
  };

  const handleGeneratePlaylist = async () => {
    try {
      setGenerating(true);
      setError(null);

      const params = new URLSearchParams();
      if (generateCriteria.bpmMin) params.append('bpmMin', generateCriteria.bpmMin);
      if (generateCriteria.bpmMax) params.append('bpmMax', generateCriteria.bpmMax);
      if (generateCriteria.key) params.append('key', generateCriteria.key);
      if (generateCriteria.genre) params.append('genre', generateCriteria.genre);
      params.append('limit', generateCriteria.limit);

      const response = await fetch(`/api/playlists/${playlistId}/generate?${params.toString()}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij genereren van playlist');
      }

      // Check voor warning (geen tracks gevonden)
      if (data.warning) {
        setError(data.error || 'Geen tracks gevonden die voldoen aan de criteria');
      } else {
        setError(null);
      }

      setShowGenerateModal(false);
      setGenerateCriteria({
        bpmMin: '',
        bpmMax: '',
        key: '',
        genre: '',
        limit: '20',
      });
      await fetchTracks();
    } catch (err) {
      console.error('Error generating playlist:', err);
      setError(err instanceof Error ? err.message : 'Fout bij genereren van playlist');
    } finally {
      setGenerating(false);
    }
  };

  const totalDuration = tracks.reduce((sum, track) => sum + (track.duration_seconds || 0), 0);
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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between animate-fade-in-down">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/playlists')}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200 button-press hover-scale"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {playlist?.name || 'Playlist Builder'}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  {tracks.length} tracks • {durationFormatted}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-4 py-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm button-press hover-scale"
              >
                <Sparkles className="w-4 h-4" />
                Genereer
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-4 py-2 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm button-press hover-scale"
              >
                <Plus className="w-4 h-4" />
                Voeg toe
              </button>
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

          {/* Tracks List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <span className="ml-3 text-[var(--text-secondary)]">Laden...</span>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
                <Music className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">Geen tracks in deze playlist</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Voeg handmatig tracks toe of genereer een playlist</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 button-press hover-scale"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Voeg tracks toe
                </button>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 button-press hover-scale"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Genereer playlist
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-[var(--surface)] rounded-[4px] p-3 sm:p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {track.artwork_public_url ? (
                        <img
                          src={track.artwork_public_url}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[var(--text-primary)] font-medium text-base mb-1 truncate">
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] flex-wrap">
                        {track.artist && (
                          <span className="truncate">{track.artist}</span>
                        )}
                        {track.bpm && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3.5 h-3.5" />
                            <span>{Math.round(track.bpm)} BPM</span>
                          </div>
                        )}
                        {track.key && (
                          <span>{track.key}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{track.duration_formatted}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[var(--error)]/20 rounded-[4px] text-[var(--error)] hover:text-[var(--error)]"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Tracks Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">Tracks toevoegen</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedTracks(new Set());
                    }}
                    className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Zoek op titel, artiest of album..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4">
                  {searching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                      <span className="ml-3 text-[var(--text-secondary)]">Zoeken...</span>
                    </div>
                  ) : searchResults.length === 0 && searchQuery ? (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">Geen resultaten gevonden</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => toggleTrackSelection(track.id)}
                          className={`p-3 rounded-[4px] border cursor-pointer transition-all duration-200 ${
                            selectedTracks.has(track.id)
                              ? 'bg-[var(--primary)]/20 border-[var(--primary)]'
                              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {track.artwork_public_url ? (
                                <img
                                  src={track.artwork_public_url}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-6 h-6 text-[var(--text-muted)]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[var(--text-primary)] font-medium text-sm truncate">
                                {track.title}
                              </h4>
                              <p className="text-[var(--text-secondary)] text-xs truncate">
                                {track.artist || 'Onbekende artiest'} • {track.duration_formatted}
                              </p>
                            </div>
                            {selectedTracks.has(track.id) && (
                              <div className="w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">Begin met zoeken om tracks te vinden</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSelectedTracks(new Set());
                    }}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleAddSelectedTracks}
                    disabled={selectedTracks.size === 0 || searching}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Toevoegen...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Voeg {selectedTracks.size > 0 ? `${selectedTracks.size} ` : ''}toe
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate Playlist Modal */}
          {showGenerateModal && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">Playlist genereren</h3>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                        Min BPM
                      </label>
                      <input
                        type="number"
                        value={generateCriteria.bpmMin}
                        onChange={(e) => setGenerateCriteria({ ...generateCriteria, bpmMin: e.target.value })}
                        placeholder="60"
                        className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                        Max BPM
                      </label>
                      <input
                        type="number"
                        value={generateCriteria.bpmMax}
                        onChange={(e) => setGenerateCriteria({ ...generateCriteria, bpmMax: e.target.value })}
                        placeholder="180"
                        className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Key (optioneel)
                    </label>
                    <input
                      type="text"
                      value={generateCriteria.key}
                      onChange={(e) => setGenerateCriteria({ ...generateCriteria, key: e.target.value })}
                      placeholder="Bijv. C major, A minor"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Genre (optioneel)
                    </label>
                    <input
                      type="text"
                      value={generateCriteria.genre}
                      onChange={(e) => setGenerateCriteria({ ...generateCriteria, genre: e.target.value })}
                      placeholder="Bijv. House, Techno, Pop"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Aantal tracks
                    </label>
                    <input
                      type="number"
                      value={generateCriteria.limit}
                      onChange={(e) => setGenerateCriteria({ ...generateCriteria, limit: e.target.value })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    disabled={generating}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale disabled:opacity-50"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleGeneratePlaylist}
                    disabled={generating}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Genereren...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Genereer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
