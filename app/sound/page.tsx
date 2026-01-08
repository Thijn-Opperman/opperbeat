'use client';

import Sidebar from '../components/Sidebar';
import { Volume2, Sliders, Headphones, Speaker } from 'lucide-react';
import { useState } from 'react';

export default function SoundSettingsPage() {
  const [masterVolume, setMasterVolume] = useState(75);
  const [headphoneVolume, setHeadphoneVolume] = useState(60);
  const [speakerVolume, setSpeakerVolume] = useState(80);

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Sound Settings</h1>
            <p className="text-[#f5f5f7]/70 text-sm">Configureer audio instellingen en geluidsniveaus</p>
          </div>

          {/* Master Volume */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Volume2 className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Master Volume</h3>
                <p className="text-[#f5f5f7]/60 text-sm">Totale geluidsniveau</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f5f7]/70 text-sm w-20">{masterVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#14141a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          {/* Headphone Cue */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Headphones className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Headphone Cue</h3>
                <p className="text-[#f5f5f7]/60 text-sm">Volume voor hoofdtelefoon preview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f5f7]/70 text-sm w-20">{headphoneVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={headphoneVolume}
                  onChange={(e) => setHeadphoneVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#14141a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          {/* Speaker Output */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Speaker className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Speaker Output</h3>
                <p className="text-[#f5f5f7]/60 text-sm">Volume voor speaker output</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-[#f5f5f7]/70 text-sm w-20">{speakerVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speakerVolume}
                  onChange={(e) => setSpeakerVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#14141a] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Sliders className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Advanced Settings</h3>
                <p className="text-[#f5f5f7]/60 text-sm">Geavanceerde audio configuratie</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">Auto Gain Control</p>
                  <p className="text-[#f5f5f7]/60 text-xs mt-1">Automatisch geluidsniveau aanpassen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#14141a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">Low Latency Mode</p>
                  <p className="text-[#f5f5f7]/60 text-xs mt-1">Minimaliseer audio vertraging</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#14141a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

