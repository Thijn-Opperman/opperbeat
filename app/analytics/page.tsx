'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { TrendingUp, Music, Clock, BarChart3, Loader2, AlertCircle, ListMusic, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const SETS_STORAGE_KEY = 'opperbeat_sets';

interface AnalyticsData {
  totalTracks: number;
  totalDuration: number;
  totalDurationFormatted: string;
  avgDuration: number;
  avgDurationFormatted: string;
  genreDistribution: Array<{ genre: string; count: number; percentage: number }>;
  bpmDistribution: Array<{ range: string; count: number; percentage: number }>;
  keyDistribution: Array<{ key: string; count: number; percentage: number }>;
  activityTimeline: Array<{ month: string; count: number }>;
  totalPlaylists: number;
}

const genreColors = [
  '#EC4899', '#8B5CF6', '#00F5FF', '#6366F1', '#10B981', 
  '#F59E0B', '#EF4444', '#06B6D4', '#F97316', '#14B8A6'
];

const getSetsFromStorage = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [totalSets, setTotalSets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Fout bij ophalen van analytics');
        }

        setAnalyticsData(data.data);
        
        const sets = getSetsFromStorage();
        setTotalSets(sets.length);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Onbekende fout');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('nl-NL');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
            <p className="text-secondary">{t.common.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-[var(--error)] mx-auto mb-4" />
            <h3 className="text-primary font-medium mb-2">{t.common.error}</h3>
            <p className="text-secondary text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const stats = [
    {
      label: 'Tracks',
      value: formatNumber(analyticsData.totalTracks),
      icon: Music,
      subtitle: analyticsData.totalDurationFormatted,
    },
    {
      label: 'Playlists',
      value: formatNumber(analyticsData.totalPlaylists),
      icon: ListMusic,
      subtitle: 'Collecties',
    },
    {
      label: 'Sets',
      value: formatNumber(totalSets),
      icon: Sparkles,
      subtitle: 'Mix sets',
    },
    {
      label: 'Gem. Duur',
      value: analyticsData.avgDurationFormatted,
      icon: Clock,
      subtitle: 'Per track',
    },
  ];

  const genreChartData = analyticsData.genreDistribution.slice(0, 8).map((item, index) => ({
    name: item.genre,
    value: item.percentage,
    count: item.count,
    fill: genreColors[index % genreColors.length],
  }));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                {t.analytics.title}
              </h1>
            </div>
            <p className="text-secondary text-sm">{t.analytics.subtitle}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                      <Icon className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-[var(--text-primary)] font-semibold text-sm">{stat.label}</h3>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-[var(--primary)] mb-1">{stat.value}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{stat.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Genre Distribution */}
            <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                  <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.analytics.genreDistribution}</h3>
              </div>
              {analyticsData.genreDistribution.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genreChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {genreChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)'
                          }}
                          formatter={(value: number, name: string, props: any) => [
                            `${value.toFixed(1)}% (${props.payload.count})`,
                            props.payload.name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 min-w-0 w-full">
                    {analyticsData.genreDistribution.slice(0, 8).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: genreColors[index % genreColors.length] }}
                          />
                          <span className="text-sm text-[var(--text-secondary)] truncate">{item.genre}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{item.percentage}%</span>
                          <span className="text-xs text-[var(--text-secondary)]">({item.count})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-[var(--text-muted)] text-sm">Geen genre data beschikbaar</p>
                </div>
              )}
            </div>

            {/* Activity Timeline */}
            <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                  <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.analytics.activity}</h3>
              </div>
              {analyticsData.activityTimeline && analyticsData.activityTimeline.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.activityTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--primary)', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-[var(--text-muted)] text-sm">{t.analytics.activityChartPlaceholder}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* BPM Distribution */}
            {analyticsData.bpmDistribution && analyticsData.bpmDistribution.some(b => b.count > 0) && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <Music className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">BPM Distributie</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.bpmDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="range"
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key Distribution */}
            {analyticsData.keyDistribution && analyticsData.keyDistribution.length > 0 && (
              <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                    <Music className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">Key Distributie</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.keyDistribution.slice(0, 12).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{item.key}</span>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.percentage}% ({item.count})
                        </span>
                      </div>
                      <div className="w-full bg-[var(--surface)] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: genreColors[index % genreColors.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
