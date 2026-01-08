'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Music, Settings, LogOut, Headphones, TrendingUp, ListMusic, Volume2, FileSearch, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <Link href="/" className="p-4 md:p-6 flex items-center gap-3 border-b border-white/8 hover:bg-white/[0.02] transition-colors group">
        <div className="p-2 bg-[#3b82f6]/10 rounded-lg group-hover:bg-[#3b82f6]/20 transition-colors">
          <Headphones className="w-5 h-5 text-[#3b82f6]" />
        </div>
        <span className="text-lg font-semibold text-white tracking-tight">Opperbeat</span>
      </Link>

      {/* Dashboard/Home */}
      <div className="p-3 md:p-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#f5f5f7]/80 hover:text-white hover:bg-white/[0.03] transition-all text-sm font-medium">
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        <NavItem href="/" icon={<BarChart3 className="w-4 h-4" />} label="Overview" active={pathname === '/'} />
        <NavItem href="/analyze" icon={<FileSearch className="w-4 h-4" />} label="Muziek Analyse" active={pathname === '/analyze'} />
        <NavItem href="/mixes" icon={<Music className="w-4 h-4" />} label="Mixes & Sets" active={pathname === '/mixes'} />
        <NavItem href="/analytics" icon={<TrendingUp className="w-4 h-4" />} label="Analytics" badge="1" active={pathname === '/analytics'} />
        <NavItem href="/playlists" icon={<ListMusic className="w-4 h-4" />} label="Playlist Builder" active={pathname === '/playlists'} />
        <NavItem href="/sound" icon={<Volume2 className="w-4 h-4" />} label="Sound Settings" active={pathname === '/sound'} />
        <NavItem href="/profile" icon={<Settings className="w-4 h-4" />} label="Profile & Settings" active={pathname === '/profile'} />
      </div>

      {/* Logout */}
      <div className="p-3 md:p-4 border-t border-white/8">
        <NavItem href="#" icon={<LogOut className="w-4 h-4" />} label="Log out" />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a22] border border-white/8 rounded-lg text-white hover:bg-[#14141a] transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex h-screen w-64 bg-[#14141a] border-r border-white/8 flex-col shadow-xl">
        {sidebarContent}
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-[#14141a] border-r border-white/8 flex flex-col shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
      active 
        ? 'bg-[#3b82f6]/15 text-white shadow-sm' 
        : 'text-[#f5f5f7]/70 hover:bg-white/[0.03] hover:text-white'
    }`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#3b82f6]' : 'text-[#f5f5f7]/50'}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
          active 
            ? 'bg-[#3b82f6] text-white' 
            : 'bg-white/10 text-[#f5f5f7]/70'
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

