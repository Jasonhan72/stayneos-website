export type Locale = 'en' | 'zh' | 'fr';
export type Currency = 'CAD' | 'USD' | 'EUR' | 'CNY';

export const USER_KEY = 'stayneos_user_data';
export const PREFERRED_LOCALE_KEY = 'preferred-locale';
export const PREFERRED_CURRENCY_KEY = 'preferred-currency';
export const LOCALE_COOKIE_KEY = 'stayneos_locale';

export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_CURRENCY: Currency = 'CAD';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'zh' || value === 'fr';
}

export function isCurrency(value: unknown): value is Currency {
  return value === 'CAD' || value === 'USD' || value === 'EUR' || value === 'CNY';
}

export function readPreferredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const preferred = localStorage.getItem(PREFERRED_LOCALE_KEY);
  if (isLocale(preferred)) return preferred;

  const userData = localStorage.getItem(USER_KEY);
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (isLocale(user?.preferences?.language)) return user.preferences.language;
    } catch {}
  }

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE_KEY}=`))
    ?.split('=')[1];

  if (isLocale(cookie)) return cookie;
  return DEFAULT_LOCALE;
}

export function readPreferredCurrency(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;

  const preferred = localStorage.getItem(PREFERRED_CURRENCY_KEY);
  if (isCurrency(preferred)) return preferred;

  const userData = localStorage.getItem(USER_KEY);
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (isCurrency(user?.preferences?.currency)) return user.preferences.currency;
    } catch {}
  }

  return DEFAULT_CURRENCY;
}

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(PREFERRED_LOCALE_KEY, locale);

  const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; expires=${expires}; path=/; SameSite=Lax`;

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      user.preferences = { ...user.preferences, language: locale };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('localeChange', { detail: { locale } }));
  window.dispatchEvent(new CustomEvent('localStorageChange'));
}

export function persistCurrency(currency: Currency) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(PREFERRED_CURRENCY_KEY, currency);

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const user = JSON.parse(userData);
      user.preferences = { ...user.preferences, currency };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency } }));
  window.dispatchEvent(new CustomEvent('localStorageChange'));
}
