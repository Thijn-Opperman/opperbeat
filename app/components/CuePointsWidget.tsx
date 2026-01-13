'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, Play, Loader2, Clock } from 'lucide-react';
import { getAllCuePoints, type TrackCuePoints } from '@/lib/cue-helpers';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  duration_seconds: number;
  artwork_public_url: string | null;
}

export default function CuePointsWidget() {
  const [tracksWithCues, setTracksWithCues] = useState<Array<Track & { cuePoints: TrackCuePoints }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracksWithCuePoints();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTracksWithCuePoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTracksWithCuePoints = async () => {
    try {
      setLoading(true);
      const allCuePoints = getAllCuePoints();
      const trackIds = Object.keys(allCuePoints);
      
      if (trackIds.length === 0) {
        setTracksWithCues([]);
        setLoading(false);
        return;
      }
      
      // Fetch track data for tracks with cue points
      const response = await fetch(`/api/analyses?limit=100`);
      if (response.ok) {
        const result = await response.json();
        const allTracks: Track[] = result.data || [];
        
        const tracksWithCuesData = trackIds
          .map(trackId => {
            const track = allTracks.find(t => t.id === trackId);
            const cueData = allCuePoints[trackId];
            if (track && cueData) {
              return {
                ...track,
                cuePoints: cueData,
              };
            }
            return null;
          })
          .filter(Boolean) as Array<Track & { cuePoints: TrackCuePoints }>;
        
        // Sort by last updated, most recent first
        tracksWithCuesData.sort((a, b) => 
          new Date(b.cuePoints.lastUpdated).getTime() - new Date(a.cuePoints.lastUpdated).getTime()
        );
        
        setTracksWithCues(tracksWithCuesData.slice(0, 3)); // Show max 3
      }
    } catch (error) {
      console.error('Error fetching tracks with cue points:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-16">
      <Link href="/cue-points" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <Play className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Cue Points</h3>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
            </div>
          ) : tracksWithCues.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Play className="w-8 h-8 text-[var(--text-muted)] mb-2" />
              <div className="text-[var(--text-secondary)] text-xs">No cue points yet</div>
              <div className="text-[var(--text-muted)] text-xs mt-1">Analyze tracks to get started</div>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {tracksWithCues.map((track) => (
                <div key={track.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    {track.artwork_public_url ? (
                      <img
                        src={track.artwork_public_url}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[var(--text-primary)] text-sm font-medium truncate">
                        {track.title}
                      </div>
                      {track.artist && (
                        <div className="text-[var(--text-secondary)] text-xs truncate">
                          {track.artist}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {track.cuePoints.cuePoints.slice(0, 3).map((cue) => (
                      <div
                        key={cue.id}
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${getCueTypeColor(cue.type)}`}
                        title={cue.label || cue.type}
                      >
                        {cue.type} {formatTime(cue.time)}
                      </div>
                    ))}
                    {track.cuePoints.cuePoints.length > 3 && (
                      <div className="px-2 py-0.5 rounded text-xs text-[var(--text-muted)]">
                        +{track.cuePoints.cuePoints.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
