import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const now = new Date().toISOString();
    await db.prepare(`UPDATE User SET deletionRequestedAt = NULL, deletionScheduledAt = NULL, deletionStatus = 'active', updatedAt = ? WHERE id = ?`)
      .bind(now, auth.userId)
      .run();

    return NextResponse.json({ status: 'active', deletionRequestedAt: null, deletionScheduledAt: null });
  } catch (error) {
    console.error('account/delete-account:cancel', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
