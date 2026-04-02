import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 支持的语言
export const locales = ['en', 'fr', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// 验证语言代码
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  zh: '中文'
};

// 语言方向
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fr: 'ltr',
  zh: 'ltr'
};

// 获取请求配置
export default getRequestConfig(async ({ locale }) => {
  // 验证语言代码
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  // 动态导入翻译文件
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    timeZone: 'America/Toronto',
    now: new Date()
  };
});