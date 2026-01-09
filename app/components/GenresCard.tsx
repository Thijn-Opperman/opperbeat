'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const genresData = [
  { name: 'House', value: 35, color: '#EC4899', change: '+88%' },
  { name: 'Techno', value: 30, color: '#8B5CF6', change: '+74%' },
  { name: 'Hip-Hop', value: 20, color: '#00F5FF', change: '+60%' },
  { name: 'Other', value: 15, color: '#6366F1', change: '+45%' },
];

export default function GenresCard() {
  return (
    <div className="bg-surface-elevated rounded-lg p-4 sm:p-6 border border-theme transition-all duration-200 hover:border-theme-hover hover-lift">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-primary font-semibold text-sm sm:text-base">Genres Breakdown</h3>
        <select className="bg-surface border border-theme rounded px-2 sm:px-3 py-1 text-primary text-xs sm:text-sm w-full sm:w-auto">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32">
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
                <span className="text-secondary text-sm">{genre.name}</span>
              </div>
              <span className="text-primary font-semibold text-sm">{genre.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



