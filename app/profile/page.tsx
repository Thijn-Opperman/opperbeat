'use client';

import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Profile & Settings</h1>
            <p className="text-[#f5f5f7]/70 text-sm">Beheer je profiel en account instellingen</p>
          </div>

          {/* Profile Section */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-[#14141a] rounded-full border border-white/8 flex items-center justify-center">
                  <User className="w-12 h-12 text-[#f5f5f7]/30" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#3b82f6] rounded-full border-2 border-[#1a1a22] hover:bg-[#2563eb] transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">DJ Naam</h2>
                <p className="text-[#f5f5f7]/60 text-sm">dj@example.com</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#f5f5f7]/90 text-sm font-medium mb-2">Volledige Naam</label>
                <input
                  type="text"
                  defaultValue="DJ Naam"
                  className="w-full px-4 py-2.5 bg-[#14141a] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[#f5f5f7]/90 text-sm font-medium mb-2">E-mailadres</label>
                <input
                  type="email"
                  defaultValue="dj@example.com"
                  className="w-full px-4 py-2.5 bg-[#14141a] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[#f5f5f7]/90 text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Vertel iets over jezelf..."
                  className="w-full px-4 py-2.5 bg-[#14141a] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#3b82f6]/10 rounded-lg">
                <Calendar className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <h3 className="text-white font-semibold">Account Informatie</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#f5f5f7]/40" />
                  <div>
                    <p className="text-white font-medium text-sm">Lid sinds</p>
                    <p className="text-[#f5f5f7]/60 text-xs mt-1">Januari 2024</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#f5f5f7]/40" />
                  <div>
                    <p className="text-white font-medium text-sm">Account Type</p>
                    <p className="text-[#f5f5f7]/60 text-xs mt-1">Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#1a1a22] rounded-xl p-6 border border-white/8 shadow-lg">
            <h3 className="text-white font-semibold mb-6">Voorkeuren</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">E-mail Notificaties</p>
                  <p className="text-[#f5f5f7]/60 text-xs mt-1">Ontvang updates via e-mail</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#14141a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#14141a] rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-medium text-sm">Public Profile</p>
                  <p className="text-[#f5f5f7]/60 text-xs mt-1">Maak je profiel zichtbaar voor anderen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#14141a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <Save className="w-4 h-4" />
              Wijzigingen Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

