'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Music, Clock, Play, MoreVertical, Plus, Search, X, Edit2, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useRouter } from 'next/navigation';

interface Mix {
  id: string;
  name: string;
  description?: string;
  venue?: string;
  event_date?: string;
  date: string;
  tracks: number;
  duration: string;
  durationSeconds: number;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'opperbeat_mixes';

// Helper functies voor localStorage
const getMixesFromStorage = (): Mix[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading mixes from storage:', e);
    return [];
  }
};

const saveMixesToStorage = (mixes: Mix[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixes));
    // Dispatch event voor andere componenten
    window.dispatchEvent(new Event('mixesUpdated'));
  } catch (e) {
    console.error('Error saving mixes to storage:', e);
  }
};

export default function MixesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMix, setEditingMix] = useState<Mix | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newMixName, setNewMixName] = useState('');
  const [newMixDescription, setNewMixDescription] = useState('');
  const [newMixVenue, setNewMixVenue] = useState('');
  const [newMixEventDate, setNewMixEventDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMixes();
    
    // Luister naar storage events (voor andere tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        fetchMixes();
      }
    };
    
    // Luister naar custom events (voorzelfde tab)
    const handleCustomChange = () => {
      fetchMixes();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mixesUpdated', handleCustomChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mixesUpdated', handleCustomChange);
    };
  }, []);

  const fetchMixes = () => {
    try {
      setLoading(true);
      setError(null);
      const storedMixes = getMixesFromStorage();
      setMixes(storedMixes);
    } catch (err) {
      console.error('Error fetching mixes:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (mixTracks: any[]): { duration: string; durationSeconds: number } => {
    const totalSeconds = mixTracks.reduce((sum, mt) => {
      return sum + (mt.analysis?.duration_seconds || 0);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let durationFormatted = '';
    if (hours > 0) {
      durationFormatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return { duration: durationFormatted, durationSeconds: totalSeconds };
  };

  const handleCreateMix = () => {
    if (!newMixName.trim()) {
      setError('Mix naam is vereist');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const newMix: Mix = {
        id: crypto.randomUUID(),
        name: newMixName.trim(),
        description: newMixDescription.trim() || undefined,
        venue: newMixVenue.trim() || undefined,
        event_date: newMixEventDate || undefined,
        date: formatDate(newMixEventDate || new Date().toISOString()),
        tracks: 0,
        duration: '0:00',
        durationSeconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const currentMixes = getMixesFromStorage();
      const updatedMixes = [newMix, ...currentMixes];
      saveMixesToStorage(updatedMixes);
      setMixes(updatedMixes);

      setShowCreateModal(false);
      setNewMixName('');
      setNewMixDescription('');
      setNewMixVenue('');
      setNewMixEventDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij aanmaken van mix');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMix = () => {
    if (!editingMix || !newMixName.trim()) {
      setError('Mix naam is vereist');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const currentMixes = getMixesFromStorage();
      const updatedMixes = currentMixes.map(mix => {
        if (mix.id === editingMix.id) {
          return {
            ...mix,
            name: newMixName.trim(),
            description: newMixDescription.trim() || undefined,
            venue: newMixVenue.trim() || undefined,
            event_date: newMixEventDate || undefined,
            date: formatDate(newMixEventDate || mix.created_at),
            updated_at: new Date().toISOString(),
          };
        }
        return mix;
      });
      
      saveMixesToStorage(updatedMixes);
      setMixes(updatedMixes);

      setEditingMix(null);
      setNewMixName('');
      setNewMixDescription('');
      setNewMixVenue('');
      setNewMixEventDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij bijwerken van mix');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMix = (id: string) => {
    try {
      const currentMixes = getMixesFromStorage();
      const updatedMixes = currentMixes.filter(mix => mix.id !== id);
      saveMixesToStorage(updatedMixes);
      setMixes(updatedMixes);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen van mix');
    }
  };

  const openEditModal = (mix: Mix) => {
    setEditingMix(mix);
    setNewMixName(mix.name);
    setNewMixDescription(mix.description || '');
    setNewMixVenue(mix.venue || '');
    setNewMixEventDate(mix.event_date || '');
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingMix(null);
    setNewMixName('');
    setNewMixDescription('');
    setNewMixVenue('');
    setNewMixEventDate('');
    setError(null);
  };

  const filteredMixes = mixes.filter((mix) =>
    mix.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-down">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">{t.mixes.title}</h1>
              <p className="text-[var(--text-secondary)] text-sm">{t.mixes.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/mixes/set-builder')}
                className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center button-press hover-scale"
              >
                <Sparkles className="w-4 h-4" />
                Set Builder
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center button-press hover-scale"
              >
                <Plus className="w-4 h-4" />
                {t.mixes.newMix}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={t.mixes.searchMixes}
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
          ) : filteredMixes.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
                <Music className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">{t.mixes.noMixes}</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{t.mixes.noMixesDescription}</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 button-press hover-scale"
              >
                {t.mixes.newMix}
              </button>
            </div>
          ) : (
            /* Mixes Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMixes.map((mix, index) => (
                <div
                  key={mix.id}
                  className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200 cursor-pointer group hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => router.push(`/mixes/${mix.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[var(--text-primary)] font-medium text-base mb-1">
                        {mix.name}
                      </h3>
                      <p className="text-[var(--text-muted)] text-xs">{mix.date}</p>
                      {mix.venue && (
                        <p className="text-[var(--text-secondary)] text-xs mt-1">{mix.venue}</p>
                      )}
                    </div>
                    <div className="relative group">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-2 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200 button-press hover-scale"
                      >
                        <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(mix);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          Bewerken
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(mix.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 aspect-video bg-[var(--background)] rounded-[4px] border border-[var(--border)] flex items-center justify-center transition-colors group-hover:border-[var(--border-hover)]">
                    <Music className="w-12 h-12 text-[var(--text-muted)]" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium mono">{mix.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Music className="w-4 h-4" />
                        <span className="font-medium">{mix.tracks} {t.mixes.tracks}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implementeer mix afspelen
                      }}
                      className="p-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--primary)] rounded-[4px] transition-all duration-200 button-press hover-scale"
                      title="Afspelen"
                    >
                      <Play className="w-4 h-4 text-[var(--primary)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Modal */}
          {(showCreateModal || editingMix) && (
            <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">
                    {editingMix ? 'Mix bewerken' : 'Nieuwe mix'}
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
                      value={newMixName}
                      onChange={(e) => setNewMixName(e.target.value)}
                      placeholder="Bijv. Summer Vibes 2024"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Beschrijving (optioneel)
                    </label>
                    <textarea
                      value={newMixDescription}
                      onChange={(e) => setNewMixDescription(e.target.value)}
                      placeholder="Beschrijf je mix..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Locatie/Venue (optioneel)
                    </label>
                    <input
                      type="text"
                      value={newMixVenue}
                      onChange={(e) => setNewMixVenue(e.target.value)}
                      placeholder="Bijv. Club Paradiso, Amsterdam"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                      Evenement datum (optioneel)
                    </label>
                    <input
                      type="date"
                      value={newMixEventDate}
                      onChange={(e) => setNewMixEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
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
                    onClick={editingMix ? handleUpdateMix : handleCreateMix}
                    disabled={isSaving || !newMixName.trim()}
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
                  <h3 className="text-[var(--text-primary)] font-semibold text-lg">Mix verwijderen?</h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Weet je zeker dat je deze mix wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => handleDeleteMix(deleteConfirm)}
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
