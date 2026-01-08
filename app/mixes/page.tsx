'use client';

import Sidebar from '../components/Sidebar';
import { Music, Clock, Play, MoreVertical, Plus, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function MixesPage() {
  const { t } = useI18n();
  const mixes = [
    { id: 1, name: 'Summer Vibes 2024', duration: '1:23:45', tracks: 24, date: '15 jan 2024' },
    { id: 2, name: 'Deep House Session', duration: '2:15:30', tracks: 38, date: '12 jan 2024' },
    { id: 3, name: 'Techno Night Mix', duration: '3:42:12', tracks: 52, date: '8 jan 2024' },
    { id: 4, name: 'Chillout Lounge', duration: '1:45:20', tracks: 28, date: '5 jan 2024' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0714] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight gradient-text">{t.mixes.title}</h1>
              <p className="text-[#f5f3ff]/75 text-sm">{t.mixes.subtitle}</p>
            </div>
            <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 hover:scale-105 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" />
              {t.mixes.newMix}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#f5f3ff]/40" />
              <input
                type="text"
                placeholder={t.mixes.searchMixes}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#1d1628] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#8B5CF6]/50 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Mixes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mixes.map((mix) => (
              <div
                key={mix.id}
                className="bg-[#1d1628] rounded-xl p-4 sm:p-6 border border-[#8B5CF6]/20 shadow-xl hover:border-[#8B5CF6]/40 hover:shadow-2xl hover:shadow-[#8B5CF6]/20 transition-all cursor-pointer group card-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[#f5f3ff] font-bold text-lg mb-1 group-hover:text-[#8B5CF6] transition-all">
                      {mix.name}
                    </h3>
                    <p className="text-[#f5f3ff]/50 text-xs">{mix.date}</p>
                  </div>
                  <button className="p-2 hover:bg-[#8B5CF6]/10 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-[#f5f3ff]/50" />
                  </button>
                </div>

                <div className="mb-6 aspect-video bg-[#151020] rounded-lg border border-[#8B5CF6]/15 flex items-center justify-center group-hover:border-[#8B5CF6]/40 group-hover:bg-gradient-to-br group-hover:from-[#8B5CF6]/10 group-hover:to-[#EC4899]/10 transition-all">
                  <Music className="w-12 h-12 text-[#f5f3ff]/20 group-hover:text-[#8B5CF6] group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.6)] transition-all" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#f5f3ff]/75">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{mix.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#f5f3ff]/75">
                      <Music className="w-4 h-4" />
                      <span className="font-medium">{mix.tracks} {t.mixes.tracks}</span>
                    </div>
                  </div>
                  <button className="p-2 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 rounded-lg transition-all hover:scale-110 shadow-md hover:shadow-lg hover:shadow-[#8B5CF6]/30">
                    <Play className="w-4 h-4 text-[#8B5CF6] drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {mixes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/20 rounded-full mb-4 shadow-lg shadow-[#8B5CF6]/20">
                <Music className="w-8 h-8 text-[#8B5CF6] drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
              </div>
              <h3 className="text-[#f5f3ff] font-bold mb-2">{t.mixes.noMixes}</h3>
              <p className="text-[#f5f3ff]/60 text-sm mb-6">{t.mixes.noMixesDescription}</p>
              <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#8B5CF6]/30 hover:shadow-xl hover:shadow-[#8B5CF6]/40 hover:scale-105">
                {t.mixes.newMix}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

