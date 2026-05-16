import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { bookingDb } from "@/lib/booking-db";
import { getDb, userDb } from "@/lib/d1";
import { paymentDb } from "@/lib/payment-db";
import { stripe } from "@/lib/stripe";
import { validateCsrf } from "@/lib/security/csrf";
import { APIError, safeApiHandler } from "@/lib/utils/error-handler";

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.stayneos.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: JSON_HEADERS });
}

export async function POST(request: NextRequest) {
  return safeApiHandler<unknown>(async () => {
    if (!validateCsrf(request)) throw new APIError("Invalid CSRF token", 403, "CSRF_INVALID");

    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) throw new APIError("请先登录", 401, "UNAUTHORIZED");

    const db = getDb();
    const { bookingId } = await request.json();
    if (!bookingId) throw new APIError("预订ID不能为空", 400, "BAD_REQUEST");

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) throw new APIError("用户不存在", 404, "NOT_FOUND");

    const booking = await bookingDb.findById(db, bookingId);
    if (!booking || booking.userId !== user.id) throw new APIError("预订不存在", 404, "NOT_FOUND");
    if (!booking.stripePaymentIntentId) throw new APIError("支付记录不存在", 400, "PAYMENT_NOT_FOUND");
    if (!process.env.STRIPE_SECRET_KEY || !stripe.paymentIntents) throw new APIError("Stripe 未配置", 500, "STRIPE_NOT_CONFIGURED");

    const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId, {
      expand: ["latest_charge"],
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { success: true, completed: false, paymentIntentId: paymentIntent.id, status: paymentIntent.status },
        { headers: JSON_HEADERS }
      );
    }

    await bookingDb.update(db, booking.id, {
      status: "CONFIRMED",
      paymentStatus: "COMPLETED",
    });

    const charge = typeof paymentIntent.latest_charge === "object"
      ? (paymentIntent.latest_charge as Stripe.Charge)
      : null;

    await paymentDb.updateByPaymentIntentId(db, paymentIntent.id, {
      status: "COMPLETED",
      stripeChargeId: charge?.id || null,
      stripeCustomerId: typeof paymentIntent.customer === "string" ? paymentIntent.customer : paymentIntent.customer?.id || null,
      cardBrand: charge?.payment_method_details?.card?.brand || null,
      cardLast4: charge?.payment_method_details?.card?.last4 || null,
      paidAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, completed: true, paymentIntentId: paymentIntent.id, status: paymentIntent.status },
      { headers: JSON_HEADERS }
    );
  });
}
