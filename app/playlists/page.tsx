'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ListMusic, Plus, Play, Clock, Music, MoreVertical, Search, X, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: number;
  duration: string;
  durationSeconds: number;
  created_at: string;
  updated_at: string;
}

export default function PlaylistsPage() {
  const { t } = useI18n();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/playlists');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van playlists');
      }

      setPlaylists(data.data || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist naam is vereist');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Toon meer details als beschikbaar
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Fout bij aanmaken van playlist';
        throw new Error(errorMessage);
      }

      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij aanmaken van playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!editingPlaylist || !newPlaylistName.trim()) {
      setError('Playlist naam is vereist');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/playlists/${editingPlaylist.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij bijwerken van playlist');
      }

      setEditingPlaylist(null);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij bijwerken van playlist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verwijderen van playlist');
      }

      setDeleteConfirm(null);
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen van playlist');
    }
  };

  const openEditModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDescription(playlist.description || '');
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingPlaylist(null);
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setError(null);
  };

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-down">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">{t.playlists.title}</h1>
              <p className="text-[var(--text-secondary)] text-sm">{t.playlists.subtitle}</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center button-press hover-scale"
            >
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px] animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                <p className="text-[var(--error)] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <span className="ml-3 text-[var(--text-secondary)]">{t.common.loading || 'Laden...'}</span>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
                <ListMusic className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">{t.playlists.noPlaylists}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{t.playlists.noPlaylistsDescription}</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 button-press hover-scale"
              >
                {t.playlists.newPlaylist}
              </button>
            </div>
          ) : (
            /* Playlists List */
            <div className="space-y-2 sm:space-y-3">
              {filteredPlaylists.map((playlist, index) => (
              <div
                key={playlist.id}
                className="bg-[var(--surface)] rounded-[4px] p-3 sm:p-4 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 cursor-pointer group hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implementeer playlist afspelen
                      }}
                      className="p-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--primary)] rounded-[4px] transition-all duration-200 button-press hover-scale"
                      title="Afspelen"
                    >
                      <Play className="w-5 h-5 text-[var(--primary)]" />
                    </button>
                    <div className="relative group">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Menu wordt getoond via CSS
                        }}
                        className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200 button-press hover-scale"
                      >
                        <MoreVertical className="w-5 h-5 text-[var(--text-tertiary)]" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(playlist);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          Bewerken
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(playlist.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {(showCreateModal || editingPlaylist) && (
            <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">
                    {editingPlaylist ? 'Playlist bewerken' : 'Nieuwe playlist'}
                  </h3>
                  <button
                    onClick={closeModals}
                    className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-[var(--surface)] border border-[var(--error)] rounded-[4px]">
                    <p className="text-[var(--error)] text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Naam *
                    </label>
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Bijv. Workout Mix"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Beschrijving (optioneel)
                    </label>
                    <textarea
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Beschrijf je playlist..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={closeModals}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale disabled:opacity-50"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
                    disabled={isSaving || !newPlaylistName.trim()}
                    className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opslaan...
                      </>
                    ) : (
                      'Opslaan'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[var(--error)]/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-[var(--error)]" />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">Playlist verwijderen?</h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Weet je zeker dat je deze playlist wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(deleteConfirm)}
                    className="px-4 py-2 bg-[var(--error)] hover:opacity-90 text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

