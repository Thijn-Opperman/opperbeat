'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { getUntaggedTracks } from '@/lib/tag-helpers';

interface Track {
  id: string;
}

export default function TagSuggestionsWidget() {
  const [untaggedCount, setUntaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUntaggedTracks = async () => {
      try {
        const response = await fetch('/api/analyses?limit=1000');
        if (response.ok) {
          const result = await response.json();
          const tracks: Track[] = result.data || [];
          
          // Filter to get untagged tracks
          const untagged = getUntaggedTracks(tracks);
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
    <Link href="/library" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-3 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex items-center gap-3">
          <div className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] flex-shrink-0">
            <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[var(--text-secondary)] text-xs mb-0.5">Tag Suggestions</div>
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : (
              <div className="text-lg font-bold text-[var(--primary)]">
                {untaggedCount} {untaggedCount === 1 ? 'track' : 'tracks'}
              </div>
            )}
          </div>
        </div>
      </Link>
  );
}
