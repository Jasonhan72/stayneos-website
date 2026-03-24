'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const USER_KEY = 'stayneos_user_data';

export default function RegisterFormClient() {
  const router = useRouter();

  useEffect(() => {
    // Enhanced form functionality using Progressive Enhancement
    const form = document.querySelector('form[action="/api/auth/register"]') as HTMLFormElement;
    if (!form) return;

    const handleFormSubmit = async (e: Event) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const firstName = (formData.get('firstName') as string)?.trim();
      const lastName = (formData.get('lastName') as string)?.trim();
      const email = (formData.get('email') as string)?.trim();
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      // Remove previous error messages
      form.querySelectorAll('.error-message').forEach(el => el.remove());
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      // Validation
      const errors: Record<string, string> = {};
      
      if (!firstName) errors.firstName = 'First name is required';
      if (!lastName) errors.lastName = 'Last name is required';
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
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
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
        submitButton.textContent = 'Creating Account...';
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'same-origin',
            headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Store user profile only (auth token is HttpOnly cookie)
        if (data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Registration error:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message bg-red-50 border border-red-200 rounded-lg p-3 mb-4';
        errorDiv.innerHTML = `<p class="text-sm text-red-600">${error instanceof Error ? error.message : 'Registration failed. Please try again.'}</p>`;
        
        submitButton?.parentNode?.insertBefore(errorDiv, submitButton);
      } finally {
        // Reset button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Create Account';
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
  }, [router]);

  // This component renders nothing - it only adds JavaScript functionality
  return null;
}