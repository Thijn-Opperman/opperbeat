'use client';

import { useState, useEffect } from 'react';
import { Music, BarChart3, Upload, TrendingUp, Clock, Key, Gauge } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

interface AnalysisData {
  title: string;
  duration: string;
  durationSeconds: number;
  bpm: number | null;
  key: string | null;
  confidence?: {
    bpm: number | null;
    key: number | null;
  };
  metadata: {
    artist: string | null;
    album: string | null;
    genre: string | null;
    bitrate: number | null;
    sampleRate: number | null;
  };
}

export default function MusicAnalysisCard() {
  const { t } = useI18n();
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisData | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    // Functie om data te laden
    const loadData = () => {
      const stored = localStorage.getItem('lastAnalysis');
      if (stored) {
        try {
          setLastAnalysis(JSON.parse(stored));
        } catch (e) {
          console.error('Fout bij het laden van laatste analyse:', e);
        }
      }

      const count = localStorage.getItem('analysisCount');
      setAnalysisCount(count ? parseInt(count, 10) : 0);
    };

    // Laad data bij mount
    loadData();

    // Luister naar storage events (wanneer localStorage verandert in andere tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastAnalysis' || e.key === 'analysisCount') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Luister naar custom events (wanneer localStorage verandert in dezelfde tab)
    const handleCustomStorageChange = () => {
      loadData();
    };

    window.addEventListener('analysisUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('analysisUpdated', handleCustomStorageChange);
    };
  }, []);

  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.home.musicAnalysis}</h3>
        </div>
        <Link
          href="/analyze"
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px] transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 w-full sm:w-auto justify-center button-press hover-scale"
        >
          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {t.home.analyze}
        </Link>
      </div>

      {lastAnalysis ? (
        <div className="space-y-4">
            {/* Laatste Analyse Info */}
          <div className="bg-[var(--background)] rounded-[4px] p-4 border border-[var(--border)] animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-[var(--text-primary)] font-medium text-sm truncate">
                  {lastAnalysis.title}
                </h4>
                {lastAnalysis.metadata.artist && (
                  <p className="text-[var(--text-secondary)] text-xs mt-1 truncate">
                    {lastAnalysis.metadata.artist}
                  </p>
                )}
              </div>
              <div className="text-right ml-3">
                <p className="text-[var(--text-muted)] text-xs">{t.home.lastAnalysis}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* BPM */}
              <div className="bg-[var(--surface)] rounded-[4px] p-3 border border-[var(--border)] hover-scale transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span className="text-[var(--text-secondary)] text-xs font-medium">BPM</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[var(--text-primary)] font-medium text-base mono">
                    {lastAnalysis.bpm || '-'}
                  </span>
                  {lastAnalysis.confidence?.bpm && (
                    <span className="text-[var(--success)] text-xs font-medium bg-[var(--surface)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border)]">
                      {Math.round(lastAnalysis.confidence.bpm * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Key */}
              <div className="bg-[var(--surface)] rounded-[4px] p-3 border border-[var(--border)] hover-scale transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="text-[var(--text-secondary)] text-xs font-medium">Key</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[var(--text-primary)] font-medium text-base mono">
                    {lastAnalysis.key || '-'}
                  </span>
                  {lastAnalysis.confidence?.key && (
                    <span className="text-[var(--success)] text-xs font-medium bg-[var(--surface)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border)]">
                      {Math.round(lastAnalysis.confidence.key * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[var(--text-secondary)] text-xs">{t.analyze.duration}: {lastAnalysis.duration}</span>
            </div>
          </div>

          {/* Statistics */}
          {analysisCount > 0 && (
            <div className="flex items-center justify-between text-sm pt-2">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-medium">{t.home.totalAnalyses}: {analysisCount}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
            <BarChart3 className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 text-sm">{t.home.noAnalyses}</h4>
          <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs mx-auto">
            {t.home.noAnalysesDescription}
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium px-5 py-2.5 rounded-[4px] transition-all duration-200 text-sm button-press hover-scale"
          >
            <Upload className="w-4 h-4" />
            {t.home.startAnalysis}
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="font-medium">{t.home.bpmDetection}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="font-medium">{t.home.keyDetection}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

