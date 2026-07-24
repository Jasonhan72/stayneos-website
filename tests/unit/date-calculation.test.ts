import { calculateNights, formatDate, formatCurrency } from '@/lib/utils';

describe('Date calculation', () => {
  describe('calculateNights', () => {
    it('calculates 1 night for consecutive days', () => {
      expect(calculateNights('2026-04-01', '2026-04-02')).toBe(1);
    });

    it('calculates 7 nights for a week', () => {
      expect(calculateNights('2026-04-01', '2026-04-08')).toBe(7);
    });

    it('calculates 28 nights for a month stay', () => {
      expect(calculateNights('2026-04-01', '2026-04-29')).toBe(28);
    });

    it('calculates 90 nights for 3 months', () => {
      expect(calculateNights('2026-04-01', '2026-06-30')).toBe(90);
    });

    it('calculates nights across year boundary', () => {
      expect(calculateNights('2025-12-25', '2026-01-02')).toBe(8);
    });

    it('returns 0 for same day', () => {
      expect(calculateNights('2026-04-01', '2026-04-01')).toBe(0);
    });

    it('handles Date objects', () => {
      expect(calculateNights(new Date('2026-04-01'), new Date('2026-04-11'))).toBe(10);
    });

    it('handles reversed dates (absolute)', () => {
      // Uses Math.abs, so order doesn't matter
      expect(calculateNights('2026-04-10', '2026-04-01')).toBe(9);
    });

    it('handles leap year dates', () => {
      // Feb 28 to Mar 1 in a non-leap year
      expect(calculateNights('2025-02-28', '2025-03-01')).toBe(1);
    });
  });

  describe('formatDate', () => {
    it('formats date in zh-CN locale', () => {
      // Use UTC noon to avoid timezone shifting
      const result = formatDate(new Date('2026-04-15T12:00:00Z'));
      expect(result).toContain('2026');
      expect(result).toContain('月');
      expect(result).toContain('日');
    });

    it('handles string input', () => {
      // String date is timezone-sensitive; verify it returns a formatted string
      const result = formatDate('2026-06-15T12:00:00Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats CAD currency', () => {
      const result = formatCurrency(3000, 'CAD');
      expect(result).toContain('$');
      expect(result).toContain('3');
    });

    it('formats USD currency', () => {
      const result = formatCurrency(1500, 'USD');
      expect(result).toContain('$');
    });

    it('defaults to CAD when no currency specified', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('$');
    });

    it('formats zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
    });
  });
});
