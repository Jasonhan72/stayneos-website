/** @jest-environment node */
import bcrypt from 'bcryptjs';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { GET as sessionGet } from '@/app/api/auth/session/route';
import { GET as googleGet } from '@/app/api/auth/google/route';
import { NextRequest } from 'next/server';
import { createD1Mock } from '../__mocks__/d1-mock';

// Mock jwt
jest.mock('@/lib/auth/jwt', () => ({
  signToken: jest.fn(async () => 'signed.token.xyz'),
  verifyToken: jest.fn(async () => ({ userId: 'u1' })),
}));

// Mock D1 with a proper chainable object
const mockDb = createD1Mock();

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => mockDb),
  userDb: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  },
}));

// Mock security utilities (rate-limit, csrf)
jest.mock('@/lib/security/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10 })),
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCsrf: jest.fn(() => true),
  getCookieValue: jest.fn(() => null),
}));

// Mock account-settings (used in login for detectDevice / getIpFromRequest)
jest.mock('@/lib/account-settings', () => ({
  detectDevice: jest.fn(() => 'test-device'),
  getIpFromRequest: jest.fn(() => '127.0.0.1'),
}));

// Mock config/env
jest.mock('@/lib/config/env', () => ({
  getPublicBaseUrl: () => 'https://neos.rentals',
  getAuthSecret: () => 'secret-key',
}));

// Mock auth/account (hashSessionToken)
jest.mock('@/lib/auth/account', () => ({
  requireAccountUser: jest.fn(),
  hashSessionToken: jest.fn((token: string) => `hashed:${token}`),
  getTokenFromRequest: jest.fn(() => null),
}));

const { userDb } = require('@/lib/d1');

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'gid';
  });

  it('/api/auth/login success', async () => {
    const hashed = await bcrypt.hash('password123', 4);
    userDb.findByEmail.mockResolvedValue({
      id: 'u1', email: 'a@b.com', name: 'A', role: 'USER', password: hashed,
      deletionStatus: 'active', deletionRequestedAt: null, deletionScheduledAt: null,
    });

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'password123' }),
    });

    const res = await loginPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('a@b.com');
    expect(res.headers.get('set-cookie')).toContain('stayneos_auth_token');
  });

  it('/api/auth/logout clears cookie', async () => {
    const req = new NextRequest('http://localhost/api/auth/logout', { method: 'POST' });
    const res = await logoutPost(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('/api/auth/session returns unauthenticated when no token', async () => {
    const req = new NextRequest('http://localhost/api/auth/session');
    const res = await sessionGet(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });

  it('/api/auth/session returns user when token valid', async () => {
    userDb.findById.mockResolvedValue({ id: 'u1', name: 'U', email: 'u@u.com', role: 'USER', avatar: null });

    // Update mockDb to return a non-revoked session row
    mockDb.prepare.mockReturnValue({
      bind: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnValue({ id: 's1', revoked_at: null }),
      all: jest.fn().mockReturnValue({ results: [] }),
      run: jest.fn().mockReturnValue(undefined),
      raw: jest.fn().mockReturnValue([]),
    });

    const req = new NextRequest('http://localhost/api/auth/session', {
      headers: { cookie: 'stayneos_auth_token=token-123' },
    });
    // NextRequest.cookies requires the cookie to be properly parsed
    // Set cookie via the internal cookie store
    req.cookies.set('stayneos_auth_token', 'token-123');

    const res = await sessionGet(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('u@u.com');
  });

  it('/api/auth/google redirects to oauth provider and sets oauth_state cookie', async () => {
    const req = new NextRequest('https://neos.rentals/api/auth/google?redirect=/dashboard');
    const res = await googleGet(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('accounts.google.com/o/oauth2/v2/auth');
    expect(res.headers.get('set-cookie')).toContain('oauth_state=');
  });
});
