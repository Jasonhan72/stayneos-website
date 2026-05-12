import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    status: row.status,
    fileUrl: row.file_url,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    expiresAt: row.expires_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const rows = await db.prepare(`SELECT * FROM data_export_requests WHERE user_id = ? ORDER BY requested_at DESC`).bind(auth.userId).all<Record<string, unknown>>();
  return NextResponse.json({ requests: (rows.results || []).map(mapRow), todo: 'Background export generation pending' });
}

export async function POST(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const last = await db.prepare(`SELECT requested_at FROM data_export_requests WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1`).bind(auth.userId).first<{ requested_at: string }>();
  if (last?.requested_at) {
    const diff = Date.now() - new Date(last.requested_at).getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'You can request a data export once every 24 hours.' }, { status: 429 });
    }
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO data_export_requests (id, user_id, status, file_url, requested_at, completed_at, expires_at, created_at, updated_at)
    VALUES (?, ?, 'pending', NULL, ?, NULL, NULL, ?, ?)
  `).bind(id, auth.userId, now, now, now).run();

  const row = await db.prepare(`SELECT * FROM data_export_requests WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  return NextResponse.json({ request: row ? mapRow(row) : null, todo: 'Background export generation pending' }, { status: 201 });
}
