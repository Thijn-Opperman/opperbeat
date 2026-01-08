'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';

export default function DynamicTitle() {
  const { t, language } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    let pageTitle = t.metadata.dashboard;
    
    // Bepaal de pagina titel op basis van de route
    if (pathname === '/') {
      pageTitle = t.home.title;
    } else if (pathname === '/analyze') {
      pageTitle = t.analyze.title;
    } else if (pathname === '/mixes') {
      pageTitle = t.mixes.title;
    } else if (pathname === '/analytics') {
      pageTitle = t.analytics.title;
    } else if (pathname === '/playlists') {
      pageTitle = t.playlists.title;
    } else if (pathname === '/sound') {
      pageTitle = t.sound.title;
    } else if (pathname === '/profile') {
      pageTitle = t.profile.title;
    } else if (pathname === '/login') {
      pageTitle = t.auth.login;
    } else if (pathname === '/register') {
      pageTitle = t.auth.register;
    }

    // Update document title
    document.title = `${t.metadata.appName} - ${pageTitle}`;
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
  }, [pathname, t, language]);

  return null;
}

