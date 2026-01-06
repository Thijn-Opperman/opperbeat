'use client';

export default function SetLengthCard() {
  const progress = 37; // 37 minutes out of 60
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 60) * circumference;

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Average DJ Set Length</h3>
        <select className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm">
          <option>Day</option>
          <option>Week</option>
          <option>Month</option>
        </select>
      </div>

      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
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
              <div className="text-3xl font-bold text-white">37</div>
              <div className="text-sm text-white/60">min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

