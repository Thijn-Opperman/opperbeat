'use client';

import Sidebar from '../components/Sidebar';
import { ListMusic, Plus, Play, Clock, Music, MoreVertical, Search } from 'lucide-react';

export default function PlaylistsPage() {
  const playlists = [
    { id: 1, name: 'Workout Mix', tracks: 45, duration: '2:34:12', image: null },
    { id: 2, name: 'Chill Vibes', tracks: 32, duration: '1:52:45', image: null },
    { id: 3, name: 'Party Starter', tracks: 58, duration: '3:12:30', image: null },
    { id: 4, name: 'Deep Focus', tracks: 28, duration: '1:45:20', image: null },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 tracking-tight">Playlist Builder</h1>
              <p className="text-[#f5f5f7]/70 text-sm">Creëer en beheer je playlists</p>
            </div>
            <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" />
              Nieuwe Playlist
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#f5f5f7]/40" />
              <input
                type="text"
                placeholder="Zoek playlists..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[#1a1a22] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Playlists List */}
          <div className="space-y-2 sm:space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-[#1a1a22] rounded-xl p-3 sm:p-4 border border-white/8 shadow-lg hover:border-white/12 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#14141a] rounded-lg border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-[#3b82f6]/20 transition-colors">
                    <ListMusic className="w-6 h-6 sm:w-8 sm:h-8 text-[#f5f5f7]/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base mb-1 group-hover:text-[#3b82f6] transition-colors truncate">
                      {playlist.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[#f5f5f7]/60">
                      <div className="flex items-center gap-1.5">
                        <Music className="w-4 h-4" />
                        <span>{playlist.tracks} tracks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{playlist.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 rounded-lg transition-colors">
                      <Play className="w-5 h-5 text-[#3b82f6]" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-[#f5f5f7]/50" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {playlists.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3b82f6]/10 rounded-full mb-4">
                <ListMusic className="w-8 h-8 text-[#3b82f6]" />
              </div>
              <h3 className="text-white font-medium mb-2">Nog geen playlists</h3>
              <p className="text-[#f5f5f7]/60 text-sm mb-6">Maak je eerste playlist aan om te beginnen</p>
              <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md">
                Nieuwe Playlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

