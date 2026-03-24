/** @jest-environment node */
jest.mock('jose', () => ({
  SignJWT: class {
    payload: any;
    constructor(payload: any) { this.payload = payload; }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return 'mock.jwt.token'; }
  },
  jwtVerify: jest.fn(async () => ({ payload: { userId: 'u1', role: 'USER' } })),
}));

jest.mock('@/lib/config/env', () => ({ getAuthSecret: () => 'unit-test-secret-key' }));

import { signToken, verifyToken } from '@/lib/auth/jwt';

const { jwtVerify } = require('jose');

describe('jwt utils', () => {
  it('signs and verifies token', async () => {
    const token = await signToken({ userId: 'u1', role: 'USER' }, '1h');
    const payload = await verifyToken(token);
    expect(token).toBe('mock.jwt.token');
    expect(payload?.userId).toBe('u1');
  });

  it('returns null for invalid token', async () => {
    jwtVerify.mockRejectedValueOnce(new Error('bad token'));
    const payload = await verifyToken('invalid.token.value');
    expect(payload).toBeNull();
  });
});
