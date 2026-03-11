export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { getPropertySnapshot } from "@/lib/property-catalog";

export function generateStaticParams() {
  return [];
}

async function listBookings(request: NextRequest, statusFilter?: string) {
  const currentUser = getCurrentUserFromRequest(request);

  if (!currentUser?.email) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const bookings = await bookingDb.findByUserId(db, user.id);
  const payload = bookings
    .filter((booking) => {
      if (!statusFilter || statusFilter === "all") return true;
      return booking.status === statusFilter;
    })
    .map((booking) => {
      const property = getPropertySnapshot(booking.propertyId);

      return {
        id: booking.id,
        booking_number: booking.bookingNumber,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        nights: booking.nights,
        guests: booking.guests,
        total_price: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        payment_status: booking.paymentStatus,
        property_id: booking.propertyId,
        property_title: property?.title || "StayNeos Property",
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        created_at: booking.createdAt,
      };
    });

  return NextResponse.json({ success: true, bookings: payload });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    return await listBookings(request, status);
  } catch (error) {
    console.error("Get bookings list error:", error);
    return NextResponse.json({ error: "获取预订列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { status?: string };
    return await listBookings(request, body.status);
  } catch (error) {
    console.error("Post bookings list error:", error);
    return NextResponse.json({ error: "获取预订列表失败" }, { status: 500 });
  }
}
