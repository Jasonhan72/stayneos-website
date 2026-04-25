import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const db = getDb();
  const existing = await db.prepare(`SELECT id, token_hash FROM user_sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL`).bind(id, auth.userId).first<{ id: string; token_hash: string }>();
  if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const now = new Date().toISOString();
  await db.prepare(`UPDATE user_sessions SET revoked_at = ?, last_active_at = ? WHERE id = ?`).bind(now, now, id).run();

  const response = NextResponse.json({ ok: true, currentSessionRevoked: existing.token_hash === auth.tokenHash });
  if (existing.token_hash === auth.tokenHash) {
    response.cookies.set(AUTH_COOKIE_NAME, '', getClearedAuthCookieOptions(request));
  }
  return response;
}
