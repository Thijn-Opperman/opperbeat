'use client';

import Sidebar from './components/Sidebar';
import GenresCard from './components/GenresCard';
import LibraryCard from './components/LibraryCard';
import SetLengthCard from './components/SetLengthCard';

export default function Home() {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1800px] mx-auto">
          <div className="lg:col-span-1">
            <GenresCard />
          </div>
          <div className="lg:col-span-1">
            <LibraryCard />
          </div>
          <div className="lg:col-span-1">
            <SetLengthCard />
          </div>
        </div>
      </div>
    </div>
  );
}
