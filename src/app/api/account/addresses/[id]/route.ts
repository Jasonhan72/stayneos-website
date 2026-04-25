import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";

export const dynamic = "force-dynamic";

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    region: row.region,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: Number(row.is_default || 0) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const db = getDb();
  const existing = await db.prepare(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`).bind(id, auth.userId).first<Record<string, unknown>>();
  if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

  const body = await request.json() as Record<string, unknown>;
  const now = new Date().toISOString();
  const next = {
    label: typeof body.label === 'string' ? body.label.trim() : String(existing.label || ''),
    line1: typeof body.line1 === 'string' ? body.line1.trim() : String(existing.line1 || ''),
    line2: typeof body.line2 === 'string' ? body.line2.trim() : (existing.line2 as string | null) ?? null,
    city: typeof body.city === 'string' ? body.city.trim() : String(existing.city || ''),
    region: typeof body.region === 'string' ? body.region.trim() : String(existing.region || ''),
    postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim() : String(existing.postal_code || ''),
    country: typeof body.country === 'string' ? body.country.trim() : String(existing.country || 'CA'),
    isDefault: typeof body.isDefault === 'boolean' ? body.isDefault : Number(existing.is_default || 0) === 1,
  };

  if (!next.label || !next.line1 || !next.city || !next.region || !next.postalCode) {
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
  }

  if (next.isDefault) {
    await db.prepare(`UPDATE user_addresses SET is_default = 0, updated_at = ? WHERE user_id = ?`).bind(now, auth.userId).run();
  }

  await db.prepare(`
    UPDATE user_addresses
    SET label = ?, line1 = ?, line2 = ?, city = ?, region = ?, postal_code = ?, country = ?, is_default = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).bind(next.label, next.line1, next.line2, next.city, next.region, next.postalCode, next.country, next.isDefault ? 1 : 0, now, id, auth.userId).run();

  const row = await db.prepare(`SELECT * FROM user_addresses WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  return NextResponse.json({ address: row ? mapRow(row) : null });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const db = getDb();
  const existing = await db.prepare(`SELECT * FROM user_addresses WHERE id = ? AND user_id = ?`).bind(id, auth.userId).first<Record<string, unknown>>();
  if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 });

  await db.prepare(`DELETE FROM user_addresses WHERE id = ? AND user_id = ?`).bind(id, auth.userId).run();

  if (Number(existing.is_default || 0) === 1) {
    const replacement = await db.prepare(`SELECT id FROM user_addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`).bind(auth.userId).first<{ id: string }>();
    if (replacement?.id) {
      await db.prepare(`UPDATE user_addresses SET is_default = 1, updated_at = ? WHERE id = ?`).bind(new Date().toISOString(), replacement.id).run();
    }
  }

  return NextResponse.json({ ok: true });
}
