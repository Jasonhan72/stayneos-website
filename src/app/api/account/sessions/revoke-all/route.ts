import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const now = new Date().toISOString();
  // Revoke all other sessions in user_sessions table
  await db.prepare(`
    UPDATE user_sessions
    SET revoked_at = ?, last_active_at = ?
    WHERE user_id = ? AND revoked_at IS NULL AND token_hash <> ?
  `).bind(now, now, auth.userId, auth.tokenHash).run();
  // Also increment token_version to invalidate any JWT-only sessions
  await db.prepare(`
    UPDATE User SET token_version = token_version + 1, updatedAt = ? WHERE id = ?
  `).bind(now, auth.userId).run();
  return NextResponse.json({ ok: true });
}
