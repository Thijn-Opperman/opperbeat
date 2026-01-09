'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Music, Settings, LogOut, Headphones, TrendingUp, ListMusic, Volume2, FileSearch, Menu, X, Library, HelpCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import LanguageSwitch from './LanguageSwitch';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();
  const { logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link href="/" className="p-4 md:p-6 flex items-center gap-3 border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
        <div className="p-2 bg-[var(--surface)] rounded-[4px] border border-[var(--border)]">
          <Headphones className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Opperbeat</span>
      </Link>

      {/* Dashboard/Home */}
      <div className="p-3 md:p-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium">
          <Home className="w-4 h-4" />
          <span>{t.nav.dashboard}</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        <NavItem href="/" icon={<BarChart3 className="w-4 h-4" />} label={t.nav.overview} active={pathname === '/'} />
        <NavItem href="/analyze" icon={<FileSearch className="w-4 h-4" />} label={t.nav.musicAnalysis} active={pathname === '/analyze'} />
        <NavItem href="/library" icon={<Library className="w-4 h-4" />} label={t.nav.library} active={pathname === '/library'} />
        <NavItem href="/mixes" icon={<Music className="w-4 h-4" />} label={t.nav.mixesSets} active={pathname === '/mixes'} />
        <NavItem href="/analytics" icon={<TrendingUp className="w-4 h-4" />} label={t.nav.analytics} badge="1" active={pathname === '/analytics'} />
        <NavItem href="/playlists" icon={<ListMusic className="w-4 h-4" />} label={t.nav.playlistBuilder} active={pathname === '/playlists'} />
        <NavItem href="/sound" icon={<Volume2 className="w-4 h-4" />} label={t.nav.soundSettings} active={pathname === '/sound'} />
        <NavItem href="/profile" icon={<Settings className="w-4 h-4" />} label={t.nav.profileSettings} active={pathname === '/profile'} />
        <NavItem href="/help" icon={<HelpCircle className="w-4 h-4" />} label={t.nav.help} active={pathname === '/help'} />
      </div>

      {/* Language Switch & Theme Toggle */}
      <div className="p-3 md:p-4 border-t border-[var(--border)] space-y-3">
        <div className="px-3">
          <LanguageSwitch />
        </div>
        <div className="px-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-[var(--border)]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] cursor-pointer transition-colors text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--error)]"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t.nav.logout}</span>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 dark:bg-black/70 light:bg-black/50 z-40 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] flex-col">
        {sidebarContent}
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50 transform transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

function NavItem({ href, icon, label, badge, active }: { href: string; icon: React.ReactNode; label: string; badge?: string; active?: boolean }) {
  const content = (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-[4px] cursor-pointer transition-colors relative ${
      active 
        ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] border-l-2 border-[var(--primary)]' 
        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
    }`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] ${
          active 
            ? 'bg-[var(--primary)] text-white' 
            : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
        }`}>
          {badge}
        </span>
      )}
    </div>
  );

  if (href === '#') {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

