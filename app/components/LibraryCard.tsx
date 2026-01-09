'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const libraryData = [
  { month: 'Jan', tracks: 3200 },
  { month: 'Feb', tracks: 3350 },
  { month: 'Mar', tracks: 3450 },
  { month: 'Apr', tracks: 3520 },
  { month: 'May', tracks: 3560 },
  { month: 'Jun', tracks: 3560 },
];

export default function LibraryCard() {
  return (
    <div className="bg-surface-elevated rounded-lg p-4 sm:p-6 border border-theme transition-all duration-200 hover:border-theme-hover hover-lift">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-primary font-semibold text-sm sm:text-base">Music Library Insights</h3>
        <select className="bg-surface border border-theme rounded px-2 sm:px-3 py-1 text-primary text-xs sm:text-sm w-full sm:w-auto">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="mb-4">
        <div className="text-2xl sm:text-4xl font-bold text-[var(--secondary)] mb-1">3,560</div>
        <p className="text-secondary text-xs sm:text-sm">Total Tracks in Library</p>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={libraryData}>
            <Bar dataKey="tracks" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface-elevated)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



