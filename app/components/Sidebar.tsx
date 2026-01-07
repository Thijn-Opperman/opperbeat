'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Music, Radio, Settings, LogOut, Headphones, Sparkles, PlayCircle, TrendingUp, ListMusic, Volume2, FileSearch } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 bg-black/90 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <Link href="/" className="p-6 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 transition-colors">
        <Headphones className="w-6 h-6 text-pink-500" />
        <span className="text-xl font-bold text-white">DJ COMMAND</span>
      </Link>

      {/* Dashboard/Home */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Dashboard / Home</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <NavItem href="/" icon={<BarChart3 className="w-5 h-5" />} label="Overview" active={pathname === '/'} />
        <NavItem href="/analyze" icon={<FileSearch className="w-5 h-5" />} label="Muziek Analyse" active={pathname === '/analyze'} />
        <NavItem href="#" icon={<Sparkles className="w-5 h-5" />} label="FX & Presets" badge="232" />
        <NavItem href="#" icon={<Music className="w-5 h-5" />} label="Mixes & Sets" />
        <NavItem href="#" icon={<TrendingUp className="w-5 h-5" />} label="Analytics" badge="1" />
        <NavItem href="#" icon={<Radio className="w-5 h-5" />} label="Live Performance" />
        <NavItem href="#" icon={<ListMusic className="w-5 h-5" />} label="Playlist Builder" />
        <NavItem href="#" icon={<Volume2 className="w-5 h-5" />} label="Sound Settings" />
        <NavItem href="#" icon={<Settings className="w-5 h-5" />} label="Profile & Settings" />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <NavItem href="#" icon={<LogOut className="w-5 h-5" />} label="Log out" />
      </div>

      {/* Theme toggle hint */}
      <div className="p-4 text-xs text-white/40 text-center">
        Switch to light
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, badge, active }: { href: string; icon: React.ReactNode; label: string; badge?: string; active?: boolean }) {
  const content = (
    <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
      active ? 'bg-pink-500/20 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );

  if (href === '#') {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

