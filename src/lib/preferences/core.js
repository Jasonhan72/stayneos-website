export const SUPPORTED_LOCALES = ['en', 'zh', 'fr'];
export const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'EUR', 'CNY'];

export function resolveLocale(...candidates) {
  for (const value of candidates) {
    if (SUPPORTED_LOCALES.includes(value)) return value;
  }
  return 'en';
}

export function resolveCurrency(...candidates) {
  for (const value of candidates) {
    if (SUPPORTED_CURRENCIES.includes(value)) return value;
  }
  return 'CAD';
}
