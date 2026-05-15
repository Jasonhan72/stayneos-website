'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { ensureCsrfToken } from '@/lib/security/csrf-client';

const TOKEN_KEY = 'stayneos_auth_token';
const USER_KEY = 'stayneos_user_data';

interface RegisterFormProps {
  onSuccess?: () => void | Promise<void>;
  redirectOnSuccess?: boolean;
  compact?: boolean;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, redirectOnSuccess = true, compact = false, onSwitchToLogin }: RegisterFormProps = {}) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired', 'First name is required');
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired', 'Last name is required');
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired', 'Please confirm your password');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsMismatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': ensureCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth data - only on client
      if (data.token && isClient) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      if (data.user && isClient) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('localStorageChange'));
      }

      if (onSuccess) {
        await onSuccess();
      }

      // Hard redirect to dashboard (ensures middleware sees cookie)
      if (redirectOnSuccess && isClient) {
        window.location.assign('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : t('auth.registerFailed', 'Registration failed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : 'space-y-6'}>
      <div className={compact ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('auth.firstName', 'First Name')}
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.firstName ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder={t('auth.firstNamePlaceholder', 'Enter your first name')}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-error">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
            {t('auth.lastName', 'Last Name')}
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.lastName ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder={t('auth.lastNamePlaceholder', 'Enter your last name')}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-error">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('auth.email', 'Email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.email ? 'border-error' : 'border-neutral-300'
          }`}
          placeholder={t('auth.emailPlaceholder', 'Enter your email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-error">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('auth.password', 'Password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.password ? 'border-error' : 'border-neutral-300'
          }`}
          placeholder={t('auth.passwordPlaceholder', 'Create a password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-2 text-sm text-error">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
          {t('auth.confirmPassword', 'Confirm Password')}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.confirmPassword ? 'border-error' : 'border-neutral-300'
          }`}
          placeholder={t('auth.confirmPasswordPlaceholder', 'Confirm your password')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div>

      {errors.submit && (
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-sm text-error">{errors.submit}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('auth.creatingAccount', 'Creating account...') : t('auth.createAccount', 'Create Account')}
      </button>

      <p className="text-center text-sm text-neutral-600">
        {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
            {t('auth.signIn', 'Sign in')}
          </button>
        ) : (
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t('auth.signIn', 'Sign in')}
          </Link>
        )}
      </p>
    </form>
  );
}
