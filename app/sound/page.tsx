'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Volume2, Sliders, Headphones, Speaker, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

interface SoundSettings {
  masterVolume: number;
  headphoneVolume: number;
  speakerVolume: number;
  autoGainControl: boolean;
  lowLatencyMode: boolean;
}

const DEFAULT_SETTINGS: SoundSettings = {
  masterVolume: 75,
  headphoneVolume: 60,
  speakerVolume: 80,
  autoGainControl: true,
  lowLatencyMode: false,
};

export default function SoundSettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Laad opgeslagen instellingen
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error('Error parsing sound settings:', e);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SoundSettings>(
    key: K,
    value: SoundSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Auto-save naar localStorage
    localStorage.setItem('soundSettings', JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-2 tracking-tight">{t.sound.title}</h1>
                <p className="text-secondary text-sm">{t.sound.subtitle}</p>
              </div>
              {saved && (
                <div className="flex items-center gap-2 text-[var(--success)] animate-fade-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Opgeslagen</span>
                </div>
              )}
            </div>
          </div>

          {/* Master Volume */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-4 sm:mb-6 transition-all duration-200 hover:border-theme-hover hover-lift animate-fade-in-up stagger-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Volume2 className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-primary font-semibold">{t.sound.masterVolume}</h3>
                <p className="text-secondary text-sm">{t.sound.masterVolumeDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-secondary text-sm w-20 font-mono">{settings.masterVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.masterVolume}%, var(--surface) ${settings.masterVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Headphone Cue */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-4 sm:mb-6 transition-all duration-200 hover:border-theme-hover hover-lift animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Headphones className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-primary font-semibold">{t.sound.headphoneCue}</h3>
                <p className="text-secondary text-sm">{t.sound.headphoneCueDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-secondary text-sm w-20 font-mono">{settings.headphoneVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.headphoneVolume}
                  onChange={(e) => updateSetting('headphoneVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.headphoneVolume}%, var(--surface) ${settings.headphoneVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Speaker Output */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-4 sm:mb-6 transition-all duration-200 hover:border-theme-hover hover-lift animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Speaker className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-primary font-semibold">{t.sound.speakerOutput}</h3>
                <p className="text-secondary text-sm">{t.sound.speakerOutputDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-secondary text-sm w-20 font-mono">{settings.speakerVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.speakerVolume}
                  onChange={(e) => updateSetting('speakerVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.speakerVolume}%, var(--surface) ${settings.speakerVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg transition-all duration-200 hover:border-theme-hover hover-lift animate-fade-in-up stagger-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Sliders className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-primary font-semibold">{t.sound.advancedSettings}</h3>
                <p className="text-secondary text-sm">{t.sound.advancedSettingsDescription}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme transition-all duration-200 hover:border-theme-hover">
                <div>
                  <p className="text-primary font-medium text-sm">{t.sound.autoGainControl}</p>
                  <p className="text-secondary text-xs mt-1">{t.sound.autoGainControlDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoGainControl}
                    onChange={(e) => updateSetting('autoGainControl', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme transition-all duration-200 hover:border-theme-hover">
                <div>
                  <p className="text-primary font-medium text-sm">{t.sound.lowLatencyMode}</p>
                  <p className="text-secondary text-xs mt-1">{t.sound.lowLatencyModeDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.lowLatencyMode}
                    onChange={(e) => updateSetting('lowLatencyMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

