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
    localStorage.setItem('soundSettings', JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                  <Volume2 className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                  {t.sound.title}
                </h1>
              </div>
              {saved && (
                <div className="flex items-center gap-2 text-[var(--success)] animate-fade-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Opgeslagen</span>
                </div>
              )}
            </div>
            <p className="text-secondary text-sm ml-11">{t.sound.subtitle}</p>
          </div>

          {/* Master Volume */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Volume2 className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.sound.masterVolume}</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">{t.sound.masterVolumeDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-secondary)] text-sm w-16 font-mono text-right">{settings.masterVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.masterVolume}%, var(--surface) ${settings.masterVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Headphone Cue */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Headphones className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.sound.headphoneCue}</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">{t.sound.headphoneCueDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-secondary)] text-sm w-16 font-mono text-right">{settings.headphoneVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.headphoneVolume}
                  onChange={(e) => updateSetting('headphoneVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.headphoneVolume}%, var(--surface) ${settings.headphoneVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Speaker Output */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Speaker className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.sound.speakerOutput}</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">{t.sound.speakerOutputDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-secondary)] text-sm w-16 font-mono text-right">{settings.speakerVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.speakerVolume}
                  onChange={(e) => updateSetting('speakerVolume', Number(e.target.value))}
                  className="flex-1 h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${settings.speakerVolume}%, var(--surface) ${settings.speakerVolume}%, var(--surface) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Sliders className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.sound.advancedSettings}</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">{t.sound.advancedSettingsDescription}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">{t.sound.autoGainControl}</p>
                  <p className="text-[var(--text-secondary)] text-xs mt-1">{t.sound.autoGainControlDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoGainControl}
                    onChange={(e) => updateSetting('autoGainControl', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">{t.sound.lowLatencyMode}</p>
                  <p className="text-[var(--text-secondary)] text-xs mt-1">{t.sound.lowLatencyModeDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.lowLatencyMode}
                    onChange={(e) => updateSetting('lowLatencyMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
