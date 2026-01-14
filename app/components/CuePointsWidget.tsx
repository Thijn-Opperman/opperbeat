'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getAllCuePoints } from '@/lib/cue-helpers';

interface Track {
  id: string;
}

export default function CuePointsWidget() {
  const [tracksWithoutCuesCount, setTracksWithoutCuesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracksWithoutCuePoints();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTracksWithoutCuePoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTracksWithoutCuePoints = async () => {
    try {
      setLoading(true);
      const allCuePoints = getAllCuePoints();
      const tracksWithCues = Object.keys(allCuePoints);
      
      // Fetch all tracks
      const response = await fetch(`/api/analyses?limit=1000`);
      if (response.ok) {
        const result = await response.json();
        const allTracks: Track[] = result.data || [];
        
        // Count tracks without cue points
        const tracksWithoutCues = allTracks.filter(track => !tracksWithCues.includes(track.id));
        setTracksWithoutCuesCount(tracksWithoutCues.length);
      }
    } catch (error) {
      console.error('Error fetching tracks without cue points:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up stagger-16">
      <Link href="/library" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-3 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex items-center gap-3">
          <div className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] flex-shrink-0">
            <Play className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[var(--text-secondary)] text-xs mb-0.5">Cue Points</div>
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : (
              <div className="text-lg font-bold text-[var(--primary)]">
                {tracksWithoutCuesCount} {tracksWithoutCuesCount === 1 ? 'track' : 'tracks'}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
