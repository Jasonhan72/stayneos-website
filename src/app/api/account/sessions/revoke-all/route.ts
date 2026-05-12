import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE user_sessions
    SET revoked_at = ?, last_active_at = ?
    WHERE user_id = ? AND revoked_at IS NULL AND token_hash <> ?
  `).bind(now, now, auth.userId, auth.tokenHash).run();
  return NextResponse.json({ ok: true });
}
