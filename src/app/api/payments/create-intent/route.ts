import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { paymentDb } from "@/lib/payment-db";
import { stripe } from "@/lib/stripe";
import { getPropertySnapshot } from "@/lib/property-catalog";
import { APIError, safeApiHandler } from "@/lib/utils/error-handler";
import { validateCsrf } from '@/lib/security/csrf';

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.stayneos.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: JSON_HEADERS });
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  return safeApiHandler<unknown>(async () => {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      throw new APIError("请先登录", 401, "UNAUTHORIZED");
    }

    const db = getDb();
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      throw new APIError("预订ID不能为空", 400, "BAD_REQUEST");
    }

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      throw new APIError("用户不存在", 404, "NOT_FOUND");
    }

    const booking = await bookingDb.findById(db, bookingId);
    if (!booking || booking.userId !== user.id) {
      throw new APIError("预订不存在", 404, "NOT_FOUND");
    }

    if (booking.status === "CANCELLED") {
      throw new APIError("预订已取消", 400, "BAD_REQUEST");
    }

    if (booking.paymentStatus === "COMPLETED") {
      throw new APIError("预订已支付", 400, "BAD_REQUEST");
    }

    const amountInCents = Math.round(Number(booking.totalPrice) * 100);
    const property = getPropertySnapshot(booking.propertyId);

    if (!process.env.STRIPE_SECRET_KEY || !stripe.paymentIntents) {
      await paymentDb.upsertPending(db, {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency,
        stripePaymentIntentId: `manual_${booking.id}`,
        status: "PENDING",
        metadata: {
          mode: "manual_payment_request",
          reason: "stripe_not_configured",
        },
      });

      return NextResponse.json(
        {
          success: true,
          manual: true,
          clientSecret: null,
          paymentIntentId: null,
          amount: amountInCents,
          currency: booking.currency,
        },
        { headers: JSON_HEADERS }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: booking.currency.toLowerCase(),
      // Restrict to card only. Without this Stripe auto-enables Link, which
      // surfaces an always-English "Save info / Mobile number" prompt and a
      // floating "1 stripe >" banner that won't translate even when Elements
      // locale is set to 'zh' or 'fr-CA'.
      payment_method_types: ['card'],
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

    return NextResponse.json(
      {
        success: true,
        manual: false,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: booking.currency,
      },
      { headers: JSON_HEADERS }
    );
  });
}
