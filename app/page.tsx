'use client';

import Sidebar from './components/Sidebar';
import MusicAnalysisCard from './components/MusicAnalysisCard';

export default function Home() {
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 tracking-tight">Overview</h1>
            <p className="text-[#f5f5f7]/70 text-sm">Bekijk je muziek analyses en inzichten</p>
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
