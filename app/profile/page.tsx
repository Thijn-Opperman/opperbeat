'use client';

import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, Save, Camera } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function ProfilePage() {
  const { t } = useI18n();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-2 tracking-tight">{t.profile.title}</h1>
            <p className="text-secondary text-sm">{t.profile.subtitle}</p>
          </div>

          {/* Profile Section */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface rounded-full border border-theme flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] rounded-full border-2 border-surface-elevated hover:opacity-90 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-primary mb-1">DJ Naam</h2>
                <p className="text-secondary text-sm">dj@example.com</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-primary text-sm font-medium mb-2">{t.profile.fullName}</label>
                <input
                  type="text"
                  defaultValue="DJ Naam"
                  className="w-full px-4 py-2.5 bg-surface border border-theme rounded-lg text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-primary text-sm font-medium mb-2">{t.profile.email}</label>
                <input
                  type="email"
                  defaultValue="dj@example.com"
                  className="w-full px-4 py-2.5 bg-surface border border-theme rounded-lg text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <div>
                <label className="block text-primary text-sm font-medium mb-2">{t.profile.bio}</label>
                <textarea
                  rows={4}
                  placeholder={t.profile.bioPlaceholder}
                  className="w-full px-4 py-2.5 bg-surface border border-theme rounded-lg text-primary placeholder-muted focus:outline-none focus:border-[var(--primary)] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                <Calendar className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h3 className="text-primary font-semibold">{t.profile.accountInfo}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-primary font-medium text-sm">{t.profile.memberSince}</p>
                    <p className="text-secondary text-xs mt-1">Januari 2024</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-primary font-medium text-sm">{t.profile.accountType}</p>
                    <p className="text-secondary text-xs mt-1">Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-theme shadow-lg">
            <h3 className="text-primary font-semibold mb-6">{t.profile.preferences}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme">
                <div>
                  <p className="text-primary font-medium text-sm">{t.profile.emailNotifications}</p>
                  <p className="text-secondary text-xs mt-1">{t.profile.emailNotificationsDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-theme">
                <div>
                  <p className="text-primary font-medium text-sm">{t.profile.publicProfile}</p>
                  <p className="text-secondary text-xs mt-1">{t.profile.publicProfileDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4 sm:mt-6 flex justify-end">
            <button className="bg-[var(--primary)] hover:opacity-90 text-white font-medium px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
              <Save className="w-4 h-4" />
              Wijzigingen Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

