/** @jest-environment node */
import bcrypt from 'bcryptjs';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as logoutPost } from '@/app/api/auth/logout/route';
import { GET as sessionGet } from '@/app/api/auth/session/route';
import { GET as googleGet } from '@/app/api/auth/google/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/jwt', () => ({
  signToken: jest.fn(async () => 'signed.token'),
  verifyToken: jest.fn(async () => ({ userId: 'u1' })),
}));

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => ({})),
  userDb: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('@/lib/config/env', () => ({
  getPublicBaseUrl: () => 'https://neos.rentals',
  getAuthSecret: () => 'secret-key',
}));

const { userDb } = require('@/lib/d1');

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'gid';
  });

  it('/api/auth/login success', async () => {
    const hashed = await bcrypt.hash('password123', 4);
    userDb.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', name: 'A', role: 'USER', password: hashed });

    const req = new Request('http://localhost/api/auth/login', {
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
    const res = await logoutPost();
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
    const req = new NextRequest('http://localhost/api/auth/session', {
      headers: { cookie: 'stayneos_auth_token=token-123' },
    });
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
