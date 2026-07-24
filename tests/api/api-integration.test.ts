/** @jest-environment node */
import bcrypt from 'bcryptjs';
import { GET as healthGet } from '@/app/api/health/route';
import { GET as propertiesGet } from '@/app/api/properties/route';
import { GET as propertyDetailGet } from '@/app/api/properties/[slug]/route';
import { POST as contactPost } from '@/app/api/contact/route';
import { POST as inquiriesPost } from '@/app/api/inquiries/route';
import { POST as bookingsPost, GET as bookingsGet } from '@/app/api/bookings/route';
import { POST as createIntentPost } from '@/app/api/payments/create-intent/route';
import { GET as sessionGet } from '@/app/api/auth/session/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as registerPost } from '@/app/api/auth/register/route';
import { POST as forgotPasswordPost } from '@/app/api/auth/forgot-password/route';
import { NextRequest } from 'next/server';
import { createD1Mock } from '../__mocks__/d1-mock';

// ============================================================
// Shared Mocks - must be before any imports that use these modules
// ============================================================
const mockDb = createD1Mock();

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => mockDb),
  userDb: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10 })),
  checkD1RateLimit: jest.fn(async () => ({ allowed: true, remaining: 10 })),
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCsrf: jest.fn(() => true),
  getCookieValue: jest.fn(() => null),
}));

jest.mock('@/lib/config/env', () => ({
  getPublicBaseUrl: () => 'https://neos.rentals',
  getAuthSecret: () => 'secret-key',
  getBaseUrl: () => 'https://neos.rentals',
}));

jest.mock('@/lib/auth/jwt', () => ({
  signToken: jest.fn(async () => 'signed.token.xyz'),
  verifyToken: jest.fn(async () => ({ userId: 'u1' })),
}));

jest.mock('@/lib/auth/account', () => ({
  requireAccountUser: jest.fn(),
  hashSessionToken: jest.fn((token: string) => `hashed:${token}`),
  getTokenFromRequest: jest.fn(() => null),
}));

jest.mock('@/lib/account-settings', () => ({
  detectDevice: jest.fn(() => 'test-device'),
  getIpFromRequest: jest.fn(() => '127.0.0.1'),
}));

jest.mock('@/lib/api/response', () => ({
  apiError: jest.fn((message: string, status: number, code: string) => {
    const r = new Response(JSON.stringify({ success: false, error: { code, message } }), {
      status,
      headers: { 'content-type': 'application/json' },
    });
    return r;
  }),
  apiSuccess: jest.fn((data: unknown, status = 200) => {
    return new Response(JSON.stringify({ success: true, data }), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }),
}));

// Auth mock for bookings/payments - includes isValidPassword
jest.mock('@/lib/auth', () => ({
  getCurrentUserFromRequest: jest.fn(),
  isValidPassword: jest.fn((pwd: string) => {
    if (!pwd) return { valid: false, message: '密码至少需要6位字符' };
    if (pwd.length < 6) return { valid: false, message: '密码至少需要6位字符' };
    if (!/(?=.*[a-zA-Z])/.test(pwd)) return { valid: false, message: '密码需要包含至少一个字母' };
    if (!/(?=.*\d)/.test(pwd)) return { valid: false, message: '密码需要包含至少一个数字' };
    return { valid: true };
  }),
}));

jest.mock('@/lib/data', () => {
  const mockProperties = [{
    id: 'p1', title: 'Mock Property', location: 'Toronto',
    price: 5000, priceUnit: 'month', rating: 4.0, reviewCount: 5,
    images: ['/m1.jpg'], maxGuests: 2, area: 800,
    bedrooms: 1, bathrooms: 1, amenities: ['WiFi'],
    featured: false, description: 'Mock desc', minNights: 30,
    monthlyDiscount: 0,
  }];
  return {
    getPropertyById: jest.fn((id: string) => {
      if (id === '999') return null;
      return {
        id, title: 'Test Property', location: 'Toronto', price: 5000,
        priceUnit: 'month', rating: 4.5, reviewCount: 10,
        images: ['/img1.jpg'], maxGuests: 4, area: 1000,
        bedrooms: 2, bathrooms: 1, amenities: ['WiFi', 'Pool'],
        featured: false, description: 'A nice place', minNights: 30,
        monthlyDiscount: 10,
      };
    }),
    mockProperties,
  };
});

jest.mock('@/lib/property-db', () => ({
  getPropertyDb: jest.fn(() => {
    throw new Error("D1 database binding 'DB' not found");
  }),
  toPublicProperty: jest.fn((item: unknown) => item),
}));

// Booking/payment related mocks
jest.mock('@/lib/booking-db', () => ({
  bookingDb: {
    create: jest.fn(async (_db: unknown, payload: unknown) => ({
      id: 'b1', bookingNumber: 'BN-001', ...(payload as object),
    })),
    findByUserId: jest.fn(async () => []),
    findById: jest.fn(async () => null),
    update: jest.fn(),
  },
}));

jest.mock('@/lib/payment-db', () => ({
  paymentDb: {
    findByBookingIds: jest.fn(async () => []),
    create: jest.fn(),
    upsertPending: jest.fn(),
  },
}));

jest.mock('@/lib/inquiry-db', () => ({
  inquiryDb: {
    create: jest.fn(async () => ({ id: 'inq1' })),
  },
}));

jest.mock('@/lib/booking', () => ({
  validateBookingDates: jest.fn(() => ({ valid: true })),
  generateBookingNumber: jest.fn(() => 'BN-TEST-001'),
  calculateBookingPrice: jest.fn(() => ({
    basePrice: 5000, cleaningFee: 150, serviceFee: 250,
    discount: 0, discountRate: 0, tax: 650,
    total: 6050, currency: 'CAD', nights: 30,
    stayType: 'MONTHLY', unitCount: 1, unitRate: 5000,
  })),
  normalizeStayType: jest.fn(() => 'MONTHLY'),
  getStayTypeMinimumUnits: jest.fn(() => 1),
}));

jest.mock('@/lib/property-catalog', () => ({
  getPropertySnapshot: jest.fn(() => ({ title: 'Test', id: 'p1' })),
}));

jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(async () => ({
        id: 'pi_test',
        client_secret: 'cs_test',
      })),
    },
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(async () => {}),
  sendBookingReceived: jest.fn(async () => {}),
}));

jest.mock('@/lib/auth/dev-user-store', () => ({
  getDevUserByEmail: jest.fn(() => null),
  addDevUser: jest.fn((opts: Record<string, string>) => ({
    id: 'dev-u1',
    name: opts.name,
    email: opts.email,
    password: opts.password,
    role: 'GUEST',
    createdAt: new Date().toISOString(),
  })),
}));

// After all mocks are set, require the mocked modules
const { userDb } = require('@/lib/d1');
const { getCurrentUserFromRequest } = require('@/lib/auth');
const { getDevUserByEmail, addDevUser } = require('@/lib/auth/dev-user-store');

// ============================================================
// Helper
// ============================================================
function makeReq(path: string, opts: { method?: string; body?: unknown; headers?: Record<string, string>; cookies?: Record<string, string> } = {}): NextRequest {
  const { method = 'GET', body, headers = {}, cookies = {} } = opts;
  const req = new NextRequest(new URL(path, 'http://localhost'), {
    method,
    headers: body != null ? { 'content-type': 'application/json', ...headers } : headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  for (const [k, v] of Object.entries(cookies)) {
    req.cookies.set(k, v);
  }
  return req;
}

// ============================================================
// 1. GET /api/health
// ============================================================
describe('GET /api/health', () => {
  it('returns 200 with valid JSON schema', async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('service', 'stayneos-web');
    expect(body).toHaveProperty('ts');
    expect(() => new Date(body.ts)).not.toThrow();
    expect(new Date(body.ts).toISOString()).toBe(body.ts);
  });
});

// ============================================================
// 2. GET /api/properties
// ============================================================
describe('GET /api/properties', () => {
  it('returns 200 with properties array', async () => {
    const res = await propertiesGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('properties');
    expect(Array.isArray(body.properties)).toBe(true);
    expect(body.properties.length).toBeGreaterThan(0);
  });

  it('each property has required fields', async () => {
    const res = await propertiesGet();
    const body = await res.json();
    const p = body.properties[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('title');
    expect(p).toHaveProperty('address');
    expect(p).toHaveProperty('bedrooms');
    expect(p).toHaveProperty('bathrooms');
    expect(p).toHaveProperty('sqft');
    expect(p).toHaveProperty('priceMonthly');
    expect(p).toHaveProperty('images');
    expect(p).toHaveProperty('status', 'PUBLISHED');
    expect(['MONTHLY', 'NIGHTLY']).toContain(p.defaultStayType);
  });
});

// ============================================================
// 3. GET /api/properties/:id
// ============================================================
describe('GET /api/properties/:id', () => {
  it('returns 200 with property detail for valid slug', async () => {
    const res = await propertyDetailGet(
      makeReq('http://localhost/api/properties/p1'),
      { params: Promise.resolve({ slug: 'p1' }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('property');
    expect(body.property).toHaveProperty('id', 'p1');
    expect(body.property).toHaveProperty('title');
    expect(body.property).toHaveProperty('price');
    expect(body.property).toHaveProperty('bedrooms');
    expect(body.property).toHaveProperty('bathrooms');
    expect(body.property).toHaveProperty('images');
    expect(body.property).toHaveProperty('amenities');
  });

  it('returns 404 for non-existent slug', async () => {
    const res = await propertyDetailGet(
      makeReq('http://localhost/api/properties/999'),
      { params: Promise.resolve({ slug: '999' }) }
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Not found');
  });
});

// ============================================================
// 4. POST /api/contact
// ============================================================
describe('POST /api/contact', () => {
  it('returns 400 on empty body', async () => {
    const res = await contactPost(makeReq('/api/contact', {
      method: 'POST',
      body: {},
    }));
    expect(res.status).toBe(400);
  });

  it('returns 201 on valid body', async () => {
    const res = await contactPost(makeReq('/api/contact', {
      method: 'POST',
      body: { name: 'Test User', email: 'test@example.com', message: 'Hello, I am interested.' },
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });

  it('returns 400 when name is missing', async () => {
    const res = await contactPost(makeReq('/api/contact', {
      method: 'POST',
      body: { email: 'test@example.com', message: 'Hello' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await contactPost(makeReq('/api/contact', {
      method: 'POST',
      body: { name: 'Test', message: 'Hello' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is missing', async () => {
    const res = await contactPost(makeReq('/api/contact', {
      method: 'POST',
      body: { name: 'Test', email: 'test@example.com' },
    }));
    expect(res.status).toBe(400);
  });
});

// ============================================================
// 5. POST /api/inquiries
// ============================================================
describe('POST /api/inquiries', () => {
  it('returns 400 when type is missing', async () => {
    const res = await inquiriesPost(makeReq('/api/inquiries', {
      method: 'POST',
      body: { payload: { email: 'test@test.com' } },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await inquiriesPost(makeReq('/api/inquiries', {
      method: 'POST',
      body: { type: 'invalid_type', payload: { email: 'test@test.com' } },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing in payload', async () => {
    const res = await inquiriesPost(makeReq('/api/inquiries', {
      method: 'POST',
      body: { type: 'contact', payload: { name: 'Test' } },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid contact inquiry', async () => {
    const res = await inquiriesPost(makeReq('/api/inquiries', {
      method: 'POST',
      body: { type: 'contact', payload: { name: 'Test', email: 'test@test.com', message: 'Hi' } },
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });

  it.each(['agents', 'hosts', 'business', 'students', 'long_term', 'market_insights'])(
    'accepts valid type: %s', async (type) => {
      const res = await inquiriesPost(makeReq('/api/inquiries', {
        method: 'POST',
        body: { type, payload: { email: 'test@test.com', firstName: 'A', lastName: 'B' } },
      }));
      expect(res.status).toBe(201);
    }
  );
});

// ============================================================
// 6. GET /api/bookings — Auth Required (401)
// ============================================================
describe('GET /api/bookings (auth required)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    getCurrentUserFromRequest.mockResolvedValueOnce(null);
    const res = await bookingsGet(makeReq('/api/bookings'));
    expect(res.status).toBe(401);
  });

  it('returns bookings list when authenticated', async () => {
    getCurrentUserFromRequest.mockResolvedValueOnce({ userId: 'u1', email: 'test@test.com', role: 'USER' });
    userDb.findByEmail.mockResolvedValueOnce({ id: 'u1', email: 'test@test.com', name: 'Test', role: 'USER' });
    const res = await bookingsGet(makeReq('/api/bookings', {
      cookies: { stayneos_auth_token: 'valid-token' },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('bookings');
    expect(Array.isArray(body.bookings)).toBe(true);
  });
});

// ============================================================
// 7. POST /api/payments/create-intent — Auth Required (401)
// ============================================================
describe('POST /api/payments/create-intent (auth required)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    getCurrentUserFromRequest.mockResolvedValueOnce(null);
    const res = await createIntentPost(makeReq('/api/payments/create-intent', {
      method: 'POST',
      body: { bookingId: 'b1' },
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when bookingId is missing (authenticated)', async () => {
    getCurrentUserFromRequest.mockResolvedValueOnce({ userId: 'u1', email: 'test@test.com', role: 'USER' });
    userDb.findByEmail.mockResolvedValueOnce({ id: 'u1', email: 'test@test.com', role: 'USER' });
    const res = await createIntentPost(makeReq('/api/payments/create-intent', {
      method: 'POST',
      body: {},
    }));
    expect(res.status).toBe(400);
  });
});

// ============================================================
// 8. GET /api/auth/session
// ============================================================
describe('GET /api/auth/session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unauthenticated when no token', async () => {
    const res = await sessionGet(makeReq('/api/auth/session'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });

  it('returns user when token is valid', async () => {
    userDb.findById.mockResolvedValueOnce({
      id: 'u1', name: 'Test', email: 'test@test.com', role: 'USER', avatar: null,
      phone: null, address: null, bio: null, createdAt: '2024-01-01',
      deletionRequestedAt: null, deletionScheduledAt: null, deletionStatus: 'active',
    });

    mockDb.prepare.mockReturnValue({
      bind: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnValue({ id: 's1', revoked_at: null }),
      all: jest.fn().mockReturnValue({ results: [] }),
      run: jest.fn().mockReturnValue(undefined),
      raw: jest.fn().mockReturnValue([]),
    });

    const req = makeReq('/api/auth/session', {
      cookies: { stayneos_auth_token: 'valid-token' },
    });
    const res = await sessionGet(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).not.toBeNull();
    expect(body.user.email).toBe('test@test.com');
  });
});

// ============================================================
// 9. POST /api/auth/login
// ============================================================
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 with wrong password', async () => {
    // mockImplementation so clearAllMocks doesn't clear it
    userDb.findByEmail.mockImplementation(async () => {
      const hashed = await bcrypt.hash('correct-password', 4);
      return {
        id: 'u1', email: 'test@test.com', name: 'Test', role: 'USER',
        password: hashed, deletionStatus: 'active',
        deletionRequestedAt: null, deletionScheduledAt: null, tokenVersion: 0,
      };
    });

    const res = await loginPost(makeReq('/api/auth/login', {
      method: 'POST',
      body: { email: 'test@test.com', password: 'wrong-password' },
    }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });

  it('returns 400 when email is empty', async () => {
    const res = await loginPost(makeReq('/api/auth/login', {
      method: 'POST',
      body: { email: '', password: 'pass123' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is empty', async () => {
    const res = await loginPost(makeReq('/api/auth/login', {
      method: 'POST',
      body: { email: 'test@test.com', password: '' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 401 for non-existent user', async () => {
    userDb.findByEmail.mockResolvedValueOnce(null);
    // Dev store should also return null
    getDevUserByEmail.mockReturnValueOnce(null);
    const res = await loginPost(makeReq('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@test.com', password: 'pass123' },
    }));
    expect(res.status).toBe(401);
  });
});

// ============================================================
// 10. POST /api/auth/register
// ============================================================
describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDevUserByEmail.mockReturnValue(null);
  });

  it('returns 400 when name is missing', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { email: 'new@test.com', password: 'Strong1' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', password: 'Strong1' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', email: 'new@test.com' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', email: 'not-an-email', password: 'Strong1' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for password < 6 chars', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', email: 'new@test.com', password: 'Ab1' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for password without letters', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', email: 'new@test.com', password: '12345678' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for password without numbers', async () => {
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test', email: 'new@test.com', password: 'abcdefgh' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid registration (dev store)', async () => {
    // Throw on getDb so the route falls back to dev store
    const { getDb: gdb } = require('@/lib/d1');
    gdb.mockImplementationOnce(() => { throw new Error('D1 unavailable'); });

    addDevUser.mockReturnValueOnce({
      id: 'new-u1', name: 'Test User', email: 'new@test.com',
      password: 'hashed', role: 'GUEST', createdAt: '2024-01-01T00:00:00.000Z',
    });
    const res = await registerPost(makeReq('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test User', email: 'new@test.com', password: 'Strong1' },
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(/注册成功/);
    expect(body.user).toHaveProperty('email', 'new@test.com');
  });
});

// ============================================================
// 11. POST /api/auth/forgot-password
// ============================================================
describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const res = await forgotPasswordPost(makeReq('/api/auth/forgot-password', {
      method: 'POST',
      body: {},
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await forgotPasswordPost(makeReq('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'bad-email' },
    }));
    expect(res.status).toBe(400);
  });

  it('returns 200 even for non-existent email (no enumeration)', async () => {
    userDb.findByEmail.mockResolvedValueOnce(null);
    const res = await forgotPasswordPost(makeReq('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'nonexistent@test.com' },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });

  it('returns 200 for valid email (existing user)', async () => {
    userDb.findByEmail.mockResolvedValueOnce({
      id: 'u1', email: 'test@test.com', name: 'Test',
    });
    const res = await forgotPasswordPost(makeReq('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: 'test@test.com' },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });
});
