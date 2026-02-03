'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import translations
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import zh from '../../messages/zh.json';

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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
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
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
