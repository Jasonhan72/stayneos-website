import { jwtVerify } from 'jose';
import { getAuthSecret } from '@/lib/config/env';

export type UserRole = 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tv?: number;
}

async function validateTokenVersion(payload: Record<string, unknown>): Promise<boolean> {
  const tv = payload.tv;
  if (tv === undefined || tv === null) return true;
  const userId = payload.userId as string | undefined;
  if (!userId) return false;
  try {
    const { getDb, userDb } = await import('@/lib/d1');
    const db = getDb();
    const user = await userDb.findById(db, userId);
    if (!user) return false;
    const currentTv = user.tokenVersion ?? 0;
    return Number(tv) === currentTv;
  } catch {
    return true; // fail open for availability
  }
}

function getSecret() {
  return new TextEncoder().encode(getAuthSecret());
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();

  const cookie = request.headers.get('cookie') || '';
  const pieces = cookie.split(';').map((s) => s.trim());
  const tokenCookie = pieces.find((s) => s.startsWith('stayneos_auth_token='))
    || pieces.find((s) => s.startsWith('auth-token='))
    || pieces.find((s) => s.startsWith('auth_token='));

  if (!tokenCookie) return null;
  return decodeURIComponent(tokenCookie.split('=').slice(1).join('='));
}

export async function verifyRequestAuth(request: Request): Promise<TokenPayload | null> {
  const token = extractToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    if (!(await validateTokenVersion(payload as Record<string, unknown>))) return null;
    return {
      userId: String(payload.userId || ''),
      email: String(payload.email || ''),
      role: (payload.role as UserRole) || 'GUEST',
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request): Promise<TokenPayload> {
  const user = await verifyRequestAuth(request);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
