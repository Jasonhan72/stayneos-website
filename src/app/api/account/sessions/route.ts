import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";

export const dynamic = "force-dynamic";

function mapRow(row: Record<string, unknown>, tokenHash: string) {
  return {
    id: row.id,
    device: row.device || 'Unknown device',
    ip: row.ip || null,
    userAgent: row.user_agent || null,
    location: row.location || null,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
    revokedAt: row.revoked_at || null,
    isCurrent: row.token_hash === tokenHash,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const rows = await db.prepare(`
    SELECT * FROM user_sessions
    WHERE user_id = ? AND revoked_at IS NULL
    ORDER BY CASE WHEN token_hash = ? THEN 0 ELSE 1 END, last_active_at DESC
  `).bind(auth.userId, auth.tokenHash).all<Record<string, unknown>>();
  return NextResponse.json({ sessions: (rows.results || []).map((row) => mapRow(row, auth.tokenHash)) });
}
