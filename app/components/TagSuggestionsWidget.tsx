'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, AlertCircle } from 'lucide-react';
import { getUntaggedTracks } from '@/lib/tag-helpers';

interface Track {
  id: string;
  title: string;
  artist: string | null;
}

export default function TagSuggestionsWidget() {
  const [untaggedCount, setUntaggedCount] = useState(0);
  const [untaggedTracks, setUntaggedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUntaggedTracks = async () => {
      try {
        const response = await fetch('/api/analyses?limit=50');
        if (response.ok) {
          const result = await response.json();
          const tracks: Track[] = result.data || [];
          
          // Filter to get untagged tracks
          const untagged = getUntaggedTracks(tracks);
          const untaggedTrackData = tracks.filter(t => untagged.includes(t.id));
          
          setUntaggedTracks(untaggedTrackData.slice(0, 3)); // Show max 3
          setUntaggedCount(untagged.length);
        }
      } catch (error) {
        console.error('Error fetching untagged tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUntaggedTracks();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUntaggedTracks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-14">
      <Link href="/tags" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <Tag className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Tag Suggestions</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : untaggedCount > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl font-bold text-[var(--primary)]">{untaggedCount}</div>
                  <div className="text-[var(--text-secondary)] text-xs">
                    {untaggedCount === 1 ? 'track' : 'tracks'} need tagging
                  </div>
                </div>
                {untaggedTracks.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {untaggedTracks.map((track) => (
                      <div key={track.id} className="text-[var(--text-secondary)] text-xs truncate">
                        {track.title}
                        {track.artist && <span className="text-[var(--text-muted)]"> • {track.artist}</span>}
                      </div>
                    ))}
                    {untaggedCount > 3 && (
                      <div className="text-[var(--text-muted)] text-xs">+{untaggedCount - 3} more</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-2 bg-[var(--primary)]/10 rounded-full mb-2">
                  <Tag className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="text-[var(--text-secondary)] text-xs">All tracks tagged!</div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
