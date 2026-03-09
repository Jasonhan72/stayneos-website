'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TOKEN_KEY = 'stayneos_auth_token';
const USER_KEY = 'stayneos_user_data';

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Enhanced form functionality using Progressive Enhancement
    const form = document.querySelector('form[action="/api/auth/login"]') as HTMLFormElement;
    if (!form) return;

    const handleFormSubmit = async (e: Event) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const email = (formData.get('email') as string)?.trim();
      const password = formData.get('password') as string;

      // Remove previous error messages
      form.querySelectorAll('.error-message').forEach(el => el.remove());
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      // Validation
      const errors: Record<string, string> = {};
      
      if (!email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      // Display errors
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, message]) => {
          const input = form.querySelector(`[name="${field}"]`);
          if (input) {
            const errorDiv = document.createElement('p');
            errorDiv.className = 'error-message mt-1 text-sm text-red-600';
            errorDiv.textContent = message;
            input.parentNode?.insertBefore(errorDiv, input.nextSibling);
          }
        });
        return;
      }

      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
      }

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
          throw new Error(data.message || 'Login failed');
        }

        // Store auth data
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
        }
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        // Redirect to callback URL or dashboard
        const callbackUrl = searchParams?.get('callback') || '/dashboard';
        router.push(callbackUrl);
      } catch (error) {
        console.error('Login error:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message bg-red-50 border border-red-200 rounded-lg p-3 mb-4';
        errorDiv.innerHTML = `<p class="text-sm text-red-600">${error instanceof Error ? error.message : 'Login failed. Please try again.'}</p>`;
        
        submitButton?.parentNode?.insertBefore(errorDiv, submitButton);
      } finally {
        // Reset button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Sign In';
        }
      }
    };

    // Add social login handlers
    const googleButton = form.querySelector('button[type="button"]');
    if (googleButton) {
      googleButton.addEventListener('click', () => {
        window.location.href = '/api/auth/google';
      });
    }

    // Add form submit handler
    form.addEventListener('submit', handleFormSubmit);

    // Cleanup
    return () => {
      form.removeEventListener('submit', handleFormSubmit);
    };
  }, [router, searchParams]);

  // This component renders nothing - it only adds JavaScript functionality
  return null;
}