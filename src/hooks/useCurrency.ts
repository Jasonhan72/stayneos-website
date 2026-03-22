'use client';

import { useState, useEffect, useCallback } from 'react';
import { readPreferredCurrency, persistCurrency } from '@/lib/preferences';
import type { Currency } from '@/lib/preferences';

// Approximate exchange rates from CAD
const EXCHANGE_RATES: Record<Currency, number> = {
  CAD: 1,
  USD: 0.74,
  EUR: 0.68,
  CNY: 5.35,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: '$',
  USD: '$',
  EUR: '€',
  CNY: '¥',
};

export function convertPrice(priceCAD: number, toCurrency: Currency): number {
  return Math.round(priceCAD * EXCHANGE_RATES[toCurrency]);
}

export function formatPrice(priceCAD: number, currency: Currency): string {
  const converted = convertPrice(priceCAD, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${converted.toLocaleString()}`;
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('CAD');

  useEffect(() => {
    setCurrency(readPreferredCurrency());
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.currency) {
        setCurrency(detail.currency);
      } else {
        setCurrency(readPreferredCurrency());
      }
    };

    window.addEventListener('currencyChange', handler);
    window.addEventListener('localStorageChange', handler);
    return () => {
      window.removeEventListener('currencyChange', handler);
      window.removeEventListener('localStorageChange', handler);
    };
  }, []);

  const setCurrencyPref = useCallback((c: Currency) => {
    persistCurrency(c);
    setCurrency(c);
  }, []);

  return {
    currency,
    setCurrency: setCurrencyPref,
    formatPrice: (priceCAD: number) => formatPrice(priceCAD, currency),
    convertPrice: (priceCAD: number) => convertPrice(priceCAD, currency),
    symbol: CURRENCY_SYMBOLS[currency],
  };
}
