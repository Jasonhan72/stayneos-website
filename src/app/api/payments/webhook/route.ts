import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { paymentDb } from "@/lib/payment-db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export function generateStaticParams() {
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid signature";
      console.error("Webhook signature verification failed:", errorMessage);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const db = getDb();
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error("No bookingId in payment intent metadata");
    return;
  }

  await bookingDb.update(db, bookingId, {
    status: "CONFIRMED",
    paymentStatus: "COMPLETED",
  });

  const charge = paymentIntent.latest_charge
    ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
    : null;

  await paymentDb.updateByPaymentIntentId(db, paymentIntent.id, {
    status: "COMPLETED",
    stripeChargeId: charge?.id || null,
    stripeCustomerId:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id || null,
    cardBrand: charge?.payment_method_details?.card?.brand || null,
    cardLast4: charge?.payment_method_details?.card?.last4 || null,
    paidAt: new Date().toISOString(),
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = getDb();
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error("No bookingId in payment intent metadata");
    return;
  }

  await bookingDb.update(db, bookingId, {
    paymentStatus: "FAILED",
  });

  await paymentDb.updateByPaymentIntentId(db, paymentIntent.id, {
    status: "FAILED",
    failedAt: new Date().toISOString(),
    errorMessage: paymentIntent.last_payment_error?.message || null,
  });
}

async function handleRefund(charge: Stripe.Charge) {
  const db = getDb();
  const paymentIntentId = charge.payment_intent;

  if (typeof paymentIntentId !== "string") {
    return;
  }

  const payment = await paymentDb.findByPaymentIntentId(db, paymentIntentId);

  if (payment) {
    await bookingDb.update(db, payment.bookingId, {
      paymentStatus: "REFUNDED",
      status: "CANCELLED",
    });
  }

  await paymentDb.updateByPaymentIntentId(db, paymentIntentId, {
    status: "REFUNDED",
    refundAmount: charge.amount_refunded / 100,
    refundedAt: new Date().toISOString(),
  });
}

