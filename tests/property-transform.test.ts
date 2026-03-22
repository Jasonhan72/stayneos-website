import { describe, it, expect } from 'vitest';
import { toNightlyPrice, toMonthlyListingPrice, formatMonthlyListingPrice } from '@/lib/utils/property-transform';

describe('toNightlyPrice', () => {
  it('converts monthly price to nightly rate', () => {
    expect(toNightlyPrice(12000, 'month')).toBe(400);
    expect(toNightlyPrice(6500, 'month')).toBe(217);
    expect(toNightlyPrice(3500, 'month')).toBe(117);
  });

  it('handles various monthly unit strings', () => {
    expect(toNightlyPrice(12000, 'monthly')).toBe(400);
    expect(toNightlyPrice(12000, 'mo')).toBe(400);
    expect(toNightlyPrice(12000, '/mo')).toBe(400);
  });

  it('returns price as-is for nightly units', () => {
    expect(toNightlyPrice(400, 'night')).toBe(400);
    expect(toNightlyPrice(400, undefined)).toBe(400);
  });

  it('handles string prices', () => {
    expect(toNightlyPrice('12000', 'month')).toBe(400);
  });

  it('handles null/undefined', () => {
    expect(toNightlyPrice(null, 'month')).toBe(0);
    expect(toNightlyPrice(undefined, 'month')).toBe(0);
  });
});

describe('toMonthlyListingPrice', () => {
  it('returns monthly price rounded down to nearest 100', () => {
    expect(toMonthlyListingPrice(12000, 'month')).toBe(12000);
    expect(toMonthlyListingPrice(6500, 'month')).toBe(6500);
  });

  it('converts nightly to monthly (price * 30 * 0.8)', () => {
    // 400 * 30 * 0.8 = 9600 → floor to nearest 100 = 9600
    expect(toMonthlyListingPrice(400, 'night')).toBe(9600);
  });
});

describe('formatMonthlyListingPrice', () => {
  it('formats monthly price with From prefix', () => {
    expect(formatMonthlyListingPrice(12000, 'month')).toBe('From $12,000/Mo');
    expect(formatMonthlyListingPrice(6500, 'month')).toBe('From $6,500/Mo');
  });
});
