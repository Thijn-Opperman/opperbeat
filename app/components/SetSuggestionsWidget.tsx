'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, Play, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { getSetState, type TrackSuggestion } from '@/lib/set-helpers';

export default function SetSuggestionsWidget() {
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<{ title: string; artist: string | null } | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const state = getSetState();
        
        // Get current track info if available
        if (state.currentTrack) {
          const trackResponse = await fetch(`/api/analyses/${state.currentTrack}`);
          if (trackResponse.ok) {
            const trackData = await trackResponse.json();
            if (trackData.data) {
              setCurrentTrack({
                title: trackData.data.title,
                artist: trackData.data.artist,
              });
            }
          }
        }
        
        // If we have suggestions in state, use them
        if (state.suggestions && state.suggestions.length > 0) {
          setSuggestions(state.suggestions.slice(0, 5));
        } else {
          // Otherwise fetch new suggestions
          await refreshSuggestions(state);
        }
      } catch (error) {
        console.error('Error fetching set suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSuggestions, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshSuggestions = async (state: any) => {
    try {
      // Fetch all tracks
      const tracksResponse = await fetch('/api/analyses?limit=100');
      if (!tracksResponse.ok) return;
      
      const tracksData = await tracksResponse.json();
      const allTracks = tracksData.data || [];
      
      if (allTracks.length === 0) return;
      
      // Get current track data
      let currentTrackData = null;
      if (state.currentTrack) {
        const current = allTracks.find((t: any) => t.id === state.currentTrack);
        if (current) {
          // Infer energy from BPM
          let energy = 'medium';
          if (current.bpm) {
            if (current.bpm < 100) energy = 'low';
            else if (current.bpm < 130) energy = 'medium';
            else energy = 'high';
          }
          
          currentTrackData = {
            trackId: current.id,
            bpm: current.bpm,
            key: current.key,
            energy,
          };
        }
      }
      
      // Fetch suggestions
      const response = await fetch('/api/set/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrack: currentTrackData,
          history: state.history || [],
          allTracks: allTracks.map((t: any) => ({
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
        setSuggestions(newSuggestions.slice(0, 5));
        
        // Save to state
        const { updateSuggestions } = await import('@/lib/set-helpers');
        updateSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high':
        return <TrendingUp className="w-3 h-3 text-red-400" />;
      case 'low':
        return <TrendingDown className="w-3 h-3 text-blue-400" />;
      default:
        return <Minus className="w-3 h-3 text-yellow-400" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href="/set-suggestions" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <Music className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Next 5 Tracks</h3>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Music className="w-8 h-8 text-[var(--text-muted)] mb-2" />
              <div className="text-[var(--text-secondary)] text-xs">No suggestions yet</div>
              <div className="text-[var(--text-muted)] text-xs mt-1">Start a track to get suggestions</div>
            </div>
          ) : (
            <div className="flex-1 space-y-2">
              {currentTrack && (
                <div className="pb-2 mb-2 border-b border-[var(--border)]">
                  <div className="text-[var(--text-muted)] text-xs mb-1">Now Playing</div>
                  <div className="text-[var(--text-primary)] text-sm font-medium truncate">
                    {currentTrack.title}
                  </div>
                  {currentTrack.artist && (
                    <div className="text-[var(--text-secondary)] text-xs truncate">
                      {currentTrack.artist}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-[var(--text-muted)] text-xs mb-2">Suggested Next</div>
              
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.trackId}
                  className="flex items-start gap-2 p-2 rounded bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-[var(--text-primary)] text-sm font-medium truncate">
                        {suggestion.title}
                      </div>
                      {getEnergyIcon(suggestion.energy)}
                    </div>
                    {suggestion.artist && (
                      <div className="text-[var(--text-secondary)] text-xs truncate mb-1">
                        {suggestion.artist}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs">
                      {suggestion.bpm && (
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {suggestion.bpm} BPM
                        </span>
                      )}
                      {suggestion.cuePoint !== undefined && (
                        <span>Cue: {formatTime(suggestion.cuePoint)}</span>
                      )}
                      {suggestion.transitionType && (
                        <span className="capitalize">{suggestion.transitionType}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
  );
}
