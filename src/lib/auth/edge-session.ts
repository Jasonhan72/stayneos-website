import { jwtVerify } from 'jose';

export interface SessionEnv {
  DB: D1Database;
  NEXTAUTH_SECRET_PROD?: string;
  NEXTAUTH_SECRET?: string;
  JWT_SECRET?: string;
}

export interface SessionIdentity {
  userId: string;
  tv: number;
  exp: number;
  tokenHash: string;
}

export async function isSessionActive(identity: SessionIdentity, db: D1Database): Promise<boolean> {
  if (!identity.userId || !Number.isFinite(identity.exp) || identity.exp <= Date.now() / 1000) return false;
  try {
    const user = await db.prepare('SELECT id, token_version AS tokenVersion, deletionStatus FROM User WHERE id = ?')
      .bind(identity.userId).first<{ id: string; tokenVersion: number; deletionStatus: string }>();
    if (!user || user.deletionStatus !== 'active' || (user.tokenVersion ?? 0) !== identity.tv) return false;
    const session = await db.prepare('SELECT revoked_at FROM user_sessions WHERE token_hash = ? AND user_id = ? LIMIT 1')
      .bind(identity.tokenHash, identity.userId).first<{ revoked_at: string | null }>();
    // Legacy sessions may have no row, but must still pass account/version checks.
    return !session?.revoked_at;
  } catch {
    return false;
  }
}

export async function verifySessionToken(token: string, env: SessionEnv): Promise<SessionIdentity | null> {
  const secret = env.NEXTAUTH_SECRET_PROD || env.NEXTAUTH_SECRET || env.JWT_SECRET;
  if (!secret || !token || token.length > 16384) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret.trim()), { algorithms: ['HS256'], requiredClaims: ['exp', 'iat'] });
    if (typeof payload.userId !== 'string' || !payload.userId || typeof payload.exp !== 'number') return null;
    const tv = payload.tv ?? 0;
    if (!Number.isInteger(tv) || Number(tv) < 0) return null;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const identity = { userId: payload.userId, tv: Number(tv), exp: payload.exp, tokenHash };
    return await isSessionActive(identity, env.DB) ? identity : null;
  } catch {
    return null;
  }
}

function cookieValue(request: Request, name: string): string | null {
  const part = (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  if (!part) return null;
  try { return decodeURIComponent(part.slice(name.length + 1)); } catch { return null; }
}

export async function authenticateWorkerRequest(request: Request, env: SessionEnv): Promise<SessionIdentity | null> {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    return authorization.startsWith('Bearer ') ? verifySessionToken(authorization.slice(7).trim(), env) : null;
  }
  // Cookie-authenticated writes require the same double-submit CSRF token as the app.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const csrf = cookieValue(request, 'stayneos_csrf');
    if (!csrf || csrf !== request.headers.get('x-csrf-token')) return null;
  }
  const token = cookieValue(request, 'stayneos_auth_token') || cookieValue(request, 'auth-token') || cookieValue(request, 'auth_token');
  return token ? verifySessionToken(token, env) : null;
}
