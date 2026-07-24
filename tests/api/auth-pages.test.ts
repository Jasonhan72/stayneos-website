/** @jest-environment node */
import { NextRequest } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(async () => ({ payload: { userId: 'u1', email: 'test@test.com', role: 'GUEST' } })),
}));

jest.mock('@/lib/config/env', () => ({
  getPublicBaseUrl: () => 'https://www.stayneos.com',
  getAuthSecret: () => 'test-secret-key-for-jwt',
}));

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => ({
    prepare: jest.fn().mockReturnValue({
      bind: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnValue(null),
      all: jest.fn().mockReturnValue({ results: [] }),
      run: jest.fn(),
      raw: jest.fn().mockReturnValue([]),
    }),
  })),
  userDb: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  },
}));

import { middleware } from '@/middleware';

function makeMWRequest(pathname: string, opts: { cookies?: Record<string, string>; host?: string } = {}): NextRequest {
  const { cookies = {}, host = 'www.stayneos.com' } = opts;
  const url = `http://${host}${pathname}`;
  const req = new NextRequest(url, {
    headers: { host },
  });
  for (const [k, v] of Object.entries(cookies)) {
    req.cookies.set(k, v);
  }

  // Use real NextURL so .clone() and NextResponse.redirect() work
  Object.defineProperty(req, 'nextUrl', {
    value: new NextURL(url),
    writable: true,
  });

  return req;
}

// ============================================================
// Canonical Domain Redirect
// ============================================================
describe('Middleware Canonical Domain Redirect', () => {
  it.each([
    'stayneos.com',
    'neos.rentals',
    'www.neos.rentals',
  ])('redirects %s → www.stayneos.com', async (host) => {
    const req = makeMWRequest('/', { host });
    const res = await middleware(req);
    expect(res.status).toBe(301);
    const location = res.headers.get('location');
    expect(location).toContain('www.stayneos.com');
  });
});

// ============================================================
// Protected Routes — Redirect to /login When Unauthenticated
// ============================================================
describe('Auth Middleware - Protected Routes', () => {
  it.each([
    '/dashboard',
    '/bookings',
    '/account',
    '/host',
    '/checkout',
  ])('redirects %s → /login when unauthenticated', async (path) => {
    const req = makeMWRequest(path);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('callbackUrl=');
  });

  it.each([
    '/dashboard/bookings',
    '/dashboard/wishlists',
    '/account/notifications',
    '/bookings/123',
    '/checkout/payment',
  ])('redirects %s → /login (prefix match)', async (path) => {
    const req = makeMWRequest(path);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
  });

  it('redirects /wishlists → /dashboard/wishlists (route dedup)', async () => {
    const req = makeMWRequest('/wishlists');
    const res = await middleware(req);
    expect(res.status).toBe(308);
    const location = res.headers.get('location');
    expect(location).toContain('/dashboard/wishlists');
  });

  it('redirects /messages → /dashboard/messages (route dedup)', async () => {
    const req = makeMWRequest('/messages');
    const res = await middleware(req);
    expect(res.status).toBe(308);
    const location = res.headers.get('location');
    expect(location).toContain('/dashboard/messages');
  });

  // Public pages — no redirect
  it.each(['/', '/login', '/register', '/forgot-password'])(
    'allows access to %s when unauthenticated', async (path) => {
      const req = makeMWRequest(path);
      const res = await middleware(req);
      expect(res.status).not.toBe(307);
      expect(res.status).not.toBe(301);
    }
  );

  it('passes through API routes without redirect', async () => {
    const req = makeMWRequest('/api/health');
    const res = await middleware(req);
    expect(res.status).not.toBe(307);
    expect(res.status).not.toBe(301);
  });
});

// ============================================================
// Auth Pages — Export Valid React Components
// ============================================================
describe('Auth Page Components', () => {
  it('/login page exports a React component', async () => {
    const mod = await import('@/app/(auth)/login/page');
    expect(mod).toHaveProperty('default');
    expect(typeof mod.default).toBe('function');
  });

  it('/register page exports a React component', async () => {
    const mod = await import('@/app/(auth)/register/page');
    expect(mod).toHaveProperty('default');
    expect(typeof mod.default).toBe('function');
  });

  it('/forgot-password page exports a React component', async () => {
    const mod = await import('@/app/(auth)/forgot-password/page');
    expect(mod).toHaveProperty('default');
    expect(typeof mod.default).toBe('function');
  });
});
