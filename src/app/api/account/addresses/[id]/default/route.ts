import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/auth/account";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const db = getDb();
  const existing = await db.prepare(`SELECT id FROM user_addresses WHERE id = ? AND user_id = ?`).bind(id, auth.userId).first();
  if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  const now = new Date().toISOString();
  await db.prepare(`UPDATE user_addresses SET is_default = 0, updated_at = ? WHERE user_id = ?`).bind(now, auth.userId).run();
  await db.prepare(`UPDATE user_addresses SET is_default = 1, updated_at = ? WHERE id = ? AND user_id = ?`).bind(now, id, auth.userId).run();
  return NextResponse.json({ ok: true });
}
