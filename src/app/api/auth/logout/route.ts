export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { getDb } from "@/lib/d1";
import { hashSessionToken } from "@/lib/auth/account";
import { getPublicBaseUrl } from "@/lib/config/env";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))?.split('=').slice(1).join('=');
  let decoded: string | null = null;
  try { decoded = token ? decodeURIComponent(token) : null; } catch { /* Clear malformed cookies without a DB write. */ }
  if (decoded) {
    try {
      const payload = await verifyToken(decoded);
      if (typeof payload?.userId === 'string') {
        const now = new Date().toISOString();
        // Registration and older OAuth sessions may not have a session row yet.
        // Keep a revocation record for those tokens too.
        await getDb().prepare(`
          INSERT INTO user_sessions (id, user_id, token_hash, last_active_at, created_at, revoked_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(token_hash) DO UPDATE SET revoked_at = excluded.revoked_at, last_active_at = excluded.last_active_at
        `).bind(crypto.randomUUID(), payload.userId, hashSessionToken(decoded), now, now, now).run();
      }
    } catch {
      return NextResponse.json({ error: 'Unable to revoke session. Please retry.' }, { status: 503 });
    }
  }

  const response = NextResponse.json({ message: "已登出", success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions(request));
  return response;
}

export async function GET(request: Request) {
  const revoked = await POST(request);
  if (!revoked.ok) return revoked;
  const response = NextResponse.redirect(new URL("/login", getPublicBaseUrl()));
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions(request));
  return response;
}
