export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { getDb } from "@/lib/d1";
import { hashSessionToken } from "@/lib/account-auth";
import { getPublicBaseUrl } from "@/lib/config/env";

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))?.split('=').slice(1).join('=');
  if (token) {
    try {
      await getDb().prepare(`UPDATE user_sessions SET revoked_at = ?, last_active_at = ? WHERE token_hash = ? AND revoked_at IS NULL`)
        .bind(new Date().toISOString(), new Date().toISOString(), hashSessionToken(decodeURIComponent(token)))
        .run();
    } catch (error) {
      console.error('auth/logout:revoke-session', error);
    }
  }

  const response = NextResponse.json({ message: "已登出", success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions(request));
  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", getPublicBaseUrl()));
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions(request));
  return response;
}
