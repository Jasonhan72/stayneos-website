import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/auth/cookie';
import { getDb } from '@/lib/d1';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/become-host
 * Sets the authenticated user's role to HOST and issues a new JWT.
 * Called after the become-a-host form is submitted.
 */
export async function POST(request: Request) {
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
    await db
      .prepare("UPDATE User SET role = 'HOST', updatedAt = ? WHERE id = ?")
      .bind(now, user.userId)
      .run();

    // Issue a fresh JWT with the new role
    const newToken = await signToken({
      userId: user.userId,
      email: user.email,
      role: 'HOST',
    });

    const response = NextResponse.json({ role: 'HOST', alreadyHost: false });
    response.cookies.set(AUTH_COOKIE_NAME, newToken, getAuthCookieOptions(request));
    return response;
  } catch (error) {
    console.error('become-host error:', error);
    return NextResponse.json({ error: 'Failed to upgrade role' }, { status: 500 });
  }
}
