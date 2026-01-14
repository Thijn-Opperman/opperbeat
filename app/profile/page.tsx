'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Calendar, Save, Camera, Loader2, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij ophalen van profiel');
      }

      setProfile(data.data);
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
        bio: data.data.bio || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij opslaan van profiel');
      }

      setProfile(data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan van profiel');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">{t.common.loading || 'Laden...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8 animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Settings className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                {t.profile.title}
              </h1>
            </div>
            <p className="text-secondary text-sm ml-11">{t.profile.subtitle}</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--success)] rounded-[4px] animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                <p className="text-[var(--success)] text-sm font-medium">Profiel succesvol bijgewerkt!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px] animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                <p className="text-[var(--error)] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--background)] rounded-full border border-[var(--border)] flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--text-muted)]" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] rounded-full border-2 border-[var(--surface)] hover:opacity-90 transition-all duration-200 button-press">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {profile?.name || user?.name || 'Gebruiker'}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">{profile?.email || user?.email || ''}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                  {t.profile.fullName}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                  {t.profile.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                  {t.profile.bio}
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t.profile.bioPlaceholder}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift mb-4 sm:mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Calendar className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.profile.accountInfo}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium text-sm">{t.profile.memberSince}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                      {profile?.created_at ? formatDate(profile.created_at) : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium text-sm">{t.profile.accountType}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[var(--surface)] rounded-[4px] p-4 sm:p-6 border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)] hover-lift animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px]">
                <Settings className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base">{t.profile.preferences}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">{t.profile.emailNotifications}</p>
                  <p className="text-[var(--text-secondary)] text-xs mt-1">{t.profile.emailNotificationsDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-[4px] border border-[var(--border)] transition-all duration-200 hover:border-[var(--border-hover)]">
                <div className="flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">{t.profile.publicProfile}</p>
                  <p className="text-[var(--text-secondary)] text-xs mt-1">{t.profile.publicProfileDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] transition-all duration-200"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4 sm:mt-6 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 sm:px-6 py-2 sm:py-2.5 rounded-[4px] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center button-press hover-scale"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Wijzigingen Opslaan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
