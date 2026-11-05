/** @jest-environment node */
jest.mock('jose', () => ({ jwtVerify: jest.fn() }));
jest.mock('@/lib/auth/jwt', () => ({ verifyToken: jest.fn() }));
const mockFirst = jest.fn();
const mockDb = { prepare: jest.fn(() => ({ bind: jest.fn(() => ({ first: mockFirst })) })) };
jest.mock('@/lib/d1', () => ({ getDb: () => mockDb }));

import { getCurrentUserFromRequest } from '@/lib/auth/server';
import { verifyToken } from '@/lib/auth/jwt';

const verify = jest.mocked(verifyToken);
const request = () => new Request('https://local.test/api/bookings', { headers: { authorization: 'Bearer local-test-token' } });
beforeEach(() => {
  jest.clearAllMocks();
  verify.mockResolvedValue({ userId: 'owner', exp: Math.floor(Date.now() / 1000) + 60, tv: 0 });
  mockFirst.mockReset();
});
test('accepts an active account with a non-revoked legacy session', async () => {
  mockFirst.mockResolvedValueOnce({ id: 'owner', tokenVersion: 0, deletionStatus: 'active' }).mockResolvedValueOnce(null);
  expect((await getCurrentUserFromRequest(request()))?.userId).toBe('owner');
});
test.each([
  { user: null, session: null },
  { user: { id: 'owner', tokenVersion: 1, deletionStatus: 'active' }, session: null },
  { user: { id: 'owner', tokenVersion: 0, deletionStatus: 'pending_deletion' }, session: null },
  { user: { id: 'owner', tokenVersion: 0, deletionStatus: 'active' }, session: { revoked_at: 'now' } },
])('denies deleted accounts and revoked sessions: %j', async ({ user, session }) => {
  mockFirst.mockResolvedValueOnce(user).mockResolvedValueOnce(session);
  expect(await getCurrentUserFromRequest(request())).toBeNull();
});
test('database failure denies access', async () => {
  mockFirst.mockRejectedValueOnce(new Error('Database unavailable'));
  expect(await getCurrentUserFromRequest(request())).toBeNull();
});
test('malformed cookies fail without throwing', async () => {
  expect(await getCurrentUserFromRequest(new Request('https://local.test', { headers: { cookie: 'stayneos_auth_token=%ZZ' } }))).toBeNull();
});
test('invalid bearer cannot fall back to a different cookie identity', async () => {
  verify.mockResolvedValueOnce(null);
  expect(await getCurrentUserFromRequest(new Request('https://local.test', { headers: { authorization: 'Bearer invalid', cookie: 'stayneos_auth_token=valid-cookie' } }))).toBeNull();
  expect(verify).toHaveBeenCalledTimes(1);
});
