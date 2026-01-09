'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Headphones, Mail, Lock, Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check of gebruiker net geregistreerd is
    if (searchParams.get('registered') === 'true') {
      setSuccess(t.auth.accountCreated);
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.loginFailed);
      }

      // Update auth context met gebruikersinformatie
      if (data.user) {
        login(data.user);
      }

      // Redirect naar dashboard na succesvolle login
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Gebruik demo login endpoint die altijd werkt
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.loginFailed);
      }

      // Update auth context met gebruikersinformatie
      if (data.user) {
        login(data.user);
      }

      // Redirect naar dashboard na succesvolle login
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] mb-4">
            <Headphones className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">Opperbeat</h1>
          <p className="text-[var(--text-secondary)] text-sm">{t.auth.welcomeBack}</p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--surface)] rounded-[4px] p-8 border border-[var(--border)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@voorbeeld.nl"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[4px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-surface rounded-full peer-focus:outline-none peer peer-checked:bg-[var(--primary)] transition-colors">
                  <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform ${rememberMe ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {t.auth.rememberMe}
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors font-medium"
              >
                {t.auth.forgotPassword}
              </a>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-[var(--surface)] border border-[var(--success)] rounded-[4px]">
                <p className="text-[var(--success)] text-sm text-center">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[var(--surface)] border border-[var(--error)] rounded-[4px]">
                <p className="text-[var(--error)] text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-[4px] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t.auth.loggingIn}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{t.auth.login}</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Login Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] font-medium px-6 py-3.5 rounded-[4px] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
                  <span>{t.auth.loggingIn}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-[var(--accent)]" />
                  <span>{t.auth.demoLogin}</span>
                </>
              )}
            </button>
            <p className="text-xs text-[var(--text-muted)] text-center mt-2">{t.auth.demoLoginDescription}</p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              {t.auth.noAccount}{' '}
              <a
                href="/register"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
              >
                {t.auth.createAccount}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[var(--text-muted)] text-xs">
            {t.auth.termsAgreement}{' '}
            <a href="#" className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              {t.auth.termsOfService}
            </a>{' '}
            en{' '}
            <a href="#" className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
              {t.auth.privacyPolicy}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

