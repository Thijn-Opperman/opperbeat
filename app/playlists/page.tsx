'use client';

import Sidebar from '../components/Sidebar';
import { ListMusic, Plus, Play, Clock, Music, MoreVertical, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function PlaylistsPage() {
  const { t } = useI18n();
  const playlists = [
    { id: 1, name: 'Workout Mix', tracks: 45, duration: '2:34:12', image: null },
    { id: 2, name: 'Chill Vibes', tracks: 32, duration: '1:52:45', image: null },
    { id: 3, name: 'Party Starter', tracks: 58, duration: '3:12:30', image: null },
    { id: 4, name: 'Deep Focus', tracks: 28, duration: '1:45:20', image: null },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">{t.playlists.title}</h1>
              <p className="text-[var(--text-secondary)] text-sm">{t.playlists.subtitle}</p>
            </div>
            <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-[4px] transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" />
              {t.playlists.newPlaylist}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={t.playlists.searchPlaylists}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Playlists List */}
          <div className="space-y-2 sm:space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-[var(--surface)] rounded-[4px] p-3 sm:p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center flex-shrink-0 transition-colors">
                    <ListMusic className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--text-primary)] font-medium text-base mb-1 transition-colors truncate">
                      {playlist.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
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
                    <button className="p-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--primary)] rounded-[4px] transition-colors">
                      <Play className="w-5 h-5 text-[var(--primary)]" />
                    </button>
                    <button className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-colors">
                      <MoreVertical className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {playlists.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
                <ListMusic className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">{t.playlists.noPlaylists}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{t.playlists.noPlaylistsDescription}</p>
              <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-colors">
                {t.playlists.newPlaylist}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

