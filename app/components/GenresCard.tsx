'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const genresData = [
  { name: 'House', value: 35, color: '#ec4899', change: '+88%' },
  { name: 'Techno', value: 30, color: '#a855f7', change: '+74%' },
  { name: 'Hip-Hop', value: 20, color: '#3b82f6', change: '+60%' },
  { name: 'Other', value: 15, color: '#6b7280', change: '+45%' },
];

export default function GenresCard() {
  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Genres Breakdown</h3>
        <select className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genresData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {genresData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {genresData.map((genre) => (
            <div key={genre.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: genre.color }}
                />
                <span className="text-white/80 text-sm">{genre.name}</span>
              </div>
              <span className="text-white font-semibold text-sm">{genre.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

