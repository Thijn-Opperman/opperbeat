'use client';

import { useI18n } from '@/lib/i18n-context';
import { Languages } from 'lucide-react';

export default function LanguageSwitch() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'nl' ? 'en' : 'nl');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-[4px] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-200 button-press hover-scale"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase font-medium">{language === 'nl' ? 'NL' : 'EN'}</span>
    </button>
  );
}

