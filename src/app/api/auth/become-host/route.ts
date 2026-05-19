import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/auth/cookie';
import { getDb } from '@/lib/d1';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/become-host
 * Sets the authenticated user's role to HOST and issues a new JWT.
 * Called after the become-a-host form is submitted.
 */
export async function POST(request: Request) {
  // Rate limit: max 5 attempts per minute per IP
  const rate = checkRateLimit(request, 'become-host', { limit: 5, windowMs: 60_000 });
  if (!rate.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const user = await verifyRequestAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  // Already a host / admin — nothing to do
  if (['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return NextResponse.json({ role: user.role, alreadyHost: true });
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();

    // Upgrade role to HOST in the DB
    const updated = await db
      .prepare("UPDATE User SET role = 'HOST', updatedAt = ? WHERE id = ? RETURNING token_version")
      .bind(now, user.userId)
      .first<{ token_version: number }>();

    // Issue a fresh JWT with the new role
    const newToken = await signToken({
      userId: user.userId,
      email: user.email,
      role: 'HOST',
      tv: updated?.token_version ?? 0,
    });

    const response = NextResponse.json({ role: 'HOST', alreadyHost: false });
    response.cookies.set(AUTH_COOKIE_NAME, newToken, getAuthCookieOptions(request));
    return response;
  } catch (error) {
    console.error('become-host error:', error);
    return NextResponse.json({ error: 'Failed to upgrade role' }, { status: 500 });
  }
}
