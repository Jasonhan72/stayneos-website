'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { isLocale, persistLocale } from './preferences';
import { getLocalePrefix, localizePath } from './i18n-routes';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import translations (each lang now lives in messages/<lang>/*.json split
// by namespace; the barrel in each lang directory merges them back into a
// single dict so consumers continue to look up dot-keys like 'aboutPage.title').
import en from '../../messages/en';
import fr from '../../messages/fr';
import zh from '../../messages/zh';

const translations = { en, fr, zh };

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

export function I18nProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) {
  // Use server-detected locale to avoid SSR/client mismatch flash
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Keep the first client render aligned with the document, including after a
  // locale-prefixed link opens with an older preference in another tab.
  useEffect(() => {
    setLocaleState(getLocalePrefix(window.location.pathname) ?? initialLocale);
    setIsHydrated(true);
    setIsLoading(false);
  }, [initialLocale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale === 'fr' ? 'fr-CA' : 'en';
    }
  }, [locale]);

  useEffect(() => {
    const handleLocaleChange = (event: Event) => {
      const preferred = (event as CustomEvent<{ locale?: Locale }>).detail?.locale;
      if (isLocale(preferred)) setLocaleState(getLocalePrefix(window.location.pathname) ?? preferred);
    };
    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    persistLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

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
        if (process.env.NODE_ENV === 'development') console.warn(`[i18n] Translation not found for key: "${key}" in locale: "${locale}"`);
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

// Navigate with the saved preference so server and client render the same locale.
export function useSwitchLocale() {
  const { setLocale } = useI18n();
  return (locale: Locale) => {
    const destination = new URL(window.location.href);
    destination.pathname = localizePath(destination.pathname, locale);
    if (destination.href === window.location.href) {
      setLocale(locale);
      return;
    }
    // Keep the current document in one language until the next one arrives.
    persistLocale(locale, { notify: false });
    window.location.assign(destination.href);
  };
}
