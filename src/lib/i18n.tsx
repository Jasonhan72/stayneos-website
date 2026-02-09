'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import translations
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import zh from '../../messages/zh.json';

const translations = { en, fr, zh };

// User context key for language preference
const USER_KEY = "stayneos_user_data";
const PREFERRED_LOCALE_KEY = 'preferred-locale';
const LOCALE_COOKIE_KEY = 'stayneos_locale';

// Helper to get cookie value (works on both client and server)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to set cookie
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    // Server-side: default to 'en'
    return 'en';
  }
  
  // Client-side: Check in order of priority
  // Priority 1: Check preferred locale from localStorage (user's explicit choice)
  const stored = localStorage.getItem(PREFERRED_LOCALE_KEY);
  if (stored === 'zh' || stored === 'en' || stored === 'fr') {
    console.log('[i18n] Using preferred-locale:', stored);
    return stored;
  }
  
  // Priority 2: Check user preferences from localStorage
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.preferences?.language) {
        const lang = user.preferences.language;
        if (lang === 'zh' || lang === 'en' || lang === 'fr') {
          console.log('[i18n] Using user preferences:', lang);
          return lang;
        }
      }
    }
  } catch {}
  
  // Priority 3: Check cookie
  const cookieLocale = getCookie(LOCALE_COOKIE_KEY);
  if (cookieLocale === 'zh' || cookieLocale === 'en' || cookieLocale === 'fr') {
    console.log('[i18n] Using cookie:', cookieLocale);
    return cookieLocale;
  }
  
  // Default to English (do NOT use browser language to avoid unexpected language switches)
  console.log('[i18n] Defaulting to en');
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from storage
  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    setIsLoading(false);
  }, []);

  // Listen for locale changes from other components
  useEffect(() => {
    const handleLocaleChange = () => {
      const newLocale = getInitialLocale();
      setLocaleState(newLocale);
    };
    
    window.addEventListener('localeChange', handleLocaleChange);
    window.addEventListener('localStorageChange', handleLocaleChange);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange);
      window.removeEventListener('localStorageChange', handleLocaleChange);
    };
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // Save to cookie for SSR consistency
    setCookie(LOCALE_COOKIE_KEY, newLocale);
    
    // Save to localStorage
    localStorage.setItem(PREFERRED_LOCALE_KEY, newLocale);
    
    // Also update user preferences if user is logged in
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        user.preferences = { ...user.preferences, language: newLocale };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = getNestedValue(translations[locale], key);
      
      // Replace parameters
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
