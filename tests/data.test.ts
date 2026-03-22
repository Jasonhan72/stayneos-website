import { describe, it, expect } from 'vitest';
import { getPropertyById, mockProperties as properties } from '@/lib/data';

describe('getPropertyById', () => {
  it('returns property for valid ID', () => {
    const prop = getPropertyById('1');
    expect(prop).toBeDefined();
    expect(prop?.id).toBe('1');
    expect(prop?.price).toBe(12000);
  });

  it('returns undefined for invalid ID', () => {
    expect(getPropertyById('999')).toBeUndefined();
    expect(getPropertyById('')).toBeUndefined();
  });
});

describe('properties data', () => {
  it('has 3 properties', () => {
    expect(properties.length).toBe(3);
  });

  it('all properties have required fields', () => {
    for (const p of properties) {
      expect(p.id).toBeDefined();
      expect(p.price).toBeGreaterThan(0);
      expect(p.priceUnit).toBe('month');
    }
  });
});
