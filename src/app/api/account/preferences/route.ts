import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";
import { DEFAULT_PREFERENCES, normalizePreferences } from "@/lib/account-settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const row = await db.prepare(`SELECT * FROM user_preferences WHERE user_id = ?`).bind(auth.userId).first<Record<string, unknown>>();
  return NextResponse.json({ preferences: normalizePreferences(row) });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const current = await db.prepare(`SELECT * FROM user_preferences WHERE user_id = ?`).bind(auth.userId).first<Record<string, unknown>>();
  const base = normalizePreferences(current);
  const body = await request.json() as Record<string, unknown>;
  const next = {
    language: typeof body.language === 'string' ? body.language : base.language,
    currency: typeof body.currency === 'string' ? body.currency : base.currency,
    theme: typeof body.theme === 'string' ? body.theme : base.theme,
    contentDensity: typeof body.contentDensity === 'string' ? body.contentDensity : base.contentDensity,
    accessibilityOptions: {
      dateFormat: typeof body.dateFormat === 'string' ? body.dateFormat : base.accessibilityOptions.dateFormat,
      firstDayOfWeek: typeof body.firstDayOfWeek === 'string' ? body.firstDayOfWeek : base.accessibilityOptions.firstDayOfWeek,
      messageSort: typeof body.messageSort === 'string' ? body.messageSort : base.accessibilityOptions.messageSort,
    },
  };
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO user_preferences (user_id, language, currency, theme, content_density, accessibility_options, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      language = excluded.language,
      currency = excluded.currency,
      theme = excluded.theme,
      content_density = excluded.content_density,
      accessibility_options = excluded.accessibility_options,
      updated_at = excluded.updated_at
  `).bind(
    auth.userId,
    next.language || DEFAULT_PREFERENCES.language,
    next.currency || DEFAULT_PREFERENCES.currency,
    next.theme || DEFAULT_PREFERENCES.theme,
    next.contentDensity || DEFAULT_PREFERENCES.contentDensity,
    JSON.stringify(next.accessibilityOptions),
    now,
    now,
  ).run();

  return NextResponse.json({ preferences: next });
}
