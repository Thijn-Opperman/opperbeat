'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 bg-surface border border-theme rounded-lg p-1">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
            ${theme === t.value
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-surface-hover'
            }
          `}
          aria-label={`Switch to ${t.label} theme`}
          aria-pressed={theme === t.value}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

