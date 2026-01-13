'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-[var(--surface)] rounded-lg p-1">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`
            relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--surface)]
            ${theme === t.value
              ? 'bg-[var(--primary)] text-white scale-[1.02]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] active:scale-95'
            }
          `}
          aria-label={`Switch to ${t.label} theme`}
          aria-pressed={theme === t.value}
        >
          <span className={theme === t.value ? 'opacity-100' : 'opacity-70'}>{t.icon}</span>
          <span className="hidden sm:inline whitespace-nowrap">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

