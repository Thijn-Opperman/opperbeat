'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Music, Search, Filter, X, Loader2, AlertCircle, Play, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';

interface MusicAnalysis {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  duration_formatted: string;
  artwork_public_url: string | null;
  waveform: any | null;
  created_at: string;
}

// Simple waveform visualization component
function WaveformPreview({ waveform }: { waveform: any | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!waveform || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Handle different waveform formats
    let waveformData: number[] = [];
    if (waveform.waveform && Array.isArray(waveform.waveform)) {
      waveformData = waveform.waveform;
    } else if (Array.isArray(waveform)) {
      waveformData = waveform;
    } else {
      return;
    }

    if (waveformData.length === 0) return;

    ctx.clearRect(0, 0, width, height);
    
    // Background - use CSS variable for background color
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#1a1a1a';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Waveform color - use primary color from CSS variables
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#3b82f6';
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1;

    const centerY = height / 2;
    const step = width / waveformData.length;
    const maxValue = Math.max(...waveformData.map(Math.abs));
    const minBarHeight = 0.5; // Minimum bar height in pixels

    // Draw waveform bars - always draw bars, even if small
    for (let i = 0; i < waveformData.length; i++) {
      const value = Math.abs(waveformData[i]);
      const normalizedValue = maxValue > 0 ? value / maxValue : 0;
      const barHeight = Math.max(minBarHeight, (normalizedValue * height) / 2);
      const x = i * step;
      
      // Always draw bars for better visibility
      ctx.fillRect(x, centerY - barHeight, Math.max(1, step - 0.5), barHeight * 2);
    }
  }, [waveform]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={24}
      className="w-full h-full"
    />
  );
}

export default function LibraryPage() {
  const { t } = useI18n();
  const [analyses, setAnalyses] = useState<MusicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bpmFilter, setBpmFilter] = useState('');
  const [keyFilter, setKeyFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const limit = 20;

  const fetchAnalyses = async (resetOffset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = resetOffset ? 0 : offset;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (bpmFilter) {
        params.append('bpm', bpmFilter);
      }
      if (keyFilter) {
        params.append('key', keyFilter);
      }
      if (genreFilter) {
        params.append('genre', genreFilter);
      }

      const response = await fetch(`/api/analyses?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van analyses');
      }

      // Debug: check waveform data
      if (data.data && data.data.length > 0) {
        const withWaveform = data.data.filter((a: any) => a.waveform).length;
        console.log(`📊 Library: ${data.data.length} analyses, ${withWaveform} met waveform`);
      }

      if (resetOffset) {
        setAnalyses(data.data || []);
      } else {
        setAnalyses(prev => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
      setTotal(data.pagination?.total || 0);
      setOffset(currentOffset + (data.data?.length || 0));
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses(true);
  }, [searchQuery, bpmFilter, keyFilter, genreFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setBpmFilter('');
    setKeyFilter('');
    setGenreFilter('');
  };

  const hasActiveFilters = searchQuery || bpmFilter || keyFilter || genreFilter;

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verwijderen');
      }

      // Verwijder uit lijst
      setAnalyses(prev => prev.filter(a => a.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert(err instanceof Error ? err.message : 'Fout bij verwijderen van nummer');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 border-b border-theme animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-primary mb-1">{t.library.title}</h1>
              <p className="text-sm text-secondary">{total > 0 ? `Collection (${total} ${total === 1 ? 'Track' : 'Tracks'})` : 'Collection'}</p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder={t.library.searchMusic}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-surface border border-theme rounded text-primary text-sm placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
              />
            </div>

            {/* BPM Filter */}
            <div className="flex items-center gap-2 bg-surface border border-theme rounded px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-tertiary" />
              <input
                type="number"
                placeholder="BPM"
                value={bpmFilter}
                onChange={(e) => setBpmFilter(e.target.value)}
                className="bg-transparent text-primary placeholder-muted focus:outline-none w-16 text-sm"
              />
            </div>

            {/* Key Filter */}
            <div className="flex items-center gap-2 bg-surface border border-theme rounded px-3 py-1.5">
              <input
                type="text"
                placeholder="Key"
                value={keyFilter}
                onChange={(e) => setKeyFilter(e.target.value)}
                className="bg-transparent text-primary placeholder-muted focus:outline-none w-20 text-sm"
              />
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2 bg-surface border border-theme rounded px-3 py-1.5">
              <input
                type="text"
                placeholder="Genre"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-transparent text-primary placeholder-muted focus:outline-none w-24 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-theme rounded text-primary text-sm hover:bg-surface-hover transition-all duration-200 button-press hover-scale animate-fade-in"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-background">
          {loading && analyses.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              <span className="ml-3 text-primary">{t.library.loading}</span>
            </div>
          ) : error && analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-[var(--error)] mb-4" />
              <h3 className="text-primary font-medium mb-2">{t.library.error}</h3>
              <p className="text-secondary text-sm mb-6">{error}</p>
              <button
                onClick={() => fetchAnalyses(true)}
                className="px-5 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded transition-all duration-200 button-press hover-scale"
              >
                {t.library.retry}
              </button>
            </div>
          ) : analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Music className="w-16 h-16 text-muted mb-4" />
              <h3 className="text-primary font-medium mb-2">{t.library.noMusic}</h3>
              <p className="text-secondary text-sm mb-6">{t.library.noMusicDescription}</p>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded transition-all duration-200 button-press hover-scale"
              >
                <Music className="w-4 h-4" />
                Start Analyse
              </Link>
            </div>
          ) : (
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Table */}
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-background z-10 border-b border-theme">
                  <tr className="text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                    <th className="px-3 py-2 w-12"></th>
                    <th className="px-3 py-2 w-16">Artwork</th>
                    <th className="px-3 py-2 w-32">Preview</th>
                    <th className="px-3 py-2 min-w-[200px]">Track Title</th>
                    <th className="px-3 py-2 min-w-[150px]">Artist</th>
                    <th className="px-3 py-2 min-w-[150px]">Album</th>
                    <th className="px-3 py-2 w-24">Genre</th>
                    <th className="px-3 py-2 w-20 text-right">BPM</th>
                    <th className="px-3 py-2 w-20">Key</th>
                    <th className="px-3 py-2 w-20 text-right">Time</th>
                    <th className="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((analysis, index) => (
                    <tr
                      key={analysis.id}
                      onClick={() => window.location.href = `/analyze?id=${analysis.id}`}
                      className="group cursor-pointer hover:bg-surface transition-all duration-200 border-b border-theme animate-fade-in-up hover-lift"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="px-3 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Play functionality can be added here
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-hover rounded"
                        >
                          <Play className="w-3.5 h-3.5 text-primary" />
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="w-12 h-12 bg-surface border border-theme rounded overflow-hidden flex items-center justify-center">
                          {analysis.artwork_public_url ? (
                            <img
                              src={analysis.artwork_public_url}
                              alt={analysis.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music className="w-6 h-6 text-muted" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="w-32 h-6 bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
                          {analysis.waveform ? (
                            <WaveformPreview waveform={analysis.waveform} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-[var(--text-muted)]">—</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-primary text-sm font-medium truncate group-hover:text-[var(--primary)] transition-colors">
                          {analysis.title || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-secondary text-sm truncate">
                          {analysis.artist || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-secondary text-sm truncate">
                          {analysis.album || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-secondary text-sm truncate">
                          {analysis.genre || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="text-secondary text-sm font-mono">
                          {analysis.bpm ? `${Math.round(analysis.bpm)}` : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-secondary text-sm">
                          {analysis.key || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="text-secondary text-sm font-mono">
                          {analysis.duration_formatted || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: analysis.id, title: analysis.title });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                          title="Verwijderen"
                        >
                          {deletingId === analysis.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Load More */}
              {hasMore && (
                <div className="py-4 text-center border-t border-theme">
                  <button
                    onClick={() => fetchAnalyses(false)}
                    className="px-6 py-2 bg-surface hover:bg-surface-hover border border-theme text-primary text-sm font-medium rounded transition-all duration-200 button-press hover-scale"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-elevated border border-theme rounded-lg p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--error)]/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-[var(--error)]" />
                </div>
                <h3 className="text-primary font-semibold text-lg">Nummer verwijderen?</h3>
              </div>
              <p className="text-secondary text-sm mb-2">
                Weet je zeker dat je <span className="font-medium text-primary">"{deleteConfirm.title}"</span> wilt verwijderen?
              </p>
              <p className="text-tertiary text-xs mb-6">
                Dit nummer en alle bijbehorende bestanden worden permanent verwijderd uit Supabase.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-theme text-primary text-sm font-medium rounded transition-all duration-200 button-press hover-scale"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={deletingId === deleteConfirm.id}
                  className="px-4 py-2 bg-[var(--error)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-all duration-200 button-press hover-scale flex items-center gap-2"
                >
                  {deletingId === deleteConfirm.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verwijderen...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Verwijderen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

