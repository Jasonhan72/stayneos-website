import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  propertyId: string;
  propertyTitle: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: string | null;
  currency: string | null;
};

type MonthlyBucket = {
  month: string; // YYYY-MM
  gross: number;
  nights: number;
  bookings: number;
};

type PropertyBreakdown = {
  propertyId: string;
  propertyTitle: string;
  gross: number;
  nights: number;
  bookings: number;
};

function monthKey(dateIso: string): string {
  // Robust against both "YYYY-MM-DD" and full ISO strings.
  return dateIso.slice(0, 7);
}

// GET /api/host/earnings?months=12
// Returns the authenticated host's gross revenue, broken down by month and by
// property. Revenue is derived from confirmed/completed Booking rows (not just
// Payment rows) so that a booking shows up the moment it's confirmed, even if
// the Payment record lags.
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const monthsParam = Number(url.searchParams.get("months") ?? "12");
    const months = Number.isFinite(monthsParam) && monthsParam > 0 && monthsParam <= 60 ? monthsParam : 12;

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const horizon = new Date();
    horizon.setMonth(horizon.getMonth() - (months - 1));
    horizon.setDate(1);
    const horizonIso = horizon.toISOString();

    // Pull host's bookings; filter to revenue-qualifying statuses.
    const { results } = await db
      .prepare(
        `SELECT b.id, b.propertyId, b.checkIn, b.checkOut, b.nights,
                b.totalPrice, b.status, b.currency,
                p.createdBy, p.title as propertyTitle
           FROM Booking b
      LEFT JOIN Property p ON p.id = b.propertyId
          WHERE p.createdBy = ?
            AND b.checkIn >= ?
            AND UPPER(COALESCE(b.status, '')) IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')`
      )
      .bind(user.id, horizonIso)
      .all<BookingRow>();

    const rows = results ?? [];

    // Build monthly buckets for the last `months` months, including zeros.
    const monthly: Map<string, MonthlyBucket> = new Map();
    for (let i = 0; i < months; i++) {
      const d = new Date(horizon);
      d.setMonth(horizon.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly.set(key, { month: key, gross: 0, nights: 0, bookings: 0 });
    }

    const byProperty: Map<string, PropertyBreakdown> = new Map();
    let totalGross = 0;
    let totalNights = 0;

    for (const r of rows) {
      const key = monthKey(r.checkIn);
      const amount = Number(r.totalPrice) || 0;
      const nights = Number(r.nights) || 0;

      const bucket = monthly.get(key);
      if (bucket) {
        bucket.gross += amount;
        bucket.nights += nights;
        bucket.bookings += 1;
      }

      const propKey = r.propertyId;
      const propTitle = r.propertyTitle ?? "Untitled property";
      const existing = byProperty.get(propKey);
      if (existing) {
        existing.gross += amount;
        existing.nights += nights;
        existing.bookings += 1;
      } else {
        byProperty.set(propKey, {
          propertyId: propKey,
          propertyTitle: propTitle,
          gross: amount,
          nights,
          bookings: 1,
        });
      }

      totalGross += amount;
      totalNights += nights;
    }

    const monthlyArr = Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month));
    const propertyArr = Array.from(byProperty.values()).sort((a, b) => b.gross - a.gross);

    const res = NextResponse.json({
      currency: "CAD",
      months,
      totals: {
        gross: totalGross,
        bookings: rows.length,
        nights: totalNights,
        averageNightly: totalNights > 0 ? totalGross / totalNights : 0,
      },
      monthly: monthlyArr,
      byProperty: propertyArr,
    });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  } catch (err) {
    console.error("host/earnings", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
