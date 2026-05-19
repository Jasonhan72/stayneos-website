import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/auth/account";
import { validateCsrf } from '@/lib/security/csrf';

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

export async function GET(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;

  const db = getDb();
  const rows = await db.prepare(`
    SELECT * FROM user_addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, updated_at DESC
  `).bind(auth.userId).all<Record<string, unknown>>();

  return NextResponse.json({ addresses: (rows.results || []).map(mapRow) });
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json() as Record<string, unknown>;
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const line1 = typeof body.line1 === 'string' ? body.line1.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const region = typeof body.region === 'string' ? body.region.trim() : '';
  const postalCode = typeof body.postalCode === 'string' ? body.postalCode.trim() : '';
  const country = typeof body.country === 'string' && body.country.trim() ? body.country.trim() : 'CA';
  const line2 = typeof body.line2 === 'string' ? body.line2.trim() : null;
  const isDefault = Boolean(body.isDefault);

  if (!label || !line1 || !city || !region || !postalCode) {
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (isDefault) {
    await db.prepare(`UPDATE user_addresses SET is_default = 0, updated_at = ? WHERE user_id = ?`).bind(now, auth.userId).run();
  }

  const existingCount = await db.prepare(`SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?`).bind(auth.userId).first<{ count: number }>();
  const defaultFlag = isDefault || Number(existingCount?.count || 0) === 0 ? 1 : 0;

  await db.prepare(`
    INSERT INTO user_addresses (id, user_id, label, line1, line2, city, region, postal_code, country, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, auth.userId, label, line1, line2, city, region, postalCode, country, defaultFlag, now, now).run();

  const row = await db.prepare(`SELECT * FROM user_addresses WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  return NextResponse.json({ address: row ? mapRow(row) : null }, { status: 201 });
}
