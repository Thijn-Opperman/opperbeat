'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const genreColors = ['#EC4899', '#8B5CF6', '#00F5FF', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

interface GenreData {
  genre: string;
  count: number;
  percentage: number;
}

export default function GenresCard() {
  const [genresData, setGenresData] = useState<GenreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const genreDistribution = result.data.genreDistribution || [];
            setGenresData(genreDistribution.slice(0, 4)); // Top 4 genres
          }
        }
      } catch (error) {
        console.error('Error fetching genres data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = genresData.map((genre, index) => ({
    name: genre.genre,
    value: genre.percentage,
    color: genreColors[index % genreColors.length],
  }));

  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">Genres Breakdown</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">Loading...</div>
      ) : chartData.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3">
            {genresData.map((genre, index) => (
              <div key={genre.genre} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: genreColors[index % genreColors.length] }}
                  />
                  <span className="text-[var(--text-secondary)] text-sm">{genre.genre}</span>
                </div>
                <span className="text-[var(--text-primary)] font-semibold text-sm">{genre.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">No genre data</div>
      )}
    </div>
  );
}



