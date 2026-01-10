'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Download, Youtube, Music, Search, Loader2, AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

type DownloadSource = 'youtube' | 'soundcloud' | 'search';

export default function DownloadPage() {
  const { t } = useI18n();
  const [source, setSource] = useState<DownloadSource>('youtube');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!input.trim()) {
      setError('Voer een URL of zoekterm in');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          input: input.trim(),
        }),
      });

      // Check if response is OK first
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `Server error: ${response.status} ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.detail || `Fout bij downloaden: ${response.status}`);
      }

      // Check if response is a file (audio/mpeg)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('audio/')) {
        // Response is a file, trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'download.mp3';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadUrl(url);
        setSuccess('Download succesvol gestart!');
      } else {
        // JSON response
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setSuccess('Download succesvol!');
          window.open(data.downloadUrl, '_blank');
        } else {
          setError('Geen download URL ontvangen');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (source) {
      case 'youtube':
        return 'https://www.youtube.com/watch?v=... of zoek op naam';
      case 'soundcloud':
        return 'https://soundcloud.com/... of zoek op naam';
      case 'search':
        return 'Typ artiest en titel (bijv: "Daft Punk - One More Time")';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (source) {
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'soundcloud':
        return <Music className="w-5 h-5" />;
      case 'search':
        return <Search className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <h1 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight text-[var(--text-primary)]">Muziek Downloaden</h1>
            <p className="text-[var(--text-secondary)] text-sm">Download muziek van YouTube, SoundCloud of zoek op naam in 320 kbps kwaliteit</p>
          </div>

          <div className="bg-[var(--surface)] rounded-[4px] p-6 border border-[var(--border)] animate-fade-in-up">
            {/* Source Selection */}
            <div className="mb-6">
              <label className="block text-[var(--text-primary)] text-sm font-medium mb-3">
                Selecteer bron
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setSource('youtube');
                    setInput('');
                    setError(null);
                  }}
                  className={`p-4 rounded-[4px] border-2 transition-all duration-200 flex items-center gap-3 ${
                    source === 'youtube'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <Youtube className={`w-5 h-5 ${source === 'youtube' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} />
                  <span className={`font-medium ${source === 'youtube' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                    YouTube
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSource('soundcloud');
                    setInput('');
                    setError(null);
                  }}
                  className={`p-4 rounded-[4px] border-2 transition-all duration-200 flex items-center gap-3 ${
                    source === 'soundcloud'
                      ? 'border-[#FF5500] bg-[#FF5500]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <Music className={`w-5 h-5 ${source === 'soundcloud' ? 'text-[#FF5500]' : 'text-[var(--text-secondary)]'}`} />
                  <span className={`font-medium ${source === 'soundcloud' ? 'text-[#FF5500]' : 'text-[var(--text-secondary)]'}`}>
                    SoundCloud
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSource('search');
                    setInput('');
                    setError(null);
                  }}
                  className={`p-4 rounded-[4px] border-2 transition-all duration-200 flex items-center gap-3 ${
                    source === 'search'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <Search className={`w-5 h-5 ${source === 'search' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                  <span className={`font-medium ${source === 'search' ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                    Zoeken
                  </span>
                </button>
              </div>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                {source === 'search' ? 'Zoekterm' : 'URL of Zoekterm'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {getIcon()}
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholder()}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleDownload();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Quality Info */}
            <div className="mb-6 p-4 bg-[var(--background)] border border-[var(--border)] rounded-[4px]">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                <span>Downloads worden geconverteerd naar <strong>320 kbps MP3</strong> kwaliteit</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-[4px] animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                  <p className="text-[var(--error)] text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-[var(--success)]/10 border border-[var(--success)] rounded-[4px] animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                  <p className="text-[var(--success)] text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || !input.trim()}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-[4px] transition-all duration-200 flex items-center justify-center gap-2 button-press hover-scale"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Downloaden...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download (320 kbps)</span>
                </>
              )}
            </button>

            {/* Download Link (if available) */}
            {downloadUrl && (
              <div className="mt-4 p-4 bg-[var(--background)] border border-[var(--border)] rounded-[4px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-secondary)] text-sm">Download link:</span>
                  </div>
                  <a
                    href={downloadUrl}
                    download
                    className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium"
                  >
                    Download opnieuw
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 p-6 bg-[var(--surface)] rounded-[4px] border border-[var(--border)]">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-3">Hoe werkt het?</h3>
            <div className="space-y-2 text-[var(--text-secondary)] text-sm">
              <p><strong>YouTube:</strong> Plak een YouTube URL of zoek op nummer naam</p>
              <p><strong>SoundCloud:</strong> Plak een SoundCloud URL of zoek op nummer naam</p>
              <p><strong>Zoeken:</strong> Typ artiest en titel (bijv: "Daft Punk - One More Time")</p>
              <p className="mt-4 text-[var(--text-muted)] text-xs">
                Alle downloads worden automatisch geconverteerd naar 320 kbps MP3 kwaliteit voor optimale geluidskwaliteit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

