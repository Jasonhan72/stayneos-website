import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Required for static export
export function generateStaticParams() {
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid signature';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 处理事件
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// 处理支付成功
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata');
    return;
  }

  // 更新预订状态
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
    },
  });

  // 更新支付记录
  const charge = paymentIntent.latest_charge 
    ? await stripe.charges.retrieve(paymentIntent.latest_charge as string)
    : null;

  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      stripeChargeId: charge?.id,
      stripeCustomerId: typeof paymentIntent.customer === 'string' 
        ? paymentIntent.customer 
        : paymentIntent.customer?.id,
      cardBrand: charge?.payment_method_details?.card?.brand,
      cardLast4: charge?.payment_method_details?.card?.last4,
      paidAt: new Date(),
    },
  });

  console.log(`Payment succeeded for booking ${bookingId}`);
}

// 处理支付失败
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata');
    return;
  }

  // 更新预订状态
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'FAILED',
    },
  });

  // 更新支付记录
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'FAILED',
      failedAt: new Date(),
      errorMessage: paymentIntent.last_payment_error?.message,
    },
  });

  console.log(`Payment failed for booking ${bookingId}`);
}

// 处理退款
async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent;

  if (typeof paymentIntentId !== 'string') {
    return;
  }

  // 更新支付记录
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: {
      status: 'REFUNDED',
      refundAmount: charge.amount_refunded / 100,
      refundedAt: new Date(),
    },
  });

  console.log(`Refund processed for payment intent ${paymentIntentId}`);
}
