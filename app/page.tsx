'use client';

import Sidebar from './components/Sidebar';
import MusicAnalysisCard from './components/MusicAnalysisCard';
import { useI18n } from '@/lib/i18n-context';

export default function Home() {
  const { t } = useI18n();
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-lg sm:text-xl font-semibold mb-2 tracking-tight text-[var(--text-primary)]">{t.home.title}</h1>
            <p className="text-[var(--text-secondary)] text-sm">{t.home.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <MusicAnalysisCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
