import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";
import { addDaysYmd, diffDays, formatYmd, toDate } from "@/lib/host-date";

export const dynamic = "force-dynamic";

function value(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (row[key] != null) return row[key];
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rows = (await db.prepare(`SELECT b.*, p.title as propertyTitle FROM Booking b INNER JOIN Property p ON p.id = b.propertyId AND p.createdBy = ?`).bind(user.id).all<Record<string, unknown>>()).results || [];
    const today = toDate(new Date())!;
    today.setHours(0,0,0,0);
    const sevenDays = toDate(addDaysYmd(today, 7))!;
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const nextThirty = toDate(addDaysYmd(today, 30))!;

    const reservations = rows.map((row) => {
      const checkIn = new Date(String(value(row, 'checkIn', 'check_in') || ''));
      const checkOut = new Date(String(value(row, 'checkOut', 'check_out') || ''));
      return {
        id: String(row.id || ''),
        guestName: String(value(row, 'guestName', 'guest_name') || 'Guest'),
        propertyTitle: String(row.propertyTitle || 'Untitled property'),
        checkIn: formatYmd(checkIn),
        checkOut: formatYmd(checkOut),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: String(row.status || 'PENDING'),
        amount: Number(value(row, 'totalPrice', 'total_price') || 0),
      };
    }).filter((item) => !Number.isNaN(item.checkInDate.getTime()) && !Number.isNaN(item.checkOutDate.getTime()));

    const todayYmd = formatYmd(today);
    const checkInsToday = reservations.filter((r) => formatYmd(r.checkInDate) === todayYmd).length;
    const checkOutsToday = reservations.filter((r) => formatYmd(r.checkOutDate) === todayYmd).length;
    const revenueThisMonth = reservations.filter((r) => r.checkInDate >= monthStart && r.checkInDate <= monthEnd).reduce((sum, r) => sum + r.amount, 0);

    let occupiedNights = 0;
    for (const r of reservations) {
      const start = r.checkInDate < today ? today : r.checkInDate;
      const end = r.checkOutDate > nextThirty ? nextThirty : r.checkOutDate;
      const nights = diffDays(start, end);
      occupiedNights += Math.max(0, nights);
    }
    const occupancyRate = Math.max(0, Math.min(100, Math.round((occupiedNights / Math.max(30, 30)) * 100)));

    return NextResponse.json({
      metrics: { checkInsToday, checkOutsToday, revenueThisMonth, occupancyRate },
      arrivingGuests: reservations.filter((r) => formatYmd(r.checkInDate) === todayYmd).slice(0, 10),
      upcomingReservations: reservations.filter((r) => r.checkInDate > today && r.checkInDate <= sevenDays).sort((a,b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 10),
    });
  } catch (error) {
    console.error('Failed to load host dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
