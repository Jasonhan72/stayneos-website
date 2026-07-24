import { convertPrice, formatPrice } from '@/hooks/useCurrency';

describe('Currency conversion', () => {
  describe('convertPrice', () => {
    it('returns same value for CAD', () => {
      expect(convertPrice(1000, 'CAD')).toBe(1000);
    });

    it('converts CAD to USD', () => {
      expect(convertPrice(1000, 'USD')).toBe(740);
    });

    it('converts CAD to EUR', () => {
      expect(convertPrice(1000, 'EUR')).toBe(680);
    });

    it('converts CAD to CNY', () => {
      expect(convertPrice(1000, 'CNY')).toBe(5350);
    });

    it('handles zero amount', () => {
      expect(convertPrice(0, 'USD')).toBe(0);
    });

    it('handles negative amount as edge case', () => {
      const result = convertPrice(-100, 'USD');
      expect(result).toBe(-74);
    });

    it('rounds to integer', () => {
      const result = convertPrice(333, 'USD'); // 333 * 0.74 = 246.42
      expect(result).toBe(246);
    });
  });

  describe('formatPrice', () => {
    it('formats CAD with $ symbol', () => {
      expect(formatPrice(3000, 'CAD')).toBe('$3,000');
    });

    it('formats USD with $ symbol', () => {
      expect(formatPrice(3000, 'USD')).toBe('$2,220');
    });

    it('formats EUR with € symbol', () => {
      expect(formatPrice(1000, 'EUR')).toBe('€680');
    });

    it('formats CNY with ¥ symbol', () => {
      expect(formatPrice(1000, 'CNY')).toBe('¥5,350');
    });
  });
});
