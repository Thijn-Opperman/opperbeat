'use client';

import { useState, useEffect } from 'react';
import { Music, BarChart3, Upload, TrendingUp, Clock, Key, Gauge } from 'lucide-react';
import Link from 'next/link';

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
    <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg hover:border-white/12 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3b82f6]/10 rounded-lg">
            <Music className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <h3 className="text-white font-semibold text-base">Muziek Analyse</h3>
        </div>
        <Link
          href="/analyze"
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <Upload className="w-4 h-4" />
          Analyseren
        </Link>
      </div>

      {lastAnalysis ? (
        <div className="space-y-4">
          {/* Laatste Analyse Info */}
          <div className="bg-[#14141a] rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">
                  {lastAnalysis.title}
                </h4>
                {lastAnalysis.metadata.artist && (
                  <p className="text-[#f5f5f7]/60 text-xs mt-1 truncate">
                    {lastAnalysis.metadata.artist}
                  </p>
                )}
              </div>
              <div className="text-right ml-3">
                <p className="text-[#f5f5f7]/50 text-xs">Laatste analyse</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* BPM */}
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="text-[#f5f5f7]/70 text-xs font-medium">BPM</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-lg">
                    {lastAnalysis.bpm || '-'}
                  </span>
                  {lastAnalysis.confidence?.bpm && (
                    <span className="text-[#10b981] text-xs font-medium bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                      {Math.round(lastAnalysis.confidence.bpm * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Key */}
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="text-[#f5f5f7]/70 text-xs font-medium">Key</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-lg">
                    {lastAnalysis.key || '-'}
                  </span>
                  {lastAnalysis.confidence?.key && (
                    <span className="text-[#10b981] text-xs font-medium bg-[#10b981]/10 px-1.5 py-0.5 rounded">
                      {Math.round(lastAnalysis.confidence.key * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              <Clock className="w-3.5 h-3.5 text-[#f5f5f7]/40" />
              <span className="text-[#f5f5f7]/60 text-xs">Duur: {lastAnalysis.duration}</span>
            </div>
          </div>

          {/* Statistics */}
          {analysisCount > 0 && (
            <div className="flex items-center justify-between text-sm pt-2">
              <div className="flex items-center gap-2 text-[#f5f5f7]/70">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Totale analyses: {analysisCount}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3b82f6]/10 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h4 className="text-white font-medium mb-2 text-sm">Nog geen analyses</h4>
          <p className="text-[#f5f5f7]/60 text-sm mb-6 max-w-xs mx-auto">
            Upload en analyseer je eerste muziekbestand om gedetailleerde inzichten te krijgen
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-5 py-2.5 rounded-lg transition-all text-sm shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            Start Analyse
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/8">
        <div className="flex items-center justify-between text-xs text-[#f5f5f7]/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>BPM Detectie</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Key Detectie</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

