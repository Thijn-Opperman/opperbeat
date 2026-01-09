'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import MusicAnalysisCard from './components/MusicAnalysisCard';
import LibraryCard from './components/LibraryCard';
import GenresCard from './components/GenresCard';
import SetLengthCard from './components/SetLengthCard';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { TrendingUp, Clock, User, Download, Music, Key, Gauge, ListMusic, ExternalLink, Play, Search } from 'lucide-react';

function QuickStatsWidget() {
  const [stats, setStats] = useState<{ totalTracks: number; avgBPM: number | null }>({ totalTracks: 0, avgBPM: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, analysesRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/analyses?limit=100'),
        ]);

        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          if (analytics.success) {
            setStats(prev => ({ ...prev, totalTracks: analytics.data.totalTracks || 0 }));
          }
        }

        if (analysesRes.ok) {
          const analyses = await analysesRes.json();
          if (analyses.data && analyses.data.length > 0) {
            const bpms = analyses.data.filter((a: any) => a.bpm).map((a: any) => a.bpm);
            const avgBPM = bpms.length > 0 
              ? Math.round(bpms.reduce((sum: number, bpm: number) => sum + bpm, 0) / bpms.length)
              : null;
            setStats(prev => ({ ...prev, avgBPM }));
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-5">
      <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs">Total Tracks</span>
              {loading ? (
                <span className="text-[var(--text-muted)] text-sm">...</span>
              ) : (
                <span className="text-[var(--text-primary)] font-semibold text-sm">{stats.totalTracks.toLocaleString()}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs">Avg BPM</span>
              {loading ? (
                <span className="text-[var(--text-muted)] text-sm">...</span>
              ) : (
                <span className="text-[var(--text-primary)] font-semibold text-sm">{stats.avgBPM || '-'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivityWidget() {
  const [recent, setRecent] = useState<{ lastAnalysis: string | null; newTracks: number }>({ lastAnalysis: null, newTracks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analyses?limit=10');
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            const latest = result.data[0];
            const lastDate = new Date(latest.created_at);
            const now = new Date();
            const diffHours = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60));
            
            let timeAgo = '';
            if (diffHours < 1) {
              timeAgo = 'Just now';
            } else if (diffHours < 24) {
              timeAgo = `${diffHours}h ago`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              timeAgo = `${diffDays}d ago`;
            }

            // Count tracks added today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayTracks = result.data.filter((a: any) => {
              const created = new Date(a.created_at);
              return created >= today;
            }).length;

            setRecent({
              lastAnalysis: timeAgo,
              newTracks: todayTracks,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-6">
      <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm">Recent</h3>
        </div>
        <div className="space-y-2 flex-1">
          {loading ? (
            <div className="text-[var(--text-muted)] text-xs">Loading...</div>
          ) : (
            <>
              {recent.lastAnalysis && (
                <div className="text-[var(--text-secondary)] text-xs">Last analysis: {recent.lastAnalysis}</div>
              )}
              {recent.newTracks > 0 && (
                <div className="text-[var(--text-secondary)] text-xs">New today: +{recent.newTracks}</div>
              )}
              {!recent.lastAnalysis && recent.newTracks === 0 && (
                <div className="text-[var(--text-muted)] text-xs">No recent activity</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-[var(--background)] border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-primary)]">{t.home.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-secondary)] text-sm w-64">
                <Search className="w-4 h-4" />
                <span>Search...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--text-primary)]" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{user?.name || 'Guest'}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{user?.email || ''}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Widget Grid - Grid layout met verschillende groottes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 auto-rows-min">
            {/* Grote Widget: Music Analysis - 2 kolommen op md, 3 op lg, 4 op xl */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 animate-fade-in-up stagger-1">
              <MusicAnalysisCard />
            </div>

            {/* Medium Widget: Library Insights - 2 kolommen op md, 1 op lg, 2 op xl */}
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 animate-fade-in-up stagger-2">
              <LibraryCard />
            </div>

            {/* Medium Widget: Genres Breakdown - 2 kolommen op md, 1 op lg, 2 op xl */}
            <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 animate-fade-in-up stagger-3">
              <GenresCard />
            </div>

            {/* Kleine Widget: Set Length - 1 kolom op md, 1 op lg, 1 op xl */}
            <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-4">
              <SetLengthCard />
            </div>

            {/* Kleine Widget: Quick Stats */}
            <QuickStatsWidget />

            {/* Kleine Widget: Recent Activity */}
            <RecentActivityWidget />

            {/* Profile Widget */}
            <ProfileWidget />

            {/* Download Widget */}
            <DownloadWidget />

            {/* BPM Matcher Widget */}
            <BPMMatcherWidget />

            {/* Key Matcher Widget */}
            <KeyMatcherWidget />

            {/* Quick Playlist Widget */}
            <QuickPlaylistWidget />

            {/* Spotify Widget */}
            <SpotifyWidget />

            {/* SoundCloud Widget - 2 kolommen op md, 2 op lg, 2 op xl */}
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 animate-fade-in-up stagger-13">
              <SoundCloudWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileWidget() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-7">
      <Link href="/profile" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <User className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Profile</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : (
              <>
                <div className="text-[var(--text-primary)] font-medium text-sm mb-1">
                  {profile?.name || user?.name || 'Guest'}
                </div>
                <div className="text-[var(--text-secondary)] text-xs truncate">
                  {profile?.email || user?.email || 'Not logged in'}
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function DownloadWidget() {
  const [recentTrack, setRecentTrack] = useState<{ id: string; title: string; audio_file_public_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch('/api/analyses?limit=1');
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setRecentTrack(result.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching recent track:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  const handleDownload = () => {
    if (recentTrack?.audio_file_public_url) {
      window.open(recentTrack.audio_file_public_url, '_blank');
    }
  };

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-8">
      <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <Download className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm">Download</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="text-[var(--text-muted)] text-xs">Loading...</div>
          ) : recentTrack ? (
            <>
              <div className="text-[var(--text-secondary)] text-xs mb-2 truncate">{recentTrack.title}</div>
              <button
                onClick={handleDownload}
                disabled={!recentTrack.audio_file_public_url}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-3 py-2 rounded-[4px] transition-all duration-200 text-xs flex items-center justify-center gap-2 button-press hover-scale"
              >
                <Download className="w-3 h-3" />
                Download Latest
              </button>
            </>
          ) : (
            <div className="text-[var(--text-muted)] text-xs">No tracks available</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BPMMatcherWidget() {
  const [lastBPM, setLastBPM] = useState<number | null>(null);
  const [matches, setMatches] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBPMData = async () => {
      try {
        const response = await fetch('/api/analyses?limit=1');
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0 && result.data[0].bpm) {
            const bpm = result.data[0].bpm;
            setLastBPM(bpm);
            
            // Find tracks with similar BPM (±5 BPM)
            const matchesResponse = await fetch(`/api/analyses?limit=100`);
            if (matchesResponse.ok) {
              const matchesResult = await matchesResponse.json();
              const similarTracks = matchesResult.data?.filter((a: any) => 
                a.bpm && Math.abs(a.bpm - bpm) <= 5
              ) || [];
              setMatches(similarTracks.length);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching BPM data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBPMData();
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-9">
      <Link href="/library" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <Gauge className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">BPM Match</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : lastBPM ? (
              <>
                <div className="text-2xl font-bold text-[var(--primary)] mb-1">{lastBPM}</div>
                <div className="text-[var(--text-secondary)] text-xs">BPM</div>
                <div className="text-[var(--text-secondary)] text-xs mt-2">{matches} similar tracks</div>
              </>
            ) : (
              <div className="text-[var(--text-muted)] text-xs">No BPM data</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function KeyMatcherWidget() {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [matches, setMatches] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeyData = async () => {
      try {
        const response = await fetch('/api/analyses?limit=1');
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0 && result.data[0].key) {
            const key = result.data[0].key;
            setLastKey(key);
            
            // Find tracks with same key
            const matchesResponse = await fetch(`/api/analyses?limit=100`);
            if (matchesResponse.ok) {
              const matchesResult = await matchesResponse.json();
              const sameKeyTracks = matchesResult.data?.filter((a: any) => 
                a.key && a.key === key
              ) || [];
              setMatches(sameKeyTracks.length);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching key data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeyData();
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-10">
      <Link href="/library" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <Key className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Key Match</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : lastKey ? (
              <>
                <div className="text-xl font-bold text-[var(--primary)] mb-1">{lastKey}</div>
                <div className="text-[var(--text-secondary)] text-xs mt-2">{matches} tracks</div>
              </>
            ) : (
              <div className="text-[var(--text-muted)] text-xs">No key data</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function QuickPlaylistWidget() {
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; tracks: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists');
        if (response.ok) {
          const result = await response.json();
          setPlaylists(result.data?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-11">
      <Link href="/playlists" className="block h-full">
        <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
              <ListMusic className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Playlists</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-[var(--text-muted)] text-xs">Loading...</div>
            ) : playlists.length > 0 ? (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)] text-xs truncate">{playlist.name}</span>
                    <span className="text-[var(--text-muted)] text-xs">{playlist.tracks}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[var(--text-muted)] text-xs">No playlists</div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function SpotifyWidget() {
  return (
    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1 animate-fade-in-up stagger-12">
      <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#1DB954] border border-[var(--border)] rounded-[4px]">
            <Music className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm">Spotify</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[var(--text-secondary)] text-xs mb-3">Connect your Spotify account to sync playlists and discover new tracks.</div>
          <button className="w-full bg-[#1DB954] hover:opacity-90 text-white font-medium px-3 py-2 rounded-[4px] transition-all duration-200 text-xs flex items-center justify-center gap-2 button-press hover-scale">
            <ExternalLink className="w-3 h-3" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

function SoundCloudWidget() {
  return (
    <div className="animate-fade-in-up stagger-13">
      <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#FF5500] border border-[var(--border)] rounded-[4px]">
            <Play className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm">SoundCloud</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[var(--text-secondary)] text-xs mb-3">Import tracks from SoundCloud and sync your favorite mixes.</div>
          <button className="w-full bg-[#FF5500] hover:opacity-90 text-white font-medium px-3 py-2 rounded-[4px] transition-all duration-200 text-xs flex items-center justify-center gap-2 button-press hover-scale">
            <ExternalLink className="w-3 h-3" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
