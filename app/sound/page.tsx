'use client';

import Sidebar from '../components/Sidebar';
import { Volume2, Sliders, Headphones, Speaker } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';

export default function SoundSettingsPage() {
  const { t } = useI18n();
  const [masterVolume, setMasterVolume] = useState(75);
  const [headphoneVolume, setHeadphoneVolume] = useState(60);
  const [speakerVolume, setSpeakerVolume] = useState(80);

  return (
    <div className="flex h-screen bg-[#0a0714] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#f5f3ff] mb-2 tracking-tight">{t.sound.title}</h1>
            <p className="text-[#f5f3ff]/70 text-sm">{t.sound.subtitle}</p>
          </div>

          {/* Master Volume */}
          <div className="bg-[#1d1628] rounded-xl p-4 sm:p-6 border border-[#8B5CF6]/20 shadow-lg mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#8B5CF6]/10 rounded-lg">
                <Volume2 className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-[#f5f3ff] font-semibold">{t.sound.masterVolume}</h3>
                <p className="text-[#f5f3ff]/60 text-sm">{t.sound.masterVolumeDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f3ff]/70 text-sm w-20">{masterVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#151020] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          {/* Headphone Cue */}
          <div className="bg-[#1d1628] rounded-xl p-4 sm:p-6 border border-[#8B5CF6]/20 shadow-lg mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#8B5CF6]/10 rounded-lg">
                <Headphones className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-[#f5f3ff] font-semibold">{t.sound.headphoneCue}</h3>
                <p className="text-[#f5f3ff]/60 text-sm">{t.sound.headphoneCueDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f3ff]/70 text-sm w-20">{headphoneVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={headphoneVolume}
                  onChange={(e) => setHeadphoneVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#151020] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          {/* Speaker Output */}
          <div className="bg-[#1d1628] rounded-xl p-4 sm:p-6 border border-[#8B5CF6]/20 shadow-lg mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#8B5CF6]/10 rounded-lg">
                <Speaker className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-[#f5f3ff] font-semibold">{t.sound.speakerOutput}</h3>
                <p className="text-[#f5f3ff]/60 text-sm">{t.sound.speakerOutputDescription}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f3ff]/70 text-sm w-20">{speakerVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speakerVolume}
                  onChange={(e) => setSpeakerVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#151020] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-[#1d1628] rounded-xl p-4 sm:p-6 border border-[#8B5CF6]/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#8B5CF6]/10 rounded-lg">
                <Sliders className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h3 className="text-[#f5f3ff] font-semibold">{t.sound.advancedSettings}</h3>
                <p className="text-[#f5f3ff]/60 text-sm">{t.sound.advancedSettingsDescription}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#151020] rounded-lg border border-[#8B5CF6]/15">
                <div>
                  <p className="text-[#f5f3ff] font-medium text-sm">{t.sound.autoGainControl}</p>
                  <p className="text-[#f5f3ff]/60 text-xs mt-1">{t.sound.autoGainControlDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#151020] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#151020] rounded-lg border border-[#8B5CF6]/15">
                <div>
                  <p className="text-[#f5f3ff] font-medium text-sm">{t.sound.lowLatencyMode}</p>
                  <p className="text-[#f5f3ff]/60 text-xs mt-1">{t.sound.lowLatencyModeDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#151020] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

