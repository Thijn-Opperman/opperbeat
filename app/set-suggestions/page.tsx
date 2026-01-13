'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Music, Play, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, Check, X } from 'lucide-react';
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
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                  <Music className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                  Set Suggestions
                </h1>
              </div>
              <button
                onClick={() => {
                  if (confirm('Clear all set data? This will reset your current track and history.')) {
                    clearSetState();
                    setCurrentTrackId(null);
                    setSuggestions([]);
                  }
                }}
                className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--error)] border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] transition-all"
              >
                Clear Set
              </button>
            </div>
            <p className="text-secondary text-sm">
              Select a current track to get AI-powered suggestions for your next tracks.
            </p>
          </div>

          {/* Current Track Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-primary mb-3">Current Track</h2>
            {currentTrack ? (
              <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4 flex items-center gap-4">
                {currentTrack.artwork_public_url ? (
                  <img
                    src={currentTrack.artwork_public_url}
                    alt={currentTrack.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                    <Music className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-primary font-semibold text-lg">{currentTrack.title}</h3>
                  {currentTrack.artist && (
                    <div className="text-secondary text-sm">{currentTrack.artist}</div>
                  )}
                  <div className="flex gap-4 mt-1 text-secondary text-xs">
                    {currentTrack.bpm && <span>BPM: {currentTrack.bpm}</span>}
                    {currentTrack.key && <span>Key: {currentTrack.key}</span>}
                  </div>
                </div>
                <button
                  onClick={() => generateSuggestions()}
                  disabled={generating}
                  className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 flex items-center gap-2 button-press hover-scale"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Suggestions
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] border-dashed p-8 text-center">
                <Music className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-secondary text-sm mb-4">No current track selected</p>
                <p className="text-[var(--text-muted)] text-xs">Select a track from the list below to start</p>
              </div>
            )}
          </div>

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-primary mb-3">Next 5 Tracks</h2>
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
            <h2 className="text-lg font-semibold text-primary mb-3">
              {currentTrack ? 'Select Different Track' : 'Select Current Track'}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracks.slice(0, 12).map((track) => (
                  <div
                    key={track.id}
                    className={`bg-[var(--surface)] rounded-lg border p-4 cursor-pointer transition-all hover:border-[var(--border-hover)] hover-lift ${
                      currentTrackId === track.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
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
                        <h3 className="text-primary font-medium text-sm truncate mb-1">
                          {track.title}
                        </h3>
                        {track.artist && (
                          <div className="text-secondary text-xs truncate mb-2">
                            {track.artist}
                          </div>
                        )}
                        <div className="flex gap-3 text-[var(--text-muted)] text-xs">
                          {track.bpm && <span>{track.bpm} BPM</span>}
                          {track.key && <span>{track.key}</span>}
                        </div>
                      </div>
                      {currentTrackId === track.id && (
                        <Check className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
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
