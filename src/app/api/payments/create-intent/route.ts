import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { paymentDb } from "@/lib/payment-db";
import { stripe } from "@/lib/stripe";
import { getPropertySnapshot } from "@/lib/property-catalog";

export function generateStaticParams() {
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "预订ID不能为空" }, { status: 400 });
    }

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const booking = await bookingDb.findById(db, bookingId);
    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "预订不存在" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "预订已取消" }, { status: 400 });
    }

    if (booking.paymentStatus === "COMPLETED") {
      return NextResponse.json({ error: "预订已支付" }, { status: 400 });
    }

    const amountInCents = Math.round(Number(booking.totalPrice) * 100);
    const property = getPropertySnapshot(booking.propertyId);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: user.id,
        propertyId: booking.propertyId,
      },
      description: `预订 #${booking.bookingNumber} - ${property?.title || "NEOS Property"}`,
      receipt_email: user.email || undefined,
    });

    await bookingDb.update(db, booking.id, {
      stripePaymentIntentId: paymentIntent.id,
      paymentStatus: "PROCESSING",
    });

    await paymentDb.upsertPending(db, {
      bookingId: booking.id,
      amount: booking.totalPrice,
      currency: booking.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: "PENDING",
      metadata: {
        clientSecret: paymentIntent.client_secret,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: booking.currency,
    });
  } catch (error: unknown) {
    console.error("Create payment intent error:", error);
    const errorMessage = error instanceof Error ? error.message : "创建支付失败";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

