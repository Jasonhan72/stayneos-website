import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCurrentUserFromRequest } from "@/lib/auth/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { getDb, userDb, type User } from "@/lib/d1";

export type AuthenticatedAccountRequest = {
  userId: string;
  token: string;
  tokenHash: string;
  user: User;
};

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

export async function requireAccountUser(request: NextRequest): Promise<AuthenticatedAccountRequest | NextResponse> {
  const auth = await getCurrentUserFromRequest(request);
  const token = getTokenFromRequest(request);

  if (!auth?.userId || !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const user = await userDb.findById(db, auth.userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenHash = hashSessionToken(token);
  const session = await db
    .prepare(`SELECT id, revoked_at FROM user_sessions WHERE token_hash = ? LIMIT 1`)
    .bind(tokenHash)
    .first<{ id: string; revoked_at: string | null }>();

  if (session?.revoked_at) {
    const response = NextResponse.json({ error: "Session revoked" }, { status: 401 });
    response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions(request));
    return response;
  }

  if (session?.id) {
    await db
      .prepare(`UPDATE user_sessions SET last_active_at = ? WHERE id = ?`)
      .bind(new Date().toISOString(), session.id)
      .run();
  }

  return { userId: auth.userId, token, tokenHash, user };
}
