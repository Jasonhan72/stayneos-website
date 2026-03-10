import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { validateBookingDates, generateBookingNumber, calculateBookingPrice } from "@/lib/booking";
import { getPropertyById } from "@/lib/data";
import { getPropertySnapshot } from "@/lib/property-catalog";
import { paymentDb } from "@/lib/payment-db";

export function generateStaticParams() {
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 });
    }

    const property = getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "房源不存在" }, { status: 404 });
    }

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dateValidation = validateBookingDates(checkIn, checkOut, property.minNights);
    if (!dateValidation.valid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    const priceCalc = calculateBookingPrice(property, checkIn, checkOut);

    const booking = await bookingDb.create(db, {
      bookingNumber: generateBookingNumber(),
      propertyId,
      userId: user.id,
      checkIn,
      checkOut,
      nights: priceCalc.nights,
      guests: Number(guests),
      guestName: guestName || user.name,
      guestEmail: guestEmail || user.email,
      guestPhone: guestPhone || user.phone,
      basePrice: priceCalc.basePrice,
      cleaningFee: priceCalc.cleaningFee,
      serviceFee: priceCalc.serviceFee,
      discount: priceCalc.discount,
      discountRate: priceCalc.discountRate,
      tax: priceCalc.tax,
      totalPrice: priceCalc.total,
      currency: priceCalc.currency,
      specialRequests: specialRequests || null,
      status: "PENDING",
      paymentStatus: "PENDING",
      stripePaymentIntentId: null,
      cancelledAt: null,
      cancelReason: null,
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "创建预订失败，请稍后重试" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const bookings = await bookingDb.findByUserId(db, user.id);

    const now = new Date();
    const filtered = bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      // checkOut reserved for future date-range filtering
      void new Date(booking.checkOut);

      if (!status || status === "all") {
        return true;
      }

      if (status === "upcoming") {
        return ["PENDING", "CONFIRMED"].includes(booking.status) && checkIn >= now;
      }

      if (status === "completed") {
        return booking.status === "CHECKED_OUT";
      }

      if (status === "active") {
        return ["CONFIRMED", "CHECKED_IN"].includes(booking.status);
      }

      return booking.status === status;
    });

    const bookingsWithDetails = await Promise.all(
      filtered.map(async (booking) => {
        const property = getPropertySnapshot(booking.propertyId);
        const payments = await paymentDb.findByBookingId(db, booking.id);
        const paidAmount = payments
          .filter((payment) => payment.status === "COMPLETED")
          .reduce((sum, payment) => sum + Number(payment.amount), 0);

        return {
          ...booking,
          property,
          review: null,
          payments,
          paidAmount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      bookings: bookingsWithDetails,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: "获取预订列表失败" }, { status: 500 });
  }
}

