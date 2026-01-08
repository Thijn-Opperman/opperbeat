'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { TrendingUp, Music, Clock, Users, BarChart3, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

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
  totalMixes: number;
}

const genreColors = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
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

  const stats = analyticsData ? [
    { 
      label: t.analytics.totalTracks, 
      value: formatNumber(analyticsData.totalTracks), 
      change: '', 
      trend: 'up' as const, 
      icon: Music 
    },
    { 
      label: t.analytics.totalMixes, 
      value: formatNumber(analyticsData.totalMixes), 
      change: '', 
      trend: 'up' as const, 
      icon: BarChart3 
    },
    { 
      label: t.analytics.avgDuration, 
      value: analyticsData.avgDurationFormatted, 
      change: '', 
      trend: 'up' as const, 
      icon: Clock 
    },
    { 
      label: t.analytics.activeUsers, 
      value: '—', 
      change: '', 
      trend: 'up' as const, 
      icon: Users 
    },
  ] : [];

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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-2 tracking-tight">{t.analytics.title}</h1>
            <p className="text-secondary text-sm">{t.analytics.subtitle}</p>
          </div>

          {/* Stats Grid */}
          {analyticsData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-[var(--primary)]/10 rounded-lg">
                          <Icon className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        {stat.change && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            stat.trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--error)]'
                          }`}>
                            {stat.trend === 'up' ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            <span>{stat.change}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-primary mb-1">{stat.value}</p>
                        <p className="text-secondary text-sm">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Genre Distribution */}
                <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-primary font-semibold">{t.analytics.genreDistribution}</h3>
                  </div>
                  {analyticsData.genreDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {analyticsData.genreDistribution.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-primary text-sm font-medium">{item.genre}</span>
                            <span className="text-primary text-sm font-semibold">
                              {item.percentage}% ({item.count})
                            </span>
                          </div>
                          <div className="w-full bg-surface rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${item.percentage}%`, 
                                backgroundColor: genreColors[index % genreColors.length] 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-sm text-center py-8">
                      Geen genre data beschikbaar
                    </p>
                  )}
                </div>

                {/* Activity Timeline */}
                <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-primary font-semibold">{t.analytics.activity}</h3>
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
                              backgroundColor: 'var(--surface-elevated)', 
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
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
                    <div className="h-64 bg-surface rounded-lg border border-theme flex items-center justify-center">
                      <p className="text-muted text-sm">{t.analytics.activityChartPlaceholder}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* BPM Distribution */}
              {analyticsData.bpmDistribution && analyticsData.bpmDistribution.some(b => b.count > 0) && (
                <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                      <Music className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-primary font-semibold">BPM Distributie</h3>
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
                            backgroundColor: 'var(--surface-elevated)', 
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

