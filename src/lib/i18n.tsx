'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isHydrated: boolean;
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

// Client-side only function to detect real locale after hydration
function getClientLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en'; // Should never be called on server
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

export function I18nProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) {
  // Use server-detected locale to avoid SSR/client mismatch flash
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // After hydration, detect real locale
  useEffect(() => {
    const detectedLocale = getClientLocale();
    if (detectedLocale !== locale) {
      setLocaleState(detectedLocale);
    }
    setIsHydrated(true);
    setIsLoading(false);
  }, []); // 只在挂载时运行，不依赖locale

  // Listen for locale changes from other components
  useEffect(() => {
    const handleLocaleChange = () => {
      const newLocale = getClientLocale();
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
    console.log('[i18n] setLocale called with:', newLocale, 'current locale:', locale);
    
    if (newLocale === locale) {
      console.log('[i18n] Same locale, skipping update');
      return;
    }
    
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
    
    // Dispatch custom event to notify all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localeChange', { detail: { locale: newLocale } }));
      console.log('[i18n] localeChange event dispatched');
    }
    
    console.log('[i18n] Locale updated to:', newLocale);
  }, [locale]);

  const t = useCallback(
    (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>): string => {
      const translationObj = translations[locale];
      let text = getNestedValue(translationObj, key);
      
      // If translation not found and defaultValue is provided as string, use it
      if (text === key && typeof defaultValue === 'string') {
        text = defaultValue;
      }
      
      // Handle parameters - either from second argument if it's an object, or third argument
      let actualParams: Record<string, string | number> | undefined;
      if (typeof defaultValue === 'object' && defaultValue !== null) {
        actualParams = defaultValue;
      } else if (params) {
        actualParams = params;
      }
      
      // Replace parameters
      if (actualParams) {
        Object.entries(actualParams).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      
      // Debug: log if translation not found
      if (text === key && process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Translation not found for key: "${key}" in locale: "${locale}"`);
      }
      
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading, isHydrated }}>
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
