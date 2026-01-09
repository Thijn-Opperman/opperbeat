'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalyticsData {
  totalTracks: number;
  activityTimeline: Array<{ month: string; count: number }>;
}

export default function LibraryCard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setData({
              totalTracks: result.data.totalTracks || 0,
              activityTimeline: result.data.activityTimeline || [],
            });
          }
        }
      } catch (error) {
        console.error('Error fetching library data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const libraryData = data?.activityTimeline.slice(-6).map(item => ({
    month: item.month,
    tracks: item.count,
  })) || [];

  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">Music Library Insights</h3>
      </div>

      <div className="mb-4">
        {loading ? (
          <div className="text-2xl sm:text-4xl font-bold text-[var(--text-muted)] mb-1">...</div>
        ) : (
          <div className="text-2xl sm:text-4xl font-bold text-[var(--primary)] mb-1">
            {data?.totalTracks.toLocaleString() || '0'}
          </div>
        )}
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm">Total Tracks in Library</p>
      </div>

      <div className="h-32">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">Loading...</div>
        ) : libraryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={libraryData}>
              <Bar dataKey="tracks" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">No data</div>
        )}
      </div>
    </div>
  );
}



