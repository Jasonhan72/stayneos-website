/** @jest-environment node */
import { POST as createBooking } from '@/app/api/bookings/route';
import { GET as listProperties } from '@/app/api/properties/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth', () => ({
  getCurrentUserFromRequest: jest.fn(async () => ({ email: 'guest@test.com' })),
}));

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => ({})),
  userDb: { findByEmail: jest.fn(async () => ({ id: 'u1', email: 'guest@test.com', name: 'Guest' })) },
}));

jest.mock('@/lib/data', () => ({
  getPropertyById: jest.fn(() => ({
    id: 'p1', title: 'A', location: 'Toronto', price: 3000, priceUnit: 'month', reviewCount: 0, images: [], maxGuests: 2, area: 500, bedrooms: 1, bathrooms: 1, amenities: [], minNights: 28,
  })),
  mockProperties: [{ id: 'p1', title: 'A', location: 'Toronto', price: 3000, priceUnit: 'month', bedrooms: 1, bathrooms: 1, area: 500, description: '', images: [], amenities: [], minNights: 28, maxGuests: 2, featured: false }],
}));

jest.mock('@/lib/booking-db', () => ({
  bookingDb: {
    create: jest.fn(async (_db: any, payload: any) => ({ id: 'b1', ...payload })),
  },
}));

jest.mock('@/lib/property-db', () => ({
  getPropertyDb: jest.fn(() => ({ prepare: () => ({ all: async () => ({ results: [] }) }) })),
  toPublicProperty: jest.fn((x) => x),
}));

describe('booking & properties routes', () => {
  it('/api/bookings creates booking', async () => {
    const req = new NextRequest('http://localhost/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ propertyId: 'p1', checkIn: '2099-04-01', checkOut: '2099-05-01', guests: 1 }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await createBooking(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.booking.id).toBe('b1');
  });

  it('/api/properties returns property list', async () => {
    const res = await listProperties();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.properties)).toBe(true);
    expect(body.properties.length).toBeGreaterThan(0);
  });
});
