'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { ensureCsrfToken } from '@/lib/security/csrf-client';

interface LoginFormProps {
  callbackUrl?: string;
}

const TOKEN_KEY = 'stayneos_auth_token';
const USER_KEY = 'stayneos_user_data';

export function LoginForm({ callbackUrl = '/' }: LoginFormProps) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t('auth.emailRequired', 'Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.invalidEmail', 'Please enter a valid email');
    }

    if (!password) {
      newErrors.password = t('auth.passwordRequired', 'Password is required');
    } else if (password.length < 6) {
      newErrors.password = t('auth.passwordTooShort', 'Password must be at least 6 characters');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const sanitizeCallbackUrl = (url: string) => {
    if (!url) return '/dashboard';
    // only allow internal relative paths
    if (!url.startsWith('/')) return '/dashboard';
    if (url.startsWith('//')) return '/dashboard';
    return url;
  };


  const isHost = (role?: string) =>
    role === 'HOST' || role === 'ADMIN' || role === 'SUPER_ADMIN';

  const getPostLoginUrl = (role?: string) => {
    if (callbackUrl && callbackUrl !== '/') return sanitizeCallbackUrl(callbackUrl);
    if (isHost(role)) return '/host';
    return '/dashboard/bookings';
  };

  const ensureSessionReady = async () => {
    for (let i = 0; i < 4; i += 1) {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      if (res.ok) return true;
      await new Promise((r) => setTimeout(r, 120 * (i + 1)));
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': ensureCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth data
      if (data.token) {
        if (isClient) localStorage.setItem(TOKEN_KEY, data.token);
      }
      if (data.user) {
        if (isClient) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }


      const nextUrl = getPostLoginUrl(data.user?.role);
      await ensureSessionReady();
      // Use hard redirect for reliability so middleware sees latest cookie immediately
      if (isClient) window.location.assign(nextUrl);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : t('auth.loginFailed', 'Login failed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isClient) window.location.href = '/api/auth/google';
  };

  const handleFacebookLogin = () => {
    // Facebook login not implemented yet
    setErrors({ submit: t('auth.facebookComingSoon', 'Facebook login coming soon!') });
  };

  const oauthError = (() => {
    const error = searchParams?.get('error');
    if (!error) return null;

    const errorMessages: Record<string, string> = {
      invalid_state: 'Google login session expired. Please try again.',
      token_exchange_failed: 'Failed to complete Google login. Please try again.',
      config_error: 'Google login is not configured properly.',
      callback_failed: 'Google login failed. Please try again.',
      oauth_error: 'Google login was cancelled or denied.',
      user_info_failed: 'Could not retrieve Google account info.',
      email_not_verified: 'Your Google email is not verified',
    };

    return errorMessages[error] || `Login error: ${error}`;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('auth.continueWithGoogle', 'Continue with Google')}
        </button>
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={true}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {t('auth.facebookComingSoon', 'Continue with Facebook (Coming Soon)')}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t('auth.orSignInWithEmail', 'Or sign in with email')}</span>
        </div>
      </div>

      {/* Form Fields */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.emailLabel', 'Email Address')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder', 'john@example.com')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.passwordLabel', 'Password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Error Messages */}
      {oauthError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{oauthError}</p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.loginButton', 'Sign In')}
      </button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            {t('nav.signup', 'Create account')}
          </Link>
        </p>
      </div>

      {/* Forgot Password Link */}
      <div className="text-center">
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
          {t('auth.forgotPassword', 'Forgot your password?')}
        </Link>
      </div>
    </form>
  );
}
