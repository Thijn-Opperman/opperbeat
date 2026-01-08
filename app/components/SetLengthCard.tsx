'use client';

export default function SetLengthCard() {
  const progress = 37; // 37 minutes out of 60
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 60) * circumference;

  return (
    <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <h3 className="text-white font-semibold text-sm sm:text-base">Average DJ Set Length</h3>
        <select className="bg-white/5 border border-white/10 rounded px-2 sm:px-3 py-1 text-white text-xs sm:text-sm w-full sm:w-auto">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="flex items-center justify-center h-36 sm:h-48">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#ec4899"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-white">37</div>
              <div className="text-xs sm:text-sm text-white/60">min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



