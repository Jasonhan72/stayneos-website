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
  const currentUser = await getCurrentUserFromRequest(request);

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
      const bookingStatus = booking.status || (booking as unknown as { status?: string; booking_status?: string }).booking_status;
      if (!statusFilter || statusFilter === "all") return true;
      return bookingStatus === statusFilter;
    })
    .map((booking) => {
      const record = booking as unknown as {
        id?: string;
        bookingNumber?: string;
        booking_number?: string;
        checkIn?: string;
        check_in?: string;
        checkOut?: string;
        check_out?: string;
        totalPrice?: number;
        total_price?: number;
        paymentStatus?: string;
        payment_status?: string;
        propertyId?: string;
        property_id?: string;
        guestName?: string;
        guest_name?: string;
        guestEmail?: string;
        guest_email?: string;
        createdAt?: string;
        created_at?: string;
        status?: string;
      };

      const propertyId = record.propertyId || record.property_id || "";
      const property = getPropertySnapshot(propertyId);

      return {
        id: record.id,
        booking_number: record.bookingNumber || record.booking_number,
        check_in: record.checkIn || record.check_in,
        check_out: record.checkOut || record.check_out,
        nights: booking.nights,
        guests: booking.guests,
        total_price: record.totalPrice ?? record.total_price,
        currency: booking.currency,
        status: record.status,
        payment_status: record.paymentStatus || record.payment_status,
        property_id: propertyId,
        property_title: property?.title || "NEOS Property",
        guest_name: record.guestName || record.guest_name,
        guest_email: record.guestEmail || record.guest_email,
        created_at: record.createdAt || record.created_at,
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
