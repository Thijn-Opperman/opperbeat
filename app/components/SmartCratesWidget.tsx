'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Filter, Download, Play, Music, X, Plus, Trash2, Save } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  bpm: number | null;
  key: string | null;
  duration_formatted: string;
  created_at: string;
  // Voor POC: simulatie van energy (normaal zou dit uit analyse komen)
  energy?: number;
}

interface SmartCrateRule {
  id: string;
  type: 'bpm' | 'key' | 'energy' | 'date' | 'genre';
  operator: '>' | '<' | '=' | '>=' | '<=' | 'contains' | 'not_contains';
  value: string | number;
}

interface SmartCrate {
  id: string;
  name: string;
  description: string;
  rules: SmartCrateRule[];
  tracks: Track[];
  eventType?: 'club' | 'festival' | 'radio' | 'custom';
}

// Key compatibility matrix (Camelot wheel)
const keyCompatibility: Record<string, string[]> = {
  '1A': ['1A', '1B', '2A', '12A'],
  '1B': ['1A', '1B', '2B', '12B'],
  '2A': ['2A', '2B', '1A', '3A'],
  '2B': ['2A', '2B', '1B', '3B'],
  '3A': ['3A', '3B', '2A', '4A'],
  '3B': ['3A', '3B', '2B', '4B'],
  '4A': ['4A', '4B', '3A', '5A'],
  '4B': ['4A', '4B', '3B', '5B'],
  '5A': ['5A', '5B', '4A', '6A'],
  '5B': ['5A', '5B', '4B', '6B'],
  '6A': ['6A', '6B', '5A', '7A'],
  '6B': ['6A', '6B', '5B', '7B'],
  '7A': ['7A', '7B', '6A', '8A'],
  '7B': ['7A', '7B', '6B', '8B'],
  '8A': ['8A', '8B', '7A', '9A'],
  '8B': ['8A', '8B', '7B', '9B'],
  '9A': ['9A', '9B', '8A', '10A'],
  '9B': ['9A', '9B', '8B', '10B'],
  '10A': ['10A', '10B', '9A', '11A'],
  '10B': ['10A', '10B', '9B', '11B'],
  '11A': ['11A', '11B', '10A', '12A'],
  '11B': ['11A', '11B', '10B', '12B'],
  '12A': ['12A', '12B', '11A', '1A'],
  '12B': ['12A', '12B', '11B', '1B'],
};

// Convert musical key to Camelot notation (simplified)
function keyToCamelot(key: string | null): string | null {
  if (!key) return null;
  const keyMap: Record<string, string> = {
    'C major': '8B', 'C minor': '5A',
    'C# major': '3B', 'C# minor': '12A',
    'D major': '10B', 'D minor': '7A',
    'D# major': '5B', 'D# minor': '2A',
    'E major': '12B', 'E minor': '9A',
    'F major': '7B', 'F minor': '4A',
    'F# major': '2B', 'F# minor': '11A',
    'G major': '9B', 'G minor': '6A',
    'G# major': '4B', 'G# minor': '1A',
    'A major': '11B', 'A minor': '8A',
    'A# major': '6B', 'A# minor': '3A',
    'B major': '1B', 'B minor': '10A',
  };
  return keyMap[key] || null;
}

// Apply rules to filter tracks
function applyRules(tracks: Track[], rules: SmartCrateRule[], baseKey?: string | null): Track[] {
  let filtered = [...tracks];

  for (const rule of rules) {
    filtered = filtered.filter(track => {
      switch (rule.type) {
        case 'bpm':
          if (!track.bpm) return false;
          const bpmValue = Number(rule.value);
          switch (rule.operator) {
            case '>': return track.bpm > bpmValue;
            case '<': return track.bpm < bpmValue;
            case '>=': return track.bpm >= bpmValue;
            case '<=': return track.bpm <= bpmValue;
            case '=': return track.bpm === bpmValue;
            default: return true;
          }

        case 'key':
          if (!track.key) return false;
          
          if (rule.operator === 'contains') {
            // Key compatibility check - check if track key is compatible with base key
            if (baseKey) {
              const trackCamelot = keyToCamelot(track.key);
              const baseCamelot = keyToCamelot(baseKey);
              if (trackCamelot && baseCamelot) {
                const compatible = keyCompatibility[baseCamelot] || [];
                return compatible.includes(trackCamelot);
              }
            }
            // Simple contains check
            return track.key.toLowerCase().includes(String(rule.value).toLowerCase());
          } else if (rule.operator === '=') {
            // Exact match
            return track.key.toLowerCase() === String(rule.value).toLowerCase();
          }
          return true;

        case 'energy':
          const energy = track.energy || 5; // Default energy if not available
          const energyValue = Number(rule.value);
          switch (rule.operator) {
            case '>': return energy > energyValue;
            case '<': return energy < energyValue;
            case '>=': return energy >= energyValue;
            case '<=': return energy <= energyValue;
            case '=': return energy === energyValue;
            default: return true;
          }

        case 'date':
          const trackDate = new Date(track.created_at);
          const daysAgo = Number(rule.value);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
          
          if (rule.operator === '>') {
            // Not played in last X days (created before cutoff)
            return trackDate < cutoffDate;
          }
          return true;

        case 'genre':
          if (rule.operator === 'contains') {
            const genre = track.artist?.toLowerCase() || ''; // Simplified: using artist as genre placeholder
            return genre.includes(String(rule.value).toLowerCase());
          }
          return true;

        default:
          return true;
      }
    });
  }

  return filtered;
}

// Export to Rekordbox M3U format
function exportToM3U(crate: SmartCrate): string {
  let m3u = '#EXTM3U\n';
  
  crate.tracks.forEach((track, index) => {
    const duration = track.duration_formatted || '0:00';
    const [min, sec] = duration.split(':').map(Number);
    const totalSeconds = (min || 0) * 60 + (sec || 0);
    
    m3u += `#EXTINF:${totalSeconds},${track.artist || 'Unknown'} - ${track.title}\n`;
    m3u += `${track.title}\n`;
  });
  
  return m3u;
}

export default function SmartCratesWidget() {
  const { t } = useI18n();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [crates, setCrates] = useState<SmartCrate[]>([]);
  const [selectedCrate, setSelectedCrate] = useState<SmartCrate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCrateName, setNewCrateName] = useState('');
  const [newCrateDescription, setNewCrateDescription] = useState('');
  const [newCrateEventType, setNewCrateEventType] = useState<'club' | 'festival' | 'radio' | 'custom'>('custom');
  const [newCrateRules, setNewCrateRules] = useState<SmartCrateRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tracks from API (lokaal, geen Supabase)
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/api/analyses?limit=500');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Simulate energy for POC (normally would come from analysis)
          const tracksWithEnergy = data.data.map((track: any) => ({
            ...track,
            energy: Math.floor(Math.random() * 10) + 1, // Random 1-10 for POC
          }));
          setTracks(tracksWithEnergy);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
    
    // Load saved crates from localStorage
    const savedCrates = localStorage.getItem('smartCrates');
    if (savedCrates) {
      try {
        setCrates(JSON.parse(savedCrates));
      } catch (e) {
        console.error('Error loading saved crates:', e);
      }
    }
  }, []);

  // Save crates to localStorage
  const saveCrates = (newCrates: SmartCrate[]) => {
    setCrates(newCrates);
    localStorage.setItem('smartCrates', JSON.stringify(newCrates));
  };

  // Create preset crates
  const createPresetCrate = (name: string, description: string, eventType: 'club' | 'festival' | 'radio' | 'custom', rules: SmartCrateRule[]) => {
    const filteredTracks = applyRules(tracks, rules);
    
    const crate: SmartCrate = {
      id: `preset-${Date.now()}`,
      name,
      description,
      rules,
      tracks: filteredTracks,
      eventType,
    };
    
    saveCrates([...crates, crate]);
    setSelectedCrate(crate);
  };

  // Create custom crate
  const handleCreateCrate = () => {
    if (!newCrateName.trim()) return;
    
    const filteredTracks = applyRules(tracks, newCrateRules);
    
    const crate: SmartCrate = {
      id: `crate-${Date.now()}`,
      name: newCrateName.trim(),
      description: newCrateDescription.trim(),
      rules: [...newCrateRules],
      tracks: filteredTracks,
      eventType: newCrateEventType,
    };
    
    saveCrates([...crates, crate]);
    setSelectedCrate(crate);
    setShowCreateModal(false);
    setNewCrateName('');
    setNewCrateDescription('');
    setNewCrateRules([]);
  };

  // Add rule
  const addRule = () => {
    setNewCrateRules([...newCrateRules, {
      id: `rule-${Date.now()}`,
      type: 'bpm',
      operator: '>',
      value: '',
    }]);
  };

  // Remove rule
  const removeRule = (ruleId: string) => {
    setNewCrateRules(newCrateRules.filter(r => r.id !== ruleId));
  };

  // Update rule
  const updateRule = (ruleId: string, field: keyof SmartCrateRule, value: any) => {
    setNewCrateRules(newCrateRules.map(r => 
      r.id === ruleId ? { ...r, [field]: value } : r
    ));
  };

  // Delete crate
  const deleteCrate = (crateId: string) => {
    const newCrates = crates.filter(c => c.id !== crateId);
    saveCrates(newCrates);
    if (selectedCrate?.id === crateId) {
      setSelectedCrate(null);
    }
  };

  // Export crate
  const handleExport = (crate: SmartCrate) => {
    const m3u = exportToM3U(crate);
    const blob = new Blob([m3u], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${crate.name.replace(/[^a-z0-9]/gi, '_')}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Regenerate crate (reapply rules)
  const regenerateCrate = (crate: SmartCrate) => {
    const filteredTracks = applyRules(tracks, crate.rules);
    const updatedCrate = { ...crate, tracks: filteredTracks };
    const newCrates = crates.map(c => c.id === crate.id ? updatedCrate : c);
    saveCrates(newCrates);
    if (selectedCrate?.id === crate.id) {
      setSelectedCrate(updatedCrate);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-medium">Smart Crates</h3>
            <p className="text-[var(--text-secondary)] text-xs">Intelligente playlists op basis van regels</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nieuw
        </button>
      </div>

      {/* Preset Crates */}
      <div className="mb-4">
        <p className="text-[var(--text-secondary)] text-xs mb-2 font-medium">Snelle presets:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => createPresetCrate(
              'High Energy Club',
              'Tracks met hoge energy, BPM > 120, key compatibel',
              'club',
              [
                { id: '1', type: 'energy', operator: '>=', value: '7' },
                { id: '2', type: 'bpm', operator: '>', value: '120' },
              ]
            )}
            className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-xs hover:bg-[var(--surface-hover)] transition-all duration-200 button-press hover-scale"
          >
            🎉 High Energy
          </button>
          <button
            onClick={() => createPresetCrate(
              'Fresh Tracks',
              'Nog niet gedraaid in laatste 3 maanden',
              'radio',
              [
                { id: '1', type: 'date', operator: '>', value: '90' },
              ]
            )}
            className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-xs hover:bg-[var(--surface-hover)] transition-all duration-200 button-press hover-scale"
          >
            🆕 Fresh
          </button>
          <button
            onClick={() => createPresetCrate(
              'Chill Vibes',
              'Lage energy, BPM < 100',
              'radio',
              [
                { id: '1', type: 'energy', operator: '<=', value: '4' },
                { id: '2', type: 'bpm', operator: '<', value: '100' },
              ]
            )}
            className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-xs hover:bg-[var(--surface-hover)] transition-all duration-200 button-press hover-scale"
          >
            😌 Chill
          </button>
        </div>
      </div>

      {/* Crates List */}
      {crates.length > 0 && (
        <div className="space-y-2 mb-4">
          {crates.map(crate => (
            <div
              key={crate.id}
              className={`p-3 rounded-[4px] border transition-all duration-200 cursor-pointer hover-lift ${
                selectedCrate?.id === crate.id
                  ? 'bg-[var(--surface-hover)] border-[var(--primary)]'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
              onClick={() => setSelectedCrate(crate)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[var(--text-primary)] font-medium text-sm">{crate.name}</h4>
                    {crate.eventType && (
                      <span className="px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-secondary)] text-xs">
                        {crate.eventType}
                      </span>
                    )}
                  </div>
                  {crate.description && (
                    <p className="text-[var(--text-secondary)] text-xs mb-1">{crate.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>{crate.tracks.length} tracks</span>
                    <span>•</span>
                    <span>{crate.rules.length} regels</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateCrate(crate);
                    }}
                    className="p-1.5 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
                    title="Regenereren"
                  >
                    <Play className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(crate);
                    }}
                    className="p-1.5 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
                    title="Export naar Rekordbox"
                  >
                    <Download className="w-4 h-4 text-[var(--text-secondary)]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCrate(crate.id);
                    }}
                    className="p-1.5 hover:bg-[var(--error)]/20 rounded-[4px] transition-all duration-200"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--error)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Crate Details */}
      {selectedCrate && (
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[var(--text-primary)] font-medium">{selectedCrate.name}</h4>
            <button
              onClick={() => handleExport(selectedCrate)}
              className="px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export M3U
            </button>
          </div>

          {/* Rules */}
          <div className="mb-3">
            <p className="text-[var(--text-secondary)] text-xs mb-2 font-medium">Regels:</p>
            <div className="space-y-1">
              {selectedCrate.rules.map(rule => (
                <div key={rule.id} className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]">
                  {rule.type} {rule.operator} {rule.value}
                </div>
              ))}
            </div>
          </div>

          {/* Tracks List */}
          <div className="max-h-64 overflow-y-auto">
            <p className="text-[var(--text-secondary)] text-xs mb-2 font-medium">
              {selectedCrate.tracks.length} tracks gevonden:
            </p>
            <div className="space-y-1">
              {selectedCrate.tracks.slice(0, 20).map(track => (
                <div key={track.id} className="px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs">
                  <div className="text-[var(--text-primary)] font-medium truncate">
                    {track.title}
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs truncate">
                    {track.artist || 'Unknown'} • {track.bpm || '—'} BPM • {track.key || '—'} • {track.duration_formatted}
                  </div>
                </div>
              ))}
              {selectedCrate.tracks.length > 20 && (
                <div className="text-center text-xs text-[var(--text-muted)] py-2">
                  ... en {selectedCrate.tracks.length - 20} meer
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--text-primary)] font-medium">Nieuwe Smart Crate</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-[var(--surface-hover)] rounded-[4px] transition-all duration-200"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-1">Naam</label>
                <input
                  type="text"
                  value={newCrateName}
                  onChange={(e) => setNewCrateName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Bijv. High Energy Club Mix"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-1">Beschrijving</label>
                <input
                  type="text"
                  value={newCrateDescription}
                  onChange={(e) => setNewCrateDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Optionele beschrijving"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-1">Event Type</label>
                <select
                  value={newCrateEventType}
                  onChange={(e) => setNewCrateEventType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="custom">Custom</option>
                  <option value="club">Club</option>
                  <option value="festival">Festival</option>
                  <option value="radio">Radio</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[var(--text-secondary)] text-sm">Regels</label>
                  <button
                    onClick={addRule}
                    className="px-2 py-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium rounded-[4px] transition-all duration-200 button-press hover-scale flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Regel
                  </button>
                </div>
                <div className="space-y-2">
                  {newCrateRules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-2 p-2 bg-[var(--background)] border border-[var(--border)] rounded-[4px]">
                      <select
                        value={rule.type}
                        onChange={(e) => updateRule(rule.id, 'type', e.target.value)}
                        className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] text-xs focus:outline-none"
                      >
                        <option value="bpm">BPM</option>
                        <option value="key">Key</option>
                        <option value="energy">Energy</option>
                        <option value="date">Date (dagen geleden)</option>
                        <option value="genre">Genre</option>
                      </select>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                        className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] text-xs focus:outline-none"
                      >
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value=">=">{'>='}</option>
                        <option value="<=">{'<='}</option>
                        <option value="=">{'='}</option>
                        <option value="contains">contains</option>
                        <option value="not_contains">not contains</option>
                      </select>
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                        className="flex-1 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] text-xs focus:outline-none"
                        placeholder="Waarde"
                      />
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="p-1 hover:bg-[var(--error)]/20 rounded transition-all duration-200"
                      >
                        <X className="w-4 h-4 text-[var(--error)]" />
                      </button>
                    </div>
                  ))}
                  {newCrateRules.length === 0 && (
                    <p className="text-[var(--text-muted)] text-xs text-center py-2">
                      Voeg regels toe om tracks te filteren
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCreateCrate}
                  disabled={!newCrateName.trim() || newCrateRules.length === 0}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-[4px] transition-all duration-200 button-press hover-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Aanmaken
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-[4px] transition-all duration-200 hover:bg-[var(--surface-hover)]"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
