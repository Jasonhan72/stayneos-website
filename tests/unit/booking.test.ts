import { calculateBookingPrice, validateBookingDates, calculateRemainingAmount } from '@/lib/booking';

const baseProperty = {
  id: 'p1',
  title: 'Test',
  location: 'Toronto',
  price: 3000,
  priceUnit: 'month' as const,
  reviewCount: 0,
  images: [],
  maxGuests: 2,
  area: 500,
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
  minNights: 28,
  monthlyDiscount: 10,
  cleaningFee: 100,
};

describe('booking pricing', () => {
  it('calculates 1 night (min nights unmet)', () => {
    const result = calculateBookingPrice(baseProperty as any, '2026-04-01', '2026-04-02');
    expect(result.nights).toBe(1);
    expect(result.months).toBe(1);
    expect(result.tierName).toBe('Monthly');
    expect(result.meetsMinNights).toBe(false);
  });

  it('calculates 28 nights monthly with discount', () => {
    const result = calculateBookingPrice(baseProperty as any, '2026-04-01', '2026-04-29');
    expect(result.nights).toBe(28);
    expect(result.discountPercentage).toBe(10);
    expect(result.subtotal).toBe(2700);
    expect(result.serviceFee).toBe(270);
    expect(result.tax).toBe(Math.round((2700 + 100 + 270) * 0.13));
  });

  it('calculates 90 days quarterly tier', () => {
    const result = calculateBookingPrice(baseProperty as any, '2026-04-01', '2026-06-30');
    expect(result.nights).toBe(90);
    expect(result.tierName).toBe('Quarterly');
    expect(result.months).toBe(3);
    expect(result.discountPercentage).toBe(0);
  });

  it('calculates 365 days annual tier', () => {
    const result = calculateBookingPrice(baseProperty as any, '2026-01-01', '2027-01-01');
    expect(result.nights).toBe(365);
    expect(result.tierName).toBe('Annual');
    expect(result.months).toBeGreaterThanOrEqual(12);
  });

  it('respects explicit quarterly/annual prices', () => {
    const property = { ...baseProperty, priceQuarterly: 2500, priceAnnual: 2000 };
    expect(calculateBookingPrice(property as any, '2026-04-01', '2026-06-30').ratePerMonth).toBe(2500);
    expect(calculateBookingPrice(property as any, '2026-01-01', '2027-01-01').ratePerMonth).toBe(2000);
  });
});

describe('booking date validation', () => {
  it('rejects invalid dates', () => {
    const result = validateBookingDates('bad-date', '2026-04-10');
    expect(result.valid).toBe(false);
  });

  it('rejects checkout before checkin', () => {
    const result = validateBookingDates('2099-04-10', '2099-04-05');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('退房日期');
  });

  it('rejects below min nights', () => {
    const result = validateBookingDates('2099-04-01', '2099-04-10', 28);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('28');
  });

  it('accepts valid range', () => {
    const result = validateBookingDates('2099-04-01', '2099-05-01', 28);
    expect(result.valid).toBe(true);
  });
});

describe('remaining amount', () => {
  it('never returns negative', () => {
    expect(calculateRemainingAmount(1000, 500)).toBe(500);
    expect(calculateRemainingAmount(1000, 1200)).toBe(0);
  });
});
