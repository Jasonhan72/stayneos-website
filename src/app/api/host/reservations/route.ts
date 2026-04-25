import { NextRequest, NextResponse } from "next/server";
import { getDb, userDb } from "@/lib/d1";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalize(row: Record<string, unknown>) {
  return {
    id: String(row.id || ""),
    guestName: String(row.guestName || "Guest"),
    guestEmail: String(row.guestEmail || ""),
    propertyTitle: String(row.propertyTitle || row.property_id || row.propertyId || "Untitled property"),
    checkIn: String(row.checkIn || row.check_in || ""),
    checkOut: String(row.checkOut || row.check_out || ""),
    status: String(row.status || "PENDING"),
    amount: Number(row.totalPrice ?? row.total_price ?? 0),
  };
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role);
    if (!isPrivileged) return NextResponse.json({ reservations: [] });

    const result = await db.prepare(`
      SELECT b.*, p.title as propertyTitle
      FROM Booking b
      LEFT JOIN Property p ON p.id = b.propertyId
      ORDER BY COALESCE(b.checkIn, b.check_in) DESC, b.createdAt DESC
    `).all<Record<string, unknown>>();

    return NextResponse.json({ reservations: (result.results || []).map(normalize) });
  } catch (error) {
    console.error('Failed to load host reservations:', error);
    return NextResponse.json({ error: 'Failed to load reservations' }, { status: 500 });
  }
}
