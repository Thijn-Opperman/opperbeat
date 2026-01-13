'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Play, Loader2, Sparkles, Plus, Trash2, Edit2, Check, X, Clock, Music } from 'lucide-react';
import { getTrackCuePoints, saveTrackCuePoints, addCuePoint, updateCuePoint, deleteCuePoint, type CuePoint } from '@/lib/cue-helpers';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration_seconds: number;
  duration_formatted: string;
  bpm: number | null;
  key: string | null;
  artwork_public_url: string | null;
  waveform: any | null;
}

export default function CuePointsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingCue, setEditingCue] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>('');

  useEffect(() => {
    fetchTracks();
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

  const selectTrack = (track: Track) => {
    setSelectedTrack(track);
    const existing = getTrackCuePoints(track.id);
    if (existing) {
      setCuePoints(existing.cuePoints);
    } else {
      setCuePoints([]);
    }
  };

  const analyzeCuePoints = async () => {
    if (!selectedTrack) return;

    try {
      setAnalyzing(true);
      const response = await fetch('/api/cue-points/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: selectedTrack.id,
          duration: selectedTrack.duration_seconds,
          bpm: selectedTrack.bpm,
          waveform: selectedTrack.waveform,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newCuePoints = result.cuePoints || [];
        setCuePoints(newCuePoints);
        saveTrackCuePoints(selectedTrack.id, selectedTrack.duration_seconds, newCuePoints);
      } else {
        throw new Error('Failed to analyze cue points');
      }
    } catch (error) {
      console.error('Error analyzing cue points:', error);
      alert('Failed to analyze cue points. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const addCustomCuePoint = () => {
    if (!selectedTrack) return;

    const newCue: CuePoint = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      time: 0,
      label: 'Custom',
    };
    
    const updated = [...cuePoints, newCue].sort((a, b) => a.time - b.time);
    setCuePoints(updated);
    saveTrackCuePoints(selectedTrack.id, selectedTrack.duration_seconds, updated);
    setEditingCue(newCue.id);
    setEditingTime('0:00');
  };

  const updateCueTime = (cueId: string, timeString: string) => {
    if (!selectedTrack) return;

    // Parse time string (format: M:SS or MM:SS)
    const parts = timeString.split(':');
    if (parts.length !== 2) return;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds)) return;

    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds < 0 || totalSeconds > selectedTrack.duration_seconds) return;

    const updated = cuePoints.map(cue =>
      cue.id === cueId ? { ...cue, time: totalSeconds } : cue
    ).sort((a, b) => a.time - b.time);

    setCuePoints(updated);
    saveTrackCuePoints(selectedTrack.id, selectedTrack.duration_seconds, updated);
  };

  const saveCueEdit = (cueId: string) => {
    if (!selectedTrack) return;
    const cue = cuePoints.find(c => c.id === cueId);
    if (!cue) return;

    updateCuePoint(selectedTrack.id, cueId, {
      time: cue.time,
      label: cue.label,
    });
    setEditingCue(null);
  };

  const removeCuePoint = (cueId: string) => {
    if (!selectedTrack) return;
    const updated = cuePoints.filter(cue => cue.id !== cueId);
    setCuePoints(updated);
    saveTrackCuePoints(selectedTrack.id, selectedTrack.duration_seconds, updated);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeString: string): number | null => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  };

  const getCueTypeColor = (type: string) => {
    switch (type) {
      case 'intro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'drop':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'outro':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getCueTypeLabel = (type: string) => {
    switch (type) {
      case 'intro':
        return 'Intro';
      case 'drop':
        return 'Drop';
      case 'outro':
        return 'Outro';
      default:
        return 'Custom';
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Play className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                Cue Points & Transitions
              </h1>
            </div>
            <p className="text-secondary text-sm">
              AI-powered cue point detection and management. Analyze tracks to automatically find intro, drop, and outro points.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Track Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-primary mb-3">Select Track</h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tracks.map((track) => {
                    const hasCues = getTrackCuePoints(track.id) !== null;
                    return (
                      <div
                        key={track.id}
                        onClick={() => selectTrack(track)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedTrack?.id === track.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {track.artwork_public_url ? (
                            <img
                              src={track.artwork_public_url}
                              alt={track.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                              <Music className="w-6 h-6 text-[var(--text-muted)]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-primary font-medium text-sm truncate">
                                {track.title}
                              </h3>
                              {hasCues && (
                                <div className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0" />
                              )}
                            </div>
                            {track.artist && (
                              <div className="text-secondary text-xs truncate mb-1">
                                {track.artist}
                              </div>
                            )}
                            <div className="flex gap-3 text-[var(--text-muted)] text-xs">
                              <span>{track.duration_formatted}</span>
                              {track.bpm && <span>{track.bpm} BPM</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cue Points Management */}
            <div className="lg:col-span-2">
              {selectedTrack ? (
                <div className="space-y-6">
                  {/* Track Info */}
                  <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4">
                    <div className="flex items-start gap-4 mb-4">
                      {selectedTrack.artwork_public_url ? (
                        <img
                          src={selectedTrack.artwork_public_url}
                          alt={selectedTrack.title}
                          className="w-20 h-20 rounded object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                          <Music className="w-10 h-10 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-primary font-semibold text-xl mb-1">
                          {selectedTrack.title}
                        </h2>
                        {selectedTrack.artist && (
                          <div className="text-secondary text-sm mb-2">
                            {selectedTrack.artist}
                          </div>
                        )}
                        <div className="flex gap-4 text-secondary text-xs">
                          <span>Duration: {selectedTrack.duration_formatted}</span>
                          {selectedTrack.bpm && <span>BPM: {selectedTrack.bpm}</span>}
                          {selectedTrack.key && <span>Key: {selectedTrack.key}</span>}
                        </div>
                      </div>
                      <button
                        onClick={analyzeCuePoints}
                        disabled={analyzing}
                        className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 flex items-center gap-2 button-press hover-scale"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze Cue Points
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cue Points List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-primary">
                        Cue Points ({cuePoints.length})
                      </h3>
                      <button
                        onClick={addCustomCuePoint}
                        className="px-3 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-primary font-medium rounded transition-all duration-200 flex items-center gap-2 text-sm button-press hover-scale"
                      >
                        <Plus className="w-4 h-4" />
                        Add Custom
                      </button>
                    </div>

                    {cuePoints.length === 0 ? (
                      <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] border-dashed p-8 text-center">
                        <Play className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-secondary text-sm mb-2">No cue points yet</p>
                        <p className="text-[var(--text-muted)] text-xs">
                          Click "Analyze Cue Points" to automatically detect intro, drop, and outro points
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cuePoints.map((cue) => {
                          const isEditing = editingCue === cue.id;
                          return (
                            <div
                              key={cue.id}
                              className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`px-3 py-1.5 rounded border font-medium text-sm ${getCueTypeColor(cue.type)}`}>
                                  {getCueTypeLabel(cue.type)}
                                </div>
                                
                                {isEditing ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={editingTime || formatTime(cue.time)}
                                      onChange={(e) => {
                                        setEditingTime(e.target.value);
                                        const parsed = parseTimeInput(e.target.value);
                                        if (parsed !== null && selectedTrack) {
                                          const updated = cuePoints.map(c =>
                                            c.id === cue.id ? { ...c, time: parsed } : c
                                          ).sort((a, b) => a.time - b.time);
                                          setCuePoints(updated);
                                        }
                                      }}
                                      className="px-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded text-primary text-sm w-20"
                                      placeholder="M:SS"
                                    />
                                    <button
                                      onClick={() => saveCueEdit(cue.id)}
                                      className="p-1.5 bg-[var(--primary)] hover:opacity-90 text-white rounded transition-all"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCue(null);
                                        setCuePoints(cuePoints); // Reset to original
                                      }}
                                      className="p-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded text-primary transition-all"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span className="text-primary font-mono text-sm">
                                      {formatTime(cue.time)}
                                    </span>
                                    {cue.label && (
                                      <span className="text-secondary text-sm">
                                        ({cue.label})
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {!isEditing && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingCue(cue.id);
                                        setEditingTime(formatTime(cue.time));
                                      }}
                                      className="p-1.5 hover:bg-[var(--surface-hover)] rounded transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                      title="Edit time"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => removeCuePoint(cue.id)}
                                      className="p-1.5 hover:bg-red-500/20 rounded transition-all text-[var(--text-secondary)] hover:text-red-400"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] border-dashed p-12 text-center">
                  <Play className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                  <h3 className="text-primary font-medium mb-2">Select a track</h3>
                  <p className="text-secondary text-sm">
                    Choose a track from the list to analyze and manage cue points
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
