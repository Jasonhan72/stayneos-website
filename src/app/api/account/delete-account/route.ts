import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";
const COOLING_OFF_DAYS = 30;

function plusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function getOpenBookingCount(userId: string) {
  const db = getDb();
  const row = await db
    .prepare(`SELECT COUNT(*) as count FROM Booking WHERE userId = ? AND status NOT IN ('CANCELLED', 'COMPLETED')`)
    .bind(userId)
    .first<{ count?: number | string }>();
  return Number(row?.count ?? 0);
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const openBookings = await getOpenBookingCount(auth.userId);
    if (openBookings > 0) {
      return NextResponse.json({ error: 'Please resolve active bookings before deleting your account.', openBookings }, { status: 409 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const scheduledAt = plusDays(COOLING_OFF_DAYS);

    await db.prepare(`UPDATE User SET deletionRequestedAt = ?, deletionScheduledAt = ?, deletionStatus = 'pending_deletion', updatedAt = ? WHERE id = ?`)
      .bind(now, scheduledAt, now, auth.userId)
      .run();

    return NextResponse.json({
      status: 'pending_deletion',
      deletionRequestedAt: now,
      deletionScheduledAt: scheduledAt,
      coolingOffDays: COOLING_OFF_DAYS,
    });
  } catch (error) {
    console.error('account/delete-account:create', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
