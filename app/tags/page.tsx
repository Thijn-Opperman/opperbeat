'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Tag, Check, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { getTaggedTracks, saveTrackTags, confirmTrackTags, getUntaggedTracks, type TrackTags } from '@/lib/tag-helpers';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  artwork_public_url: string | null;
}

interface TagSuggestion extends TrackTags {
  trackId: string;
  loading?: boolean;
}

export default function TagsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Record<string, TagSuggestion>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyses?limit=100');
      if (response.ok) {
        const result = await response.json();
        const allTracks: Track[] = result.data || [];
        
        // Filter to show only untagged tracks
        const untaggedIds = getUntaggedTracks(allTracks);
        const untaggedTracks = allTracks.filter(t => untaggedIds.includes(t.id));
        
        setTracks(untaggedTracks);
        
        // Load existing suggestions from localStorage
        const tagged = getTaggedTracks();
        const existingSuggestions: Record<string, TagSuggestion> = {};
        untaggedTracks.forEach(track => {
          if (tagged[track.id] && !tagged[track.id].confirmed) {
            existingSuggestions[track.id] = {
              ...tagged[track.id].tags,
              trackId: track.id,
            };
          }
        });
        setSuggestions(existingSuggestions);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (track: Track) => {
    try {
      setGenerating(track.id);
      setSuggestions(prev => ({
        ...prev,
        [track.id]: { ...prev[track.id], loading: true },
      }));

      const response = await fetch('/api/tags/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          genre: track.genre,
          bpm: track.bpm,
          key: track.key,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newSuggestion: TagSuggestion = {
          ...result.suggestions,
          trackId: track.id,
        };
        
        setSuggestions(prev => ({
          ...prev,
          [track.id]: newSuggestion,
        }));
        
        // Save to localStorage (unconfirmed)
        saveTrackTags(track.id, result.suggestions, false);
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate tag suggestions. Please try again.');
    } finally {
      setGenerating(null);
      setSuggestions(prev => ({
        ...prev,
        [track.id]: { ...prev[track.id], loading: false },
      }));
    }
  };

  const updateSuggestion = (trackId: string, field: keyof TrackTags, value: any) => {
    setSuggestions(prev => {
      const current = prev[trackId] || {} as TagSuggestion;
      let updated: TagSuggestion;
      if (field === 'instrumentation' && Array.isArray(value)) {
        updated = { ...current, [field]: value };
      } else {
        updated = { ...current, [field]: value };
      }
      
      // Update localStorage immediately
      const { trackId: _, loading: __, ...tags } = updated;
      saveTrackTags(trackId, tags, false);
      
      return {
        ...prev,
        [trackId]: updated,
      };
    });
  };

  const confirmTags = async (trackId: string) => {
    try {
      setSaving(trackId);
      const suggestion = suggestions[trackId];
      if (suggestion) {
        const { trackId: _, loading: __, ...tags } = suggestion;
        saveTrackTags(trackId, tags, true);
        confirmTrackTags(trackId);
        
        // Remove from list
        setTracks(prev => prev.filter(t => t.id !== trackId));
        setSuggestions(prev => {
          const next = { ...prev };
          delete next[trackId];
          return next;
        });
      }
    } catch (error) {
      console.error('Error confirming tags:', error);
      alert('Failed to save tags. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const energyOptions = ['low', 'medium', 'high'];
  const moodOptions = ['energetic', 'chill', 'melancholic', 'uplifting', 'aggressive', 'neutral'];
  const vocalTypeOptions: Array<'vocal' | 'instrumental' | 'mixed'> = ['vocal', 'instrumental', 'mixed'];
  const eraOptions = ['70s', '80s', '90s', '00s', '10s', '20s'];
  const instrumentationOptions = [
    'synth', 'guitar', 'drums', 'bass', 'piano', 'saxophone',
    'violin', 'trumpet', 'drum machine', 'vocals', 'strings', 'brass'
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Tag className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                Tag Suggestions
              </h1>
            </div>
            <p className="text-secondary text-sm">
              AI-generated tag suggestions for your tracks. Review and confirm or adjust as needed.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="p-4 bg-[var(--primary)]/10 rounded-full mb-4">
                <Check className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <h3 className="text-primary font-medium mb-2">All tracks tagged!</h3>
              <p className="text-secondary text-sm">All your tracks have been tagged and confirmed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tracks.map((track) => {
                const suggestion = suggestions[track.id];
                const hasSuggestion = !!suggestion && !suggestion.loading;

                return (
                  <div
                    key={track.id}
                    className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-6 animate-fade-in-up"
                  >
                    {/* Track Info */}
                    <div className="flex items-start gap-4 mb-6">
                      {track.artwork_public_url ? (
                        <img
                          src={track.artwork_public_url}
                          alt={track.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
                          <Tag className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-primary font-semibold text-lg mb-1">{track.title}</h3>
                        <div className="text-secondary text-sm space-y-1">
                          {track.artist && <div>Artist: {track.artist}</div>}
                          {track.album && <div>Album: {track.album}</div>}
                          <div className="flex gap-4">
                            {track.genre && <span>Genre: {track.genre}</span>}
                            {track.bpm && <span>BPM: {track.bpm}</span>}
                            {track.key && <span>Key: {track.key}</span>}
                          </div>
                        </div>
                      </div>
                      {!hasSuggestion && (
                        <button
                          onClick={() => generateSuggestions(track)}
                          disabled={generating === track.id}
                          className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 flex items-center gap-2 button-press hover-scale"
                        >
                          {generating === track.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate Tags
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Tag Suggestions */}
                    {hasSuggestion && (
                      <div className="space-y-4 border-t border-[var(--border)] pt-6">
                        {/* Energy */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Energy</label>
                          <div className="flex gap-2 flex-wrap">
                            {energyOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => updateSuggestion(track.id, 'energy', option)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                  suggestion.energy === option
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mood */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Mood</label>
                          <div className="flex gap-2 flex-wrap">
                            {moodOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => updateSuggestion(track.id, 'mood', option)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                  suggestion.mood === option
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Instrumentation */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Instrumentation</label>
                          <div className="flex gap-2 flex-wrap">
                            {instrumentationOptions.map((option) => {
                              const isSelected = suggestion.instrumentation?.includes(option);
                              return (
                                <button
                                  key={option}
                                  onClick={() => {
                                    const current = suggestion.instrumentation || [];
                                    const updated = isSelected
                                      ? current.filter(i => i !== option)
                                      : [...current, option].slice(0, 5); // Max 5
                                    updateSuggestion(track.id, 'instrumentation', updated);
                                  }}
                                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    isSelected
                                      ? 'bg-[var(--primary)] text-white'
                                      : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Vocal Type */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Vocal Type</label>
                          <div className="flex gap-2">
                            {vocalTypeOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => updateSuggestion(track.id, 'vocalType', option)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                  suggestion.vocalType === option
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Era */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">Era (optional)</label>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => updateSuggestion(track.id, 'era', null)}
                              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                !suggestion.era
                                  ? 'bg-[var(--primary)] text-white'
                                  : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                              }`}
                            >
                              None
                            </button>
                            {eraOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => updateSuggestion(track.id, 'era', option)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                  suggestion.era === option
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--surface-elevated)] text-secondary hover:bg-[var(--surface-hover)]'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                          <button
                            onClick={() => confirmTags(track.id)}
                            disabled={saving === track.id}
                            className="flex-1 px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 flex items-center justify-center gap-2 button-press hover-scale"
                          >
                            {saving === track.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Confirm Tags
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => generateSuggestions(track)}
                            disabled={generating === track.id}
                            className="px-4 py-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-primary font-medium rounded transition-all duration-200 flex items-center gap-2 button-press hover-scale"
                          >
                            {generating === track.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Regenerate
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
