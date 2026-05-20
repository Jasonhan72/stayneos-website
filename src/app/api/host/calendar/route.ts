import { NextRequest, NextResponse } from "next/server";
import { addDaysYmd, diffDays, eachDay, formatYmd, toDate } from "@/lib/host-date";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";

export const dynamic = "force-dynamic";

function asDate(value: string | null) {
  return value ? toDate(value) : null;
}

function toYmd(date: Date) { return formatYmd(date); }

async function ensureHost(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(request);
  if (!currentUser?.email) return null;
  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);
  if (!user) return null;
  if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) return null;
  return { db, user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await ensureHost(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { db } = auth;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || 'all';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const startDate = asDate(start);
    const endDate = asDate(end);
    if (!startDate || !endDate) return NextResponse.json({ error: 'Missing start/end' }, { status: 400 });
    if (diffDays(startDate, endDate) > 90) return NextResponse.json({ error: 'Date range cannot exceed 90 days' }, { status: 400 });

    const propertyRows = (await db.prepare(`SELECT id, title, priceMonthly, minStayDays FROM Property ${propertyId === 'all' ? '' : 'WHERE id = ?'} ORDER BY updatedAt DESC`).bind(...(propertyId === 'all' ? [] : [propertyId])).all<Record<string, unknown>>()).results || [];
    const properties = propertyRows.map((row) => ({ id: String(row.id), title: String(row.title || 'Untitled property'), basePrice: Number(row.priceMonthly || 0) / 30 }));

    if (properties.length === 0) return NextResponse.json({ properties: [], days: [] });

    const propertyIds = properties.map((property) => property.id);
    const placeholders = propertyIds.map(() => '?').join(', ');
    const availability = (await db.prepare(`SELECT * FROM property_availability WHERE property_id IN (${placeholders}) AND date >= ? AND date <= ?`).bind(...propertyIds, toYmd(startDate), toYmd(endDate)).all<Record<string, unknown>>()).results || [];
    const bookings = (await db.prepare(`SELECT id, propertyId, checkIn, checkOut FROM Booking WHERE propertyId IN (${placeholders}) AND status != 'CANCELLED'`).bind(...propertyIds).all<Record<string, unknown>>()).results || [];

    const availabilityMap = new Map<string, Record<string, unknown>>();
    for (const row of availability) availabilityMap.set(`${row.property_id}:${row.date}`, row);

    const days: Array<{ date: string; propertyId: string; status: string; price: number | null; minNights: number | null; isBooked: boolean; bookingId?: string }> = [];
    for (const property of properties) {
      for (const ymd of eachDay(startDate, endDate)) {
        const key = `${property.id}:${ymd}`;
        const override = availabilityMap.get(key);
        days.push({
          date: ymd,
          propertyId: property.id,
          status: String(override?.status || 'available'),
          price: override?.price_cents != null ? Number(override.price_cents) : Math.round((property.basePrice || 0) * 100),
          minNights: override?.min_nights != null ? Number(override.min_nights) : null,
          isBooked: false,
        });
      }
    }

    const dayMap = new Map(days.map((day) => [`${day.propertyId}:${day.date}`, day]));
    for (const booking of bookings) {
      const bookingStart = asDate(String(booking.checkIn || booking.check_in));
      const bookingEnd = asDate(String(booking.checkOut || booking.check_out));
      const bookingPropertyId = String(booking.propertyId || '');
      if (!bookingStart || !bookingEnd) continue;
      for (const ymd of eachDay(bookingStart, addDaysYmd(bookingEnd, -1))) {
        const key = `${bookingPropertyId}:${ymd}`;
        const existing = dayMap.get(key);
        if (existing) {
          existing.status = 'booked';
          existing.isBooked = true;
          existing.bookingId = String(booking.id || '');
        }
      }
    }

    return NextResponse.json({ properties, days });
  } catch (error) {
    console.error('Failed to load host calendar:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to load calendar: ${message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await ensureHost(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { db, user } = auth;
    const body = await request.json() as { propertyId?: string; ranges?: Array<{ start: string; end: string; status?: string; price?: number; minNights?: number; notes?: string }> };
    if (!body.propertyId || !Array.isArray(body.ranges) || body.ranges.length === 0) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const conflictDates = new Set<string>();
    const allDates: string[] = [];
    for (const range of body.ranges) {
      const startDate = asDate(range.start);
      const endDate = asDate(range.end);
      if (!startDate || !endDate) continue;
      for (const ymd of eachDay(startDate, endDate)) allDates.push(ymd);
    }

    const bookingRows = (await db.prepare(`SELECT id, checkIn, checkOut FROM Booking WHERE propertyId = ? AND status != 'CANCELLED'`).bind(body.propertyId).all<Record<string, unknown>>()).results || [];
    for (const booking of bookingRows) {
      const bookingStart = asDate(String(booking.checkIn || booking.check_in));
      const bookingEnd = asDate(String(booking.checkOut || booking.check_out));
      if (!bookingStart || !bookingEnd) continue;
      for (const ymd of eachDay(bookingStart, addDaysYmd(bookingEnd, -1))) {
        if (allDates.includes(ymd)) conflictDates.add(ymd);
      }
    }
    if (conflictDates.size > 0) return NextResponse.json({ error: 'Selected range contains booked dates', conflictDates: Array.from(conflictDates).sort() }, { status: 409 });

    for (const range of body.ranges) {
      const startDate = asDate(range.start);
      const endDate = asDate(range.end);
      if (!startDate || !endDate) continue;
      for (const ymd of eachDay(startDate, endDate)) {
        await db.prepare(`
          INSERT INTO property_availability (property_id, date, status, price_cents, min_nights, notes, updated_by, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(property_id, date) DO UPDATE SET
            status = excluded.status,
            price_cents = excluded.price_cents,
            min_nights = excluded.min_nights,
            notes = excluded.notes,
            updated_by = excluded.updated_by,
            updated_at = CURRENT_TIMESTAMP
        `).bind(body.propertyId, ymd, range.status || 'available', typeof range.price === 'number' ? Math.round(range.price * 100) : null, typeof range.minNights === 'number' ? range.minNights : null, range.notes || null, user.id).run();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update host calendar:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to update calendar: ${message}` }, { status: 500 });
  }
}
