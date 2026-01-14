'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Music, Play, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, Check, X, Search } from 'lucide-react';
import { getSetState, setCurrentTrack, updateSuggestions, addToHistory, clearSetState, type TrackSuggestion } from '@/lib/set-helpers';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  bpm: number | null;
  key: string | null;
  artwork_public_url: string | null;
}

export default function SetSuggestionsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTracks();
    loadState();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyses?limit=100');
      if (response.ok) {
        const result = await response.json();
        setTracks(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadState = () => {
    const state = getSetState();
    setCurrentTrackId(state.currentTrack);
    setSuggestions(state.suggestions || []);
  };

  const generateSuggestions = async (trackId?: string) => {
    try {
      setGenerating(true);
      const targetTrackId = trackId || currentTrackId;
      
      if (!targetTrackId) {
        alert('Please select a current track first');
        return;
      }

      const state = getSetState();
      const currentTrack = tracks.find(t => t.id === targetTrackId);
      
      if (!currentTrack) {
        alert('Track not found');
        return;
      }

      // Infer energy from BPM
      let energy = 'medium';
      if (currentTrack.bpm) {
        if (currentTrack.bpm < 100) energy = 'low';
        else if (currentTrack.bpm < 130) energy = 'medium';
        else energy = 'high';
      }

      const currentTrackData = {
        trackId: currentTrack.id,
        bpm: currentTrack.bpm,
        key: currentTrack.key,
        energy,
      };

      const response = await fetch('/api/set/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrack: currentTrackData,
          history: state.history || [],
          allTracks: tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            bpm: t.bpm,
            key: t.key,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newSuggestions = result.suggestions || [];
        setSuggestions(newSuggestions);
        updateSuggestions(newSuggestions);
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const selectCurrentTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Infer energy from BPM
    let energy = 'medium';
    if (track.bpm) {
      if (track.bpm < 100) energy = 'low';
      else if (track.bpm < 130) energy = 'medium';
      else energy = 'high';
    }

    setCurrentTrackId(trackId);
    setCurrentTrack(trackId, {
      energy,
      bpm: track.bpm,
      key: track.key,
    });

    // Auto-generate suggestions
    generateSuggestions(trackId);
  };

  const playTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Infer energy from BPM
    let energy = 'medium';
    if (track.bpm) {
      if (track.bpm < 100) energy = 'low';
      else if (track.bpm < 130) energy = 'medium';
      else energy = 'high';
    }

    // Add to history
    addToHistory(trackId, {
      energy,
      bpm: track.bpm,
      key: track.key,
    });

    // Set as current
    setCurrentTrackId(trackId);
    setCurrentTrack(trackId, {
      energy,
      bpm: track.bpm,
      key: track.key,
    });

    // Generate new suggestions
    generateSuggestions(trackId);
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-blue-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const currentTrack = tracks.find(t => t.id === currentTrackId);
  const state = getSetState();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20">
                  <Music className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    Set Suggestions
                  </h1>
                  <p className="text-secondary text-sm mt-1">
                    AI-powered track recommendations for your set
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Clear all set data? This will reset your current track and history.')) {
                    clearSetState();
                    setCurrentTrackId(null);
                    setSuggestions([]);
                  }
                }}
                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--error)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-all font-medium"
              >
                Clear Set
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Zoek nummers op titel, artiest of album..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-base font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Current Track Section */}
          {currentTrack && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl border border-[var(--primary)]/20 p-6 flex items-center gap-5 shadow-lg">
                {currentTrack.artwork_public_url ? (
                  <img
                    src={currentTrack.artwork_public_url}
                    alt={currentTrack.title}
                    className="w-20 h-20 rounded-lg object-cover shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center shadow-md">
                    <Music className="w-10 h-10 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-primary font-bold text-xl mb-1">{currentTrack.title}</h3>
                  {currentTrack.artist && (
                    <div className="text-secondary text-base mb-2 font-medium">{currentTrack.artist}</div>
                  )}
                  <div className="flex gap-5 mt-2 text-secondary text-sm">
                    {currentTrack.bpm && (
                      <span className="px-3 py-1 bg-[var(--surface)] rounded-lg border border-[var(--border)] font-medium">
                        {currentTrack.bpm} BPM
                      </span>
                    )}
                    {currentTrack.key && (
                      <span className="px-3 py-1 bg-[var(--surface)] rounded-lg border border-[var(--border)] font-medium">
                        {currentTrack.key}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => generateSuggestions()}
                  disabled={generating}
                  className="px-5 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 button-press hover-scale shadow-md"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Refresh Suggestions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">Next 5 Tracks</h2>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => {
                  const track = tracks.find(t => t.id === suggestion.trackId);
                  if (!track) return null;

                  return (
                    <div
                      key={suggestion.trackId}
                      className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4 hover:border-[var(--border-hover)] transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-lg font-bold">
                          {index + 1}
                        </div>
                        {track.artwork_public_url ? (
                          <img
                            src={track.artwork_public_url}
                            alt={track.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                            <Music className="w-6 h-6 text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-primary font-semibold text-base truncate">
                              {track.title}
                            </h3>
                            {getEnergyIcon(suggestion.energy)}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getEnergyColor(suggestion.energy)}`}>
                              {suggestion.energy}
                            </span>
                          </div>
                          {track.artist && (
                            <div className="text-secondary text-sm mb-2">{track.artist}</div>
                          )}
                          <div className="flex flex-wrap gap-4 text-secondary text-xs">
                            {suggestion.bpm && <span>BPM: {suggestion.bpm}</span>}
                            {suggestion.key && <span>Key: {suggestion.key}</span>}
                            {suggestion.cuePoint !== undefined && (
                              <span>Cue Point: {formatTime(suggestion.cuePoint)}</span>
                            )}
                            {suggestion.transitionType && (
                              <span className="capitalize">Transition: {suggestion.transitionType}</span>
                            )}
                            <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => playTrack(suggestion.trackId)}
                          className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded transition-all duration-200 flex items-center gap-2 button-press hover-scale"
                        >
                          <Play className="w-4 h-4" />
                          Play Next
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Track Selection */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tracks
                  .filter((track) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      track.title.toLowerCase().includes(query) ||
                      track.artist?.toLowerCase().includes(query) ||
                      track.album?.toLowerCase().includes(query)
                    );
                  })
                  .slice(0, 16)
                  .map((track) => (
                  <div
                    key={track.id}
                    className={`bg-[var(--surface)] rounded-xl border-2 p-4 cursor-pointer transition-all hover:border-[var(--primary)] hover:shadow-lg hover-lift ${
                      currentTrackId === track.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md'
                        : 'border-[var(--border)]'
                    }`}
                    onClick={() => selectCurrentTrack(track.id)}
                  >
                    <div className="flex items-start gap-3">
                      {track.artwork_public_url ? (
                        <img
                          src={track.artwork_public_url}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                          <Music className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-primary font-semibold text-sm truncate mb-1">
                          {track.title}
                        </h3>
                        {track.artist && (
                          <div className="text-secondary text-xs truncate mb-2 font-medium">
                            {track.artist}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {track.bpm && (
                            <span className="text-[var(--text-muted)] text-xs px-2 py-0.5 bg-[var(--background)] rounded font-medium">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.key && (
                            <span className="text-[var(--text-muted)] text-xs px-2 py-0.5 bg-[var(--background)] rounded font-medium">
                              {track.key}
                            </span>
                          )}
                        </div>
                      </div>
                      {currentTrackId === track.id && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
