'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';

// Routes die toegankelijk zijn zonder authenticatie
const PUBLIC_ROUTES = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Niet redirecten tijdens loading
    if (isLoading) {
      return;
    }

    // Op publieke routes: redirect naar dashboard als al ingelogd
    if (PUBLIC_ROUTES.includes(pathname)) {
      if (isAuthenticated) {
        router.push('/');
      }
      return;
    }

    // Redirect naar login als niet geauthenticeerd op beveiligde routes
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  // Op publieke routes altijd kinderen tonen
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Alleen kinderen tonen als geauthenticeerd
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

