'use client';

import React, { createContext, useContext } from 'react';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 回退实现：用于构建时避免错误
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // 构建时返回一个安全的回退实现
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string, defaultValue?: string | Record<string, string | number>) => {
        return typeof defaultValue === 'string' ? defaultValue : key;
      },
      isLoading: false,
      isHydrated: true,
    };
  }
  return context;
}

// 简单的提供者，避免构建错误
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const value: I18nContextType = {
    locale: 'en' as Locale,
    setLocale: () => {},
    t: (key: string, defaultValue?: string | Record<string, string | number>) => {
      return typeof defaultValue === 'string' ? defaultValue : key;
    },
    isLoading: false,
    isHydrated: true,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}