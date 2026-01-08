'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Music, Settings, LogOut, Headphones, TrendingUp, ListMusic, Volume2, FileSearch, Menu, X, Library } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import LanguageSwitch from './LanguageSwitch';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();

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
      <Link href="/" className="p-4 md:p-6 flex items-center gap-3 border-b border-[#8B5CF6]/15 hover:bg-[#8B5CF6]/5 transition-all group relative">
        <div className="p-2 bg-[#8B5CF6]/20 rounded-lg group-hover:bg-[#8B5CF6]/30 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#8B5CF6]/30">
          <Headphones className="w-5 h-5 text-[#8B5CF6] group-hover:text-[#EC4899] transition-colors" />
        </div>
        <span className="text-lg font-bold tracking-tight gradient-text">Opperbeat</span>
      </Link>

      {/* Dashboard/Home */}
      <div className="p-3 md:p-4 border-b border-[#8B5CF6]/15">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#f5f3ff]/75 hover:text-[#f5f3ff] hover:bg-[#8B5CF6]/10 transition-all text-sm font-medium hover:shadow-lg hover:shadow-[#8B5CF6]/20">
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
      </div>

      {/* Language Switch */}
      <div className="p-3 md:p-4 border-t border-[#8B5CF6]/15">
        <div className="px-3">
          <LanguageSwitch />
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-[#8B5CF6]/15">
        <NavItem href="#" icon={<LogOut className="w-4 h-4" />} label={t.nav.logout} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1d1628] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] hover:bg-[#241b32] hover:border-[#8B5CF6]/40 transition-all shadow-lg shadow-[#8B5CF6]/10 hover:shadow-[#8B5CF6]/20"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex h-screen w-64 bg-[#151020] border-r border-[#8B5CF6]/15 flex-col shadow-2xl shadow-[#8B5CF6]/5">
        {sidebarContent}
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-[#151020] border-r border-[#8B5CF6]/15 flex flex-col shadow-2xl shadow-[#8B5CF6]/10 z-50 transform transition-transform duration-300 ease-in-out ${
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
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 relative ${
      active 
        ? 'bg-[#8B5CF6]/20 text-[#f5f3ff] shadow-lg shadow-[#8B5CF6]/20' 
        : 'text-[#f5f3ff]/70 hover:bg-[#8B5CF6]/10 hover:text-[#f5f3ff] hover:shadow-md hover:shadow-[#8B5CF6]/10'
    }`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#8B5CF6] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-[#f5f3ff]/50'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
          active 
            ? 'bg-[#8B5CF6] text-[#f5f3ff] shadow-lg shadow-[#8B5CF6]/40' 
            : 'bg-[#8B5CF6]/20 text-[#f5f3ff]/70 border border-[#8B5CF6]/30'
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

