'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export default function RegisterPage() {
  const { t, language } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validatie
    if (formData.password !== formData.confirmPassword) {
      setError(t.errors.passwordsDoNotMatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.errors.passwordTooShort);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.registerFailed);
      }

      // Redirect naar login pagina
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.somethingWentWrong);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0714] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl mb-4">
            <Headphones className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#f5f3ff] mb-2 tracking-tight">Opperbeat</h1>
          <p className="text-[#f5f3ff]/70 text-sm">{t.auth.createAccount}</p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1d1628] rounded-2xl p-8 border border-[#8B5CF6]/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-[#f5f3ff]/90 text-sm font-medium mb-2">
                {t.profile.fullName}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-[#f5f3ff]/40" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jan Jansen"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#151020] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#f5f3ff]/90 text-sm font-medium mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#f5f3ff]/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="naam@voorbeeld.nl"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#151020] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[#f5f3ff]/90 text-sm font-medium mb-2">
                {t.auth.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#f5f3ff]/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-[#151020] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#f5f3ff]/40 hover:text-[#f5f3ff]/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[#f5f3ff]/90 text-sm font-medium mb-2">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#f5f3ff]/40" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-[#151020] border border-[#8B5CF6]/20 rounded-lg text-[#f5f3ff] placeholder-[#f5f5f7]/40 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#f5f3ff]/40 hover:text-[#f5f3ff]/70 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

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
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 disabled:cursor-not-allowed text-[#f5f3ff] font-medium px-6 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t.auth.registering}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{t.auth.register}</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-[#8B5CF6]/20 text-center">
            <p className="text-[#f5f3ff]/70 text-sm">
              {t.auth.hasAccount}{' '}
              <a
                href="/login"
                className="text-[#8B5CF6] hover:text-[#60a5fa] font-medium transition-colors"
              >
                {t.auth.loginHere}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#f5f3ff]/50 text-xs">
            {t.auth.termsAgreement}{' '}
            <a href="#" className="text-[#8B5CF6] hover:underline">
              {t.auth.termsOfService}
            </a>{' '}
            en{' '}
            <a href="#" className="text-[#8B5CF6] hover:underline">
              {t.auth.privacyPolicy}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

