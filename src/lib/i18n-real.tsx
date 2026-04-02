'use client';

import React, { createContext, useContext } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export type Locale = 'en' | 'fr' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 兼容层：将旧的 useI18n 映射到新的 next-intl
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// 兼容性提供者 - 包装新的 next-intl 系统
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  
  // 模拟旧的 setLocale 函数（在新的系统中通过 URL 路由处理）
  const setLocale = (newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      // 在新的系统中，语言切换通过 URL 路由处理
      // 这里只是记录，实际切换在 LanguageSwitcher 组件中处理
      console.log(`Locale change requested: ${newLocale}`);
    }
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t: (key: string, defaultValue?: string | Record<string, string | number>, params?: Record<string, string | number>) => {
      try {
        // 处理 next-intl 的翻译调用
        if (typeof defaultValue === 'string') {
          return t(key, { defaultValue });
        } else if (defaultValue && typeof defaultValue === 'object') {
          return t(key, defaultValue as Record<string, string | number | Date>);
        } else if (params) {
          return t(key, params as Record<string, string | number | Date>);
        }
        return t(key);
      } catch (error) {
        console.warn(`Translation error for key "${key}":`, error);
        return typeof defaultValue === 'string' ? defaultValue : key;
      }
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