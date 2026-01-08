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
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#f5f3ff]/70 hover:text-[#f5f3ff] hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-[#EC4899]/10 transition-all hover:shadow-md hover:shadow-[#8B5CF6]/20"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="uppercase font-bold">{language === 'nl' ? 'NL' : 'EN'}</span>
    </button>
  );
}

