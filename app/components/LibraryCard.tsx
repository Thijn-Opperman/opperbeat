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
    <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-white font-semibold text-sm sm:text-base">Music Library Insights</h3>
        <select className="bg-white/5 border border-white/10 rounded px-2 sm:px-3 py-1 text-white text-xs sm:text-sm w-full sm:w-auto">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="mb-4">
        <div className="text-2xl sm:text-4xl font-bold text-pink-500 mb-1">3,560</div>
        <p className="text-white/60 text-xs sm:text-sm">Total Tracks in Library</p>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={libraryData}>
            <Bar dataKey="tracks" fill="#ec4899" radius={[4, 4, 0, 0]} />
            <XAxis dataKey="month" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



