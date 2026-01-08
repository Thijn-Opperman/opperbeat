'use client';

import Sidebar from '../components/Sidebar';
import { TrendingUp, Music, Clock, Users, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Totaal Tracks', value: '3,456', change: '+12.5%', trend: 'up', icon: Music },
    { label: 'Totaal Mixes', value: '48', change: '+4', trend: 'up', icon: BarChart3 },
    { label: 'Gem. Duur', value: '2h 34m', change: '+8m', trend: 'up', icon: Clock },
    { label: 'Actieve Gebruikers', value: '1,234', change: '-2.1%', trend: 'down', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 tracking-tight">Analytics</h1>
            <p className="text-[#f5f5f7]/70 text-sm">Inzichten en statistieken over je muziek collectie</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1a1a22] rounded-xl p-4 sm:p-6 border border-white/8 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-[#3b82f6]/10 rounded-lg">
                      <Icon className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
                    <p className="text-[#f5f5f7]/60 text-sm">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Genre Distribution */}
            <div className="bg-[#1a1a22] rounded-xl p-4 sm:p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold">Genre Verdeling</h3>
              </div>
              <div className="space-y-4">
                {[
                  { genre: 'House', percentage: 35, color: '#3b82f6' },
                  { genre: 'Techno', percentage: 28, color: '#06b6d4' },
                  { genre: 'Hip-Hop', percentage: 20, color: '#10b981' },
                  { genre: 'Electronic', percentage: 17, color: '#f59e0b' },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#f5f5f7]/90 text-sm font-medium">{item.genre}</span>
                      <span className="text-white text-sm font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#14141a] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-[#1a1a22] rounded-xl p-4 sm:p-6 border border-white/8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-white font-semibold">Activiteit</h3>
              </div>
              <div className="h-64 bg-[#14141a] rounded-lg border border-white/5 flex items-center justify-center">
                <p className="text-[#f5f5f7]/40 text-sm">Activiteit grafiek komt hier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

