/** @jest-environment node */
import { POST as createBooking } from '@/app/api/bookings/route';
import { GET as listProperties } from '@/app/api/properties/route';
import { NextRequest } from 'next/server';

// Mock auth (getCurrentUserFromRequest)
jest.mock('@/lib/auth', () => ({
  getCurrentUserFromRequest: jest.fn(async () => ({ userId: 'u1', email: 'guest@test.com', role: 'USER' })),
}));

// Mock D1 with proper chainable
const mockDb = {
  prepare: jest.fn().mockReturnValue({
    bind: jest.fn().mockReturnThis(),
    first: jest.fn().mockReturnValue({ id: 'p1', slug: 'p1', status: 'PUBLISHED' }),
    all: jest.fn().mockReturnValue({ results: [] }),
    run: jest.fn().mockReturnValue(undefined),
    raw: jest.fn().mockReturnValue([]),
  }),
};

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => mockDb),
  userDb: {
    findByEmail: jest.fn(async () => ({ id: 'u1', email: 'guest@test.com', name: 'Guest' })),
    findById: jest.fn(),
  },
}));

// Mock security (rate-limit / csrf)
jest.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10 })),
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCsrf: jest.fn(() => true),
  getCookieValue: jest.fn(() => null),
}));

// Mock config/env
jest.mock('@/lib/config/env', () => ({
  getPublicBaseUrl: () => 'https://neos.rentals',
  getAuthSecret: () => 'secret-key',
}));

// Mock data
jest.mock('@/lib/data', () => ({
  getPropertyById: jest.fn(() => ({
    id: 'p1', title: 'A', location: 'Toronto', price: 3000, priceUnit: 'month', reviewCount: 0, images: [], maxGuests: 2, area: 500, bedrooms: 1, bathrooms: 1, amenities: [], minNights: 28,
  })),
  mockProperties: [{ id: 'p1', title: 'A', location: 'Toronto', price: 3000, priceUnit: 'month', bedrooms: 1, bathrooms: 1, area: 500, description: '', images: [], amenities: [], minNights: 28, maxGuests: 2, featured: false }],
}));

// Mock booking-db
jest.mock('@/lib/booking-db', () => ({
  bookingDb: {
    create: jest.fn(async (_db: any, payload: any) => ({ id: 'b1', ...payload })),
    findByUserId: jest.fn(async () => []),
  },
}));

// Mock payment-db (used by bookings route POST)
jest.mock('@/lib/payment-db', () => ({
  paymentDb: {
    findByBookingIds: jest.fn(async () => []),
    create: jest.fn(),
  },
}));

// Mock property-db: throw D1-missing error so route falls back to mockProperties
jest.mock('@/lib/property-db', () => {
  const actual = jest.requireActual('@/lib/property-db');
  return {
    ...actual,
    getPropertyDb: jest.fn(() => {
      throw new Error("D1 database binding 'DB' not found");
    }),
  };
});

// Mock jwt
jest.mock('@/lib/auth/jwt', () => ({
  signToken: jest.fn(async () => 'signed.token'),
  verifyToken: jest.fn(async () => ({ userId: 'u1' })),
}));

// Mock auth/account
jest.mock('@/lib/auth/account', () => ({
  hashSessionToken: jest.fn((token: string) => `hashed:${token}`),
  getTokenFromRequest: jest.fn(() => null),
  requireAccountUser: jest.fn(),
}));

// Mock api/response
jest.mock('@/lib/api/response', () => ({
  apiError: jest.fn((message: string, status: number, code: string) => {
    const r = new Response(JSON.stringify({ message, code }), { status });
    return r;
  }),
}));

describe('booking & properties routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    // properties route throws D1-missing error → falls back to mockProperties
    const res = await listProperties();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.properties)).toBe(true);
    expect(body.properties.length).toBeGreaterThan(0);
  });
});
