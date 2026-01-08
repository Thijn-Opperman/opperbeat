'use client';

import Sidebar from '../components/Sidebar';
import { Music, Clock, Play, MoreVertical, Plus, Search } from 'lucide-react';

export default function MixesPage() {
  const mixes = [
    { id: 1, name: 'Summer Vibes 2024', duration: '1:23:45', tracks: 24, date: '15 jan 2024' },
    { id: 2, name: 'Deep House Session', duration: '2:15:30', tracks: 38, date: '12 jan 2024' },
    { id: 3, name: 'Techno Night Mix', duration: '3:42:12', tracks: 52, date: '8 jan 2024' },
    { id: 4, name: 'Chillout Lounge', duration: '1:45:20', tracks: 28, date: '5 jan 2024' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 tracking-tight">Mixes & Sets</h1>
              <p className="text-[#f5f5f7]/70 text-sm">Beheer en organiseer je DJ mixes en sets</p>
            </div>
            <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" />
              Nieuwe Mix
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#f5f5f7]/40" />
              <input
                type="text"
                placeholder="Zoek mixes..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#1a1a22] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Mixes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mixes.map((mix) => (
              <div
                key={mix.id}
                className="bg-[#1a1a22] rounded-xl p-4 sm:p-6 border border-white/8 shadow-lg hover:border-white/12 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-[#3b82f6] transition-colors">
                      {mix.name}
                    </h3>
                    <p className="text-[#f5f5f7]/50 text-xs">{mix.date}</p>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-[#f5f5f7]/50" />
                  </button>
                </div>

                <div className="mb-6 aspect-video bg-[#14141a] rounded-lg border border-white/5 flex items-center justify-center group-hover:border-[#3b82f6]/20 transition-colors">
                  <Music className="w-12 h-12 text-[#f5f5f7]/20" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#f5f5f7]/70">
                      <Clock className="w-4 h-4" />
                      <span>{mix.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#f5f5f7]/70">
                      <Music className="w-4 h-4" />
                      <span>{mix.tracks} tracks</span>
                    </div>
                  </div>
                  <button className="p-2 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 rounded-lg transition-colors">
                    <Play className="w-4 h-4 text-[#3b82f6]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {mixes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3b82f6]/10 rounded-full mb-4">
                <Music className="w-8 h-8 text-[#3b82f6]" />
              </div>
              <h3 className="text-white font-medium mb-2">Nog geen mixes</h3>
              <p className="text-[#f5f5f7]/60 text-sm mb-6">Maak je eerste mix aan om te beginnen</p>
              <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md">
                Nieuwe Mix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

