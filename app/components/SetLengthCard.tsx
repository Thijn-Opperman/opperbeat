'use client';

import { useState, useEffect } from 'react';

export default function SetLengthCard() {
  const [avgDuration, setAvgDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const avgSeconds = result.data.avgDuration || 0;
            setAvgDuration(Math.round(avgSeconds / 60)); // Convert to minutes
          }
        }
      } catch (error) {
        console.error('Error fetching set length data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const progress = avgDuration || 0;
  const maxMinutes = 60;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / maxMinutes) * circumference;

  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">Average Track Length</h3>
      </div>

      <div className="flex items-center justify-center h-36 sm:h-48">
        {loading ? (
          <div className="text-[var(--text-muted)] text-sm">Loading...</div>
        ) : (
          <div className="relative w-24 h-24 sm:w-32 sm:h-32">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="var(--border)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="var(--primary)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-[var(--text-primary)]">{progress}</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)]">min</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



