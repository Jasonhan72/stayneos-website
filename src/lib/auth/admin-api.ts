import { jwtVerify } from 'jose';

export type UserRole = 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  return new TextEncoder().encode(secret);
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
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
