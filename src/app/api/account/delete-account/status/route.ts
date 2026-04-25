import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const user = await db.prepare(`SELECT deletionRequestedAt, deletionScheduledAt, deletionStatus FROM User WHERE id = ?`)
      .bind(auth.userId)
      .first<{ deletionRequestedAt?: string | null; deletionScheduledAt?: string | null; deletionStatus?: string | null }>();

    return NextResponse.json({
      status: user?.deletionStatus ?? 'active',
      deletionRequestedAt: user?.deletionRequestedAt ?? null,
      deletionScheduledAt: user?.deletionScheduledAt ?? null,
      recoverable: (user?.deletionStatus ?? 'active') === 'pending_deletion',
    });
  } catch (error) {
    console.error('account/delete-account:status', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
