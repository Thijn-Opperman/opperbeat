'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Headphones, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setSuccess('Account succesvol aangemaakt! Je kunt nu inloggen.');
    }
  }, [searchParams]);

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
        throw new Error(data.error || 'Er ging iets mis bij het inloggen');
      }

      // Sla gebruikersinformatie op in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect naar dashboard na succesvolle login
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3b82f6]/10 rounded-2xl mb-4">
            <Headphones className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Opperbeat</h1>
          <p className="text-[#f5f5f7]/70 text-sm">Welkom terug! Log in om door te gaan</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a22] rounded-2xl p-8 border border-white/8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#f5f5f7]/90 text-sm font-medium mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#f5f5f7]/40" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@voorbeeld.nl"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#14141a] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[#f5f5f7]/90 text-sm font-medium mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#f5f5f7]/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-[#14141a] border border-white/8 rounded-lg text-white placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#f5f5f7]/40 hover:text-[#f5f5f7]/70 transition-colors"
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
                <div className="relative w-11 h-6 bg-[#14141a] rounded-full peer-focus:outline-none peer peer-checked:bg-[#3b82f6] transition-colors">
                  <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform ${rememberMe ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm text-[#f5f5f7]/70 group-hover:text-[#f5f5f7]/90 transition-colors">
                  Onthoud mij
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-medium"
              >
                Wachtwoord vergeten?
              </a>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg">
                <p className="text-[#10b981] text-sm text-center">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                <p className="text-[#ef4444] text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Inloggen...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Inloggen</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-[#f5f5f7]/70 text-sm">
              Nog geen account?{' '}
              <a
                href="/register"
                className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors"
              >
                Maak een account aan
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#f5f5f7]/50 text-xs">
            Door in te loggen ga je akkoord met onze{' '}
            <a href="#" className="text-[#3b82f6] hover:underline">
              Servicevoorwaarden
            </a>{' '}
            en{' '}
            <a href="#" className="text-[#3b82f6] hover:underline">
              Privacybeleid
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

