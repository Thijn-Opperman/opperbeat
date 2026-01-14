'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import TagSuggestionsWidget from '../components/TagSuggestionsWidget';
import CuePointsWidget from '../components/CuePointsWidget';
import { Music, Search, Filter, X, Loader2, AlertCircle, Play, Trash2, Sparkles, Tag, Edit2, Check, Plus, ListMusic, Clock, Folder, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MusicAnalysis, WaveformData, isWaveformObject } from '@/lib/types';
import { PAGINATION } from '@/lib/constants';
import { saveTrackTags, getTrackTags, type TrackTags } from '@/lib/tag-helpers';
import { saveTrackCuePoints, getTrackCuePoints, updateCuePoint, deleteCuePoint } from '@/lib/cue-helpers';
import { getFolders, addFolder, setPlaylistFolder, getPlaylistFolderMap, getExpandedFolders, setExpandedFolders as saveExpandedFolders } from '@/lib/folder-helpers';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SETS_STORAGE_KEY = 'opperbeat_sets';

interface SetData {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  tracks: Array<{
    trackId: string;
    track?: {
      title: string;
      artist?: string | null;
      genre?: string | null;
      duration_formatted: string;
      duration_seconds: number;
      bpm?: number | null;
      artwork_public_url?: string | null;
    };
    startTime: number;
    bpm: number;
  }>;
}

const getSetsFromStorage = (): SetData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

// Simple waveform visualization component
function WaveformPreview({ waveform }: { waveform: WaveformData | null }) {
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
    if (isWaveformObject(waveform)) {
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
  const router = useRouter();
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
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingCueId, setEditingCueId] = useState<{ trackId: string; cueId: string } | null>(null);
  const [editingCueTime, setEditingCueTime] = useState<string>('');
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; tracks: number; duration: string; folderId?: string }>>([]);
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [playlistFolderMap, setPlaylistFolderMap] = useState<Map<string, string>>(new Map()); // playlistId -> folderId
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);
  const [draggingTrackId, setDraggingTrackId] = useState<string | null>(null);
  const [dragOverPlaylistId, setDragOverPlaylistId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Array<{ id?: string; title?: string; artist?: string; album?: string; genre?: string; duration?: string; durationSeconds?: number; bpm?: number; key?: string; artwork?: string; waveform?: any }>>([]);
  const [loadingPlaylistTracks, setLoadingPlaylistTracks] = useState(false);
  const [deletingPlaylistTrackId, setDeletingPlaylistTrackId] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [setTracks, setSetTracks] = useState<Array<{ id?: string; title?: string; artist?: string; album?: string; genre?: string; duration?: string; durationSeconds?: number; bpm?: number; key?: string; artwork?: string; waveform?: any }>>([]);
  const [loadingSetTracks, setLoadingSetTracks] = useState(false);
  const [deletingSetTrackId, setDeletingSetTrackId] = useState<string | null>(null);
  const [sets, setSets] = useState<Array<{ id: string; name: string; tracks: number; duration: string }>>([]);
  const limit = PAGINATION.LIBRARY_PAGE_LIMIT;

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
        const withWaveform = data.data.filter((a: MusicAnalysis) => a.waveform).length;
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

  useEffect(() => {
    fetchPlaylists();
    fetchSets();
    // Load folders from localStorage
    const folderData = getFolders();
    setFolders(folderData);
    
    // Load playlist folder mapping
    const mapping = getPlaylistFolderMap();
    setPlaylistFolderMap(new Map(Object.entries(mapping)));
    
    // Load expanded folders
    const expanded = getExpandedFolders();
    setExpandedFolders(new Set(expanded));
  }, []);

  const fetchSets = () => {
    try {
      const storedSets = getSetsFromStorage();
      const setsWithStats = storedSets.map((set) => {
        const totalDuration = set.tracks.reduce((sum, item) => sum + (item.track?.duration_seconds || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = totalDuration % 60;
        let durationFormatted = '';
        if (hours > 0) {
          durationFormatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        return {
          id: set.id,
          name: set.name,
          tracks: set.tracks.length,
          duration: durationFormatted,
        };
      });
      setSets(setsWithStats);
    } catch (err) {
      console.error('Error fetching sets:', err);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      const data = await response.json();
      if (response.ok) {
        setPlaylists(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const fetchPlaylistTracks = async (playlistId: string) => {
    setLoadingPlaylistTracks(true);
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();
      if (response.ok && data.data) {
        setPlaylistTracks(data.data.tracks || []);
        setSelectedPlaylistId(playlistId);
      } else {
        setError(data.error || 'Fout bij ophalen van tracks');
      }
    } catch (err) {
      console.error('Error fetching playlist tracks:', err);
      setError('Fout bij ophalen van tracks');
    } finally {
      setLoadingPlaylistTracks(false);
    }
  };

  const handlePlaylistClick = (playlistId: string, e: React.MouseEvent) => {
    // Don't trigger click when dragging
    if (draggingTrackId) return;
    e.stopPropagation();
    fetchPlaylistTracks(playlistId);
  };

  const fetchSetTracks = (setId: string) => {
    try {
      setLoadingSetTracks(true);
      const storedSets = getSetsFromStorage();
      const foundSet = storedSets.find(s => s.id === setId);
      
      if (foundSet) {
        const tracks = (foundSet.tracks || []).map((item) => ({
          id: item.trackId,
          title: item.track?.title || 'Unknown',
          artist: item.track?.artist || undefined,
          album: undefined, // Sets don't store album
          genre: item.track?.genre || undefined,
          duration: item.track?.duration_formatted,
          durationSeconds: item.track?.duration_seconds,
          bpm: item.track?.bpm || item.bpm,
          key: undefined, // Sets don't store key separately
          artwork: item.track?.artwork_public_url || undefined,
          waveform: undefined, // Sets don't have waveform data
        }));
        setSetTracks(tracks);
        setSelectedSetId(setId);
      } else {
        setError('Set niet gevonden');
      }
    } catch (err) {
      console.error('Error fetching set tracks:', err);
      setError('Fout bij ophalen van set tracks');
    } finally {
      setLoadingSetTracks(false);
    }
  };

  const handleSetClick = (setId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    fetchSetTracks(setId);
  };

  const handleDeleteSetTrack = (trackId: string) => {
    if (!selectedSetId) return;
    
    try {
      setDeletingSetTrackId(trackId);
      const storedSets = getSetsFromStorage();
      const setIndex = storedSets.findIndex(s => s.id === selectedSetId);
      
      if (setIndex === -1) {
        throw new Error('Set niet gevonden');
      }
      
      const updatedSet = {
        ...storedSets[setIndex],
        tracks: storedSets[setIndex].tracks.filter(t => t.trackId !== trackId),
        updated_at: new Date().toISOString(),
      };
      
      storedSets[setIndex] = updatedSet;
      localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify(storedSets));
      
      // Refresh set tracks
      fetchSetTracks(selectedSetId);
      // Refresh sets list to update track counts
      fetchSets();
    } catch (err) {
      console.error('Error deleting track from set:', err);
      alert(err instanceof Error ? err.message : 'Fout bij verwijderen van track');
    } finally {
      setDeletingSetTrackId(null);
    }
  };

  const handleDeletePlaylistTrack = async (trackId: string) => {
    if (!selectedPlaylistId) return;
    
    try {
      setDeletingPlaylistTrackId(trackId);
      const response = await fetch(`/api/playlists/${selectedPlaylistId}/tracks?trackId=${trackId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij verwijderen');
      }

      // Refresh playlist tracks
      await fetchPlaylistTracks(selectedPlaylistId);
      // Refresh playlists to update track counts
      await fetchPlaylists();
    } catch (err) {
      console.error('Error deleting track from playlist:', err);
      alert(err instanceof Error ? err.message : 'Fout bij verwijderen van track');
    } finally {
      setDeletingPlaylistTrackId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setBpmFilter('');
    setKeyFilter('');
    setGenreFilter('');
  };

  const hasActiveFilters = searchQuery || bpmFilter || keyFilter || genreFilter;

  const toggleRow = (trackId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeString: string): number | null => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  };

  const getCueTypeColor = (type: string) => {
    switch (type) {
      case 'intro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'drop':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'outro':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getCueTypeLabel = (type: string) => {
    switch (type) {
      case 'intro':
        return 'Intro';
      case 'drop':
        return 'Drop';
      case 'outro':
        return 'Outro';
      default:
        return 'Custom';
    }
  };

  const handleUpdateCuePoint = (trackId: string, cueId: string, newTime: number) => {
    updateCuePoint(trackId, cueId, { time: newTime });
    setEditingCueId(null);
    setEditingCueTime('');
  };

  const handleDeleteCuePoint = (trackId: string, cueId: string) => {
    deleteCuePoint(trackId, cueId);
  };

  const handleUpdateTag = (trackId: string, field: keyof TrackTags, value: any) => {
    const currentTags = getTrackTags(trackId);
    if (!currentTags) return;
    
    const updatedTags: TrackTags = {
      ...currentTags.tags,
      [field]: value,
    };
    
    saveTrackTags(trackId, updatedTags, currentTags.confirmed);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist naam is vereist');
      return;
    }

    try {
      setIsSavingPlaylist(true);
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
        throw new Error(data.error || 'Fout bij aanmaken van playlist');
      }

      setShowCreatePlaylistModal(false);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij aanmaken van playlist');
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    setDraggingTrackId(trackId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', trackId);
  };

  const handleDragEnd = () => {
    setDraggingTrackId(null);
    setDragOverPlaylistId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPlaylistId(playlistId);
  };

  const handleDragLeave = () => {
    setDragOverPlaylistId(null);
  };

  const handleDrop = async (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    setDragOverPlaylistId(null);
    
    const trackId = e.dataTransfer.getData('text/plain');
    if (!trackId) return;

    try {
      const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: trackId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij toevoegen aan playlist');
      }

      // Refresh playlists to update track counts
      await fetchPlaylists();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij toevoegen aan playlist');
    } finally {
      setDraggingTrackId(null);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      setError('Folder naam is vereist');
      return;
    }
    const newFolder = addFolder(newFolderName.trim());
    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      // Save to localStorage
      saveExpandedFolders(Array.from(newSet));
      return newSet;
    });
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);
    
    const playlistId = e.dataTransfer.getData('text/plain');
    if (!playlistId || playlistId.startsWith('track-')) return; // Only playlists, not tracks
    
    // Save to localStorage
    setPlaylistFolder(playlistId, folderId);
    
    setPlaylistFolderMap(prev => {
      const newMap = new Map(prev);
      newMap.set(playlistId, folderId);
      return newMap;
    });
  };

  const handlePlaylistDragStart = (e: React.DragEvent, playlistId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', playlistId);
  };

  const processAllTracks = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      // Haal alle tracks op (zonder filters, met hoge limit)
      const response = await fetch('/api/analyses?limit=1000');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van tracks');
      }
      
      const allTracks = data.data || [];
      if (allTracks.length === 0) {
        alert('Geen tracks gevonden om te verwerken');
        return;
      }
      
      setProcessingProgress({ current: 0, total: allTracks.length });
      
      let successCount = 0;
      let errorCount = 0;
      
      // Verwerk elke track
      for (let i = 0; i < allTracks.length; i++) {
        const track = allTracks[i];
        setProcessingProgress({ current: i + 1, total: allTracks.length });
        
        try {
          // Generate tag suggestions
          if (track.title) {
            try {
              const tagResponse = await fetch('/api/tags/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  trackId: track.id,
                  title: track.title,
                  artist: track.artist,
                  album: track.album,
                  genre: track.genre,
                  bpm: track.bpm,
                  key: track.key,
                  duration: track.duration,
                }),
              });
              
              if (tagResponse.ok) {
                const tagResult = await tagResponse.json();
                saveTrackTags(track.id, tagResult.suggestions, false);
              }
            } catch (tagError) {
              console.error(`Error generating tags for track ${track.id}:`, tagError);
            }
          }
          
          // Generate cue points
          if (track.duration_seconds || track.duration) {
            try {
              const duration = track.duration_seconds || track.duration;
              const cueResponse = await fetch('/api/cue-points/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  trackId: track.id,
                  duration: duration,
                  bpm: track.bpm,
                  waveform: track.waveform,
                }),
              });
              
              if (cueResponse.ok) {
                const cueResult = await cueResponse.json();
                saveTrackCuePoints(track.id, duration, cueResult.cuePoints || []);
              }
            } catch (cueError) {
              console.error(`Error generating cue points for track ${track.id}:`, cueError);
            }
          }
          
          successCount++;
          
          // Kleine delay om server niet te overbelasten
          if (i < allTracks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error(`Error processing track ${track.id}:`, err);
          errorCount++;
        }
      }
      
      alert(`Verwerking voltooid!\n${successCount} tracks verwerkt${errorCount > 0 ? `\n${errorCount} fouten` : ''}`);
      
      // Refresh widgets door pagina te reloaden (widgets refreshen automatisch)
      window.location.reload();
    } catch (err) {
      console.error('Error processing all tracks:', err);
      setError(err instanceof Error ? err.message : 'Fout bij verwerken van tracks');
      alert(err instanceof Error ? err.message : 'Fout bij verwerken van tracks');
    } finally {
      setProcessing(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

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
      {/* Playlists Sidebar */}
      <div className="w-64 border-r border-theme bg-surface flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-theme">
          <h2 className="text-sm font-semibold text-primary">Playlists</h2>
        </div>
        <div className="px-2 py-2 border-b border-theme flex gap-2">
          <button
            onClick={() => setShowCreatePlaylistModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:opacity-90 text-white text-xs font-medium rounded transition-all duration-200 button-press hover-scale"
          >
            <Plus className="w-3 h-3" />
            <ListMusic className="w-3 h-3" />
            Playlist
          </button>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-theme text-primary text-xs font-medium rounded transition-all duration-200 button-press hover-scale"
          >
            <Plus className="w-3 h-3" />
            <Folder className="w-3 h-3" />
            Map
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Render folders with their playlists */}
          {folders.map((folder) => {
            const folderPlaylists = playlists.filter((p) => playlistFolderMap.get(p.id) === folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            
            return (
              <div key={folder.id} className="space-y-1">
                {/* Folder header */}
                <div
                  onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  className={`p-2 rounded border transition-all duration-200 ${
                    dragOverFolderId === folder.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-theme bg-background'
                  }`}
                >
                  <div
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-surface-hover rounded p-1 -m-1 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    )}
                    <Folder className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    <h3 className="text-sm font-medium text-primary truncate flex-1">{folder.name}</h3>
                    <span className="text-xs text-secondary">{folderPlaylists.length}</span>
                  </div>
                </div>
                {/* Playlists within folder */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {folderPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        draggable
                        onDragStart={(e) => handlePlaylistDragStart(e, playlist.id)}
                        onDragOver={(e) => handleDragOver(e, playlist.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, playlist.id)}
                        onClick={(e) => handlePlaylistClick(playlist.id, e)}
                        className={`p-2 rounded border transition-all duration-200 cursor-pointer ${
                          dragOverPlaylistId === playlist.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                            : 'border-theme bg-background hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <ListMusic className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                          <h3 className="text-xs font-medium text-primary truncate">{playlist.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-secondary ml-5">
                          <div className="flex items-center gap-1">
                            <Music className="w-2.5 h-2.5" />
                            <span>{playlist.tracks}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{playlist.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {folderPlaylists.length === 0 && (
                      <div className="text-center py-2 text-secondary text-xs ml-4">
                        Lege map
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render playlists without folder */}
          {playlists
            .filter((p) => !playlistFolderMap.has(p.id))
            .map((playlist) => (
              <div
                key={playlist.id}
                draggable
                onDragStart={(e) => handlePlaylistDragStart(e, playlist.id)}
                onDragOver={(e) => handleDragOver(e, playlist.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, playlist.id)}
                onClick={(e) => handlePlaylistClick(playlist.id, e)}
                className={`p-3 rounded border transition-all duration-200 cursor-pointer ${
                  dragOverPlaylistId === playlist.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-theme bg-background hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ListMusic className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                  <h3 className="text-sm font-medium text-primary truncate">{playlist.name}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary mt-1">
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>{playlist.tracks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{playlist.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          
          {/* Empty state for playlists */}
          {playlists.length === 0 && folders.length === 0 && (
            <div className="text-center py-8 text-secondary text-sm">
              Geen playlists
            </div>
          )}
          
          {/* Sets section */}
          {sets.length > 0 && (
            <>
              <div className="px-2 pt-4 pb-2 border-t border-theme mt-4">
                <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider">Sets</h2>
              </div>
              {sets.map((set) => (
                <div
                  key={set.id}
                  onClick={(e) => handleSetClick(set.id, e)}
                  className="p-3 rounded border border-theme bg-background hover:bg-surface-hover transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                    <h3 className="text-sm font-medium text-primary truncate">{set.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-secondary mt-1">
                    <div className="flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>{set.tracks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{set.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-3 border-b border-theme animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {(selectedPlaylistId || selectedSetId) && (
                <button
                  onClick={() => {
                    setSelectedPlaylistId(null);
                    setPlaylistTracks([]);
                    setSelectedSetId(null);
                    setSetTracks([]);
                  }}
                  className="p-2 hover:bg-surface-hover rounded transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-primary mb-1">
                  {selectedPlaylistId 
                    ? playlists.find(p => p.id === selectedPlaylistId)?.name || 'Playlist'
                    : selectedSetId
                    ? sets.find(s => s.id === selectedSetId)?.name || 'Set'
                    : t.library.title
                  }
                </h1>
                <p className="text-sm text-secondary">
                  {selectedPlaylistId
                    ? `${playlistTracks.length} ${playlistTracks.length === 1 ? 'Track' : 'Tracks'}`
                    : selectedSetId
                    ? `${setTracks.length} ${setTracks.length === 1 ? 'Track' : 'Tracks'}`
                    : total > 0 ? `Collection (${total} ${total === 1 ? 'Track' : 'Tracks'})` : 'Collection'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar - Only show when not viewing playlist or set */}
          {!selectedPlaylistId && !selectedSetId && (
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
          )}

        </div>

        {/* Widgets Section - Only show when not viewing playlist or set */}
        {!selectedPlaylistId && !selectedSetId && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-theme">
          <div className="flex flex-col gap-4">
            {/* Bulk Process Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary font-semibold text-sm mb-1">Bulk Processing</h3>
                <p className="text-secondary text-xs">
                  Genereer tag suggestions en cue points voor alle nummers in je library
                </p>
              </div>
              <button
                onClick={processAllTracks}
                disabled={processing || total === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-all duration-200 button-press hover-scale"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Verwerken... ({processingProgress.current}/{processingProgress.total})
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process All Tracks</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Widgets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <TagSuggestionsWidget />
              <CuePointsWidget />
            </div>
          </div>
        </div>
        )}

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-background">
          {(selectedPlaylistId || selectedSetId) ? (
            // Playlist or Set tracks view
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              {loadingPlaylistTracks || loadingSetTracks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  <span className="ml-3 text-primary">Tracks laden...</span>
                </div>
              ) : (selectedPlaylistId ? playlistTracks : setTracks).length > 0 ? (
                <div className="px-4 sm:px-6 lg:px-8">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-background z-10 border-b border-theme">
                      <tr className="text-left text-xs font-medium text-tertiary uppercase tracking-wider">
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
                      {(selectedPlaylistId ? playlistTracks : setTracks).map((track, index) => (
                        <tr
                          key={track.id || index}
                          className="group hover:bg-surface transition-all duration-200 border-b border-theme"
                        >
                          <td className="px-3 py-2">
                            <div className="w-12 h-12 bg-surface border border-theme rounded overflow-hidden flex items-center justify-center">
                              {track.artwork ? (
                                <img
                                  src={track.artwork}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-6 h-6 text-muted" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="w-32 h-6 bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
                              {track.waveform ? (
                                <WaveformPreview waveform={track.waveform} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-xs text-[var(--text-muted)]">—</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-primary text-sm font-medium truncate group-hover:text-[var(--primary)] transition-colors">
                              {track.title || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-secondary text-sm truncate">
                              {track.artist || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-secondary text-sm truncate">
                              {track.album || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-secondary text-sm truncate">
                              {track.genre || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="text-secondary text-sm">
                              {track.bpm || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-secondary text-sm">
                              {track.key || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="text-secondary text-sm">
                              {track.duration || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (track.id) {
                                  if (selectedPlaylistId) {
                                    handleDeletePlaylistTrack(track.id);
                                  } else if (selectedSetId) {
                                    handleDeleteSetTrack(track.id);
                                  }
                                }
                              }}
                              disabled={(selectedPlaylistId ? deletingPlaylistTrackId : deletingSetTrackId) === track.id}
                              className="p-1.5 hover:bg-surface-hover rounded transition-colors text-secondary hover:text-[var(--error)] disabled:opacity-50"
                              title={selectedPlaylistId ? "Verwijder uit playlist" : "Verwijder uit set"}
                            >
                              {(selectedPlaylistId ? deletingPlaylistTrackId : deletingSetTrackId) === track.id ? (
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <ListMusic className="w-16 h-16 text-muted mb-4" />
                  <h3 className="text-primary font-medium mb-2">Geen tracks</h3>
                  <p className="text-secondary text-sm">
                    {selectedPlaylistId ? 'Deze playlist bevat nog geen tracks' : 'Deze set bevat nog geen tracks'}
                  </p>
                </div>
              )}
            </div>
          ) : loading && analyses.length === 0 ? (
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
                  {analyses.map((analysis, index) => {
                    const isExpanded = expandedRows.has(analysis.id);
                    const trackTags = getTrackTags(analysis.id);
                    const trackCuePoints = getTrackCuePoints(analysis.id);

                    return (
                      <React.Fragment key={analysis.id}>
                        <tr
                          key={analysis.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, analysis.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => toggleRow(analysis.id)}
                          className={`group cursor-pointer hover:bg-surface transition-all duration-200 border-b border-theme animate-fade-in-up hover-lift ${
                            draggingTrackId === analysis.id ? 'opacity-50' : ''
                          }`}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[var(--primary)]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                              )}
                            </div>
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
                        {isExpanded && (
                          <tr className="border-b border-theme bg-surface/50">
                            <td colSpan={11} className="px-3 py-4">
                              <div className="space-y-4">
                                {/* Waveform with Cue Points */}
                                <div className="space-y-2">
                                  <div className="w-full h-16 bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
                                    {analysis.waveform ? (
                                      <WaveformPreview waveform={analysis.waveform} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xs text-[var(--text-muted)]">No waveform</span>
                                      </div>
                                    )}
                                  </div>
                                  {trackCuePoints && trackCuePoints.cuePoints.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {trackCuePoints.cuePoints.map((cue) => {
                                        const isEditing = editingCueId?.trackId === analysis.id && editingCueId?.cueId === cue.id;
                                        return (
                                          <div
                                            key={cue.id}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${getCueTypeColor(cue.type)}`}
                                          >
                                            {isEditing ? (
                                              <>
                                                <input
                                                  type="text"
                                                  value={editingCueTime || formatTime(cue.time)}
                                                  onChange={(e) => {
                                                    setEditingCueTime(e.target.value);
                                                    const parsed = parseTimeInput(e.target.value);
                                                    if (parsed !== null && trackCuePoints) {
                                                      const updated = trackCuePoints.cuePoints.map(c =>
                                                        c.id === cue.id ? { ...c, time: parsed } : c
                                                      ).sort((a, b) => a.time - b.time);
                                                      saveTrackCuePoints(analysis.id, trackCuePoints.duration, updated);
                                                    }
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="w-16 px-1.5 py-0.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded text-primary text-xs"
                                                  placeholder="M:SS"
                                                />
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const parsed = parseTimeInput(editingCueTime);
                                                    if (parsed !== null) {
                                                      handleUpdateCuePoint(analysis.id, cue.id, parsed);
                                                    }
                                                  }}
                                                  className="p-0.5 hover:bg-[var(--surface-hover)] rounded"
                                                >
                                                  <Check className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCueId(null);
                                                    setEditingCueTime('');
                                                  }}
                                                  className="p-0.5 hover:bg-[var(--surface-hover)] rounded"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </>
                                            ) : (
                                              <>
                                                <span>{getCueTypeLabel(cue.type)} {formatTime(cue.time)}</span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCueId({ trackId: analysis.id, cueId: cue.id });
                                                    setEditingCueTime(formatTime(cue.time));
                                                  }}
                                                  className="p-0.5 hover:bg-[var(--surface-hover)] rounded ml-1"
                                                  title="Edit time"
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCuePoint(analysis.id, cue.id);
                                                  }}
                                                  className="p-0.5 hover:bg-red-500/20 rounded ml-0.5"
                                                  title="Delete"
                                                >
                                                  <X className="w-3 h-3 text-red-400" />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-[var(--text-muted)]">No cue points available</div>
                                  )}
                                </div>

                                {/* Tags */}
                                {trackTags && (
                                  <div className="space-y-3 border-t border-theme pt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Tag className="w-4 h-4 text-[var(--primary)]" />
                                      <h4 className="text-sm font-medium text-primary">Tags</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* Energy */}
                                      <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-muted)]">Energy</label>
                                        <select
                                          value={trackTags.tags.energy || ''}
                                          onChange={(e) => handleUpdateTag(analysis.id, 'energy', e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-primary focus:outline-none focus:border-[var(--primary)]"
                                        >
                                          <option value="">Select energy</option>
                                          <option value="low">Low</option>
                                          <option value="medium">Medium</option>
                                          <option value="high">High</option>
                                        </select>
                                      </div>

                                      {/* Mood */}
                                      <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-muted)]">Mood</label>
                                        <select
                                          value={trackTags.tags.mood || ''}
                                          onChange={(e) => handleUpdateTag(analysis.id, 'mood', e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-primary focus:outline-none focus:border-[var(--primary)]"
                                        >
                                          <option value="">Select mood</option>
                                          <option value="neutral">Neutral</option>
                                          <option value="energetic">Energetic</option>
                                          <option value="chill">Chill</option>
                                          <option value="melancholic">Melancholic</option>
                                          <option value="uplifting">Uplifting</option>
                                          <option value="aggressive">Aggressive</option>
                                        </select>
                                      </div>

                                      {/* Vocal Type */}
                                      <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-muted)]">Vocal Type</label>
                                        <select
                                          value={trackTags.tags.vocalType || ''}
                                          onChange={(e) => handleUpdateTag(analysis.id, 'vocalType', e.target.value as 'vocal' | 'instrumental' | 'mixed')}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-primary focus:outline-none focus:border-[var(--primary)]"
                                        >
                                          <option value="">Select vocal type</option>
                                          <option value="vocal">Vocal</option>
                                          <option value="instrumental">Instrumental</option>
                                          <option value="mixed">Mixed</option>
                                        </select>
                                      </div>

                                      {/* Era */}
                                      <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-muted)]">Era</label>
                                        <select
                                          value={trackTags.tags.era || ''}
                                          onChange={(e) => handleUpdateTag(analysis.id, 'era', e.target.value || null)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs text-primary focus:outline-none focus:border-[var(--primary)]"
                                        >
                                          <option value="">Select era</option>
                                          <option value="90s">90s</option>
                                          <option value="00s">00s</option>
                                          <option value="10s">10s</option>
                                          <option value="20s">20s</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Instrumentation display */}
                                    {trackTags.tags.instrumentation && trackTags.tags.instrumentation.length > 0 && (
                                      <div className="space-y-1">
                                        <label className="text-xs text-[var(--text-muted)]">Instrumentation</label>
                                        <div className="flex flex-wrap gap-2">
                                          {trackTags.tags.instrumentation.map((inst, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs font-medium">
                                              {inst}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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

        {/* Create Playlist Modal */}
        {showCreatePlaylistModal && (
          <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-elevated border border-theme rounded-lg p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary font-semibold text-lg">Nieuwe Playlist</h3>
                <button
                  onClick={() => {
                    setShowCreatePlaylistModal(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                    setError(null);
                  }}
                  className="p-2 hover:bg-surface-hover rounded transition-all duration-200"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-surface border border-[var(--error)] rounded">
                  <p className="text-[var(--error)] text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-primary text-sm font-medium mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Bijv. Workout Mix"
                    className="w-full px-4 py-2.5 bg-background border border-theme rounded text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-primary text-sm font-medium mb-2">
                    Beschrijving (optioneel)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="Beschrijf je playlist..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-theme rounded text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowCreatePlaylistModal(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                    setError(null);
                  }}
                  disabled={isSavingPlaylist}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-theme text-primary text-sm font-medium rounded transition-all duration-200 button-press hover-scale disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={isSavingPlaylist || !newPlaylistName.trim()}
                  className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-all duration-200 button-press hover-scale flex items-center gap-2"
                >
                  {isSavingPlaylist ? (
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

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-elevated border border-theme rounded-lg p-6 max-w-md w-full animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-primary font-semibold text-lg">Nieuwe Map</h3>
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                    setError(null);
                  }}
                  className="p-2 hover:bg-surface-hover rounded transition-all duration-200"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-surface border border-[var(--error)] rounded">
                  <p className="text-[var(--error)] text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-primary text-sm font-medium mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Bijv. Workout Playlists"
                    className="w-full px-4 py-2.5 bg-background border border-theme rounded text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateFolder();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setNewFolderName('');
                    setError(null);
                  }}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-theme text-primary text-sm font-medium rounded transition-all duration-200 button-press hover-scale"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-all duration-200 button-press hover-scale"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        )}

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

