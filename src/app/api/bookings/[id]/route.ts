import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { paymentDb } from "@/lib/payment-db";
import { getPropertySnapshot } from "@/lib/property-catalog";
import { stripe } from "@/lib/stripe";

export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const booking = await bookingDb.findById(db, params.id);
    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "预订不存在" }, { status: 404 });
    }

    const property = getPropertySnapshot(booking.propertyId);
    const payments = await paymentDb.findByBookingId(db, booking.id);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        property,
        review: null,
        payments,
      },
    });
  } catch (error) {
    console.error("Get booking detail error:", error);
    return NextResponse.json({ error: "获取预订详情失败" }, { status: 500 });
  }
}

async function cancelBooking(
  request: NextRequest,
  params: { id: string }
) {
  const currentUser = await getCurrentUserFromRequest(request);

  if (!currentUser?.email) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { action?: string; status?: string; reason?: string };
  const isCancelRequest = body.action === "cancel" || body.status === "CANCELLED" || request.method === "DELETE";

  if (!isCancelRequest) {
    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  }

  const booking = await bookingDb.findById(db, params.id);
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "预订不存在" }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "预订已取消" }, { status: 400 });
  }

  if (booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT") {
    return NextResponse.json({ error: "已入住或已完成的预订无法取消" }, { status: 400 });
  }

  const payments = await paymentDb.findByBookingId(db, booking.id);
  const completedPayment = payments.find((payment) => payment.status === "COMPLETED");
  const cancelledAt = new Date().toISOString();
  let paymentStatus = booking.paymentStatus;
  let refundMessage = "预订已成功取消";

  if (completedPayment?.stripePaymentIntentId && typeof stripe.refunds?.create === "function") {
    const refund = await stripe.refunds.create({
      payment_intent: completedPayment.stripePaymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
      },
    });

    paymentStatus = refund.status === "succeeded" ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await paymentDb.updateByPaymentIntentId(db, completedPayment.stripePaymentIntentId, {
      status: "REFUNDED",
      refundedAt: cancelledAt,
      refundAmount: (refund.amount || 0) / 100,
      refundReason: body.reason || "Customer cancellation",
    });

    refundMessage = "预订已取消，退款已发起";
  }

  await bookingDb.update(db, params.id, {
    status: "CANCELLED",
    paymentStatus,
    cancelledAt,
    cancelReason: body.reason || null,
  });

  const updatedBooking = await bookingDb.findById(db, params.id);

  return NextResponse.json({
    success: true,
    booking: updatedBooking,
    message: refundMessage,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await cancelBooking(request, params);
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "取消预订失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await cancelBooking(request, params);
  } catch (error) {
    console.error("Cancel booking via PUT error:", error);
    return NextResponse.json({ error: "取消预订失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await cancelBooking(request, params);
  } catch (error) {
    console.error("Cancel booking via DELETE error:", error);
    return NextResponse.json({ error: "取消预订失败" }, { status: 500 });
  }
}
