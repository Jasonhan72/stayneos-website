import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { userDb, getDb } from '@/lib/d1';
import { validateCsrf } from '@/lib/security/csrf';
import { bookingDb } from '@/lib/booking-db';
import { paymentDb } from '@/lib/payment-db';
import { reviewDb } from '@/lib/review-db';
import { getPropertySnapshot } from '@/lib/property-catalog';
import { stripe } from '@/lib/stripe';
import { apiError, apiSuccess } from '@/lib/api/response';


const ALLOWED_BOOKING_STATUS = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'] as const;
type MutableBookingStatus = (typeof ALLOWED_BOOKING_STATUS)[number];

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

async function getAuthorizedUser(request: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(request);
  if (!currentUser?.email) return null;
  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);
  return user ? { db, user } : null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthorizedUser(request);
    if (!auth) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const idOrRef = (await params).id;
    const booking =
      (await bookingDb.findById(auth.db, idOrRef)) ||
      (await bookingDb.findByBookingNumber(auth.db, idOrRef));
    if (!booking || booking.userId !== auth.user.id && !['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');

    const property = getPropertySnapshot(booking.propertyId);
    const payments = await paymentDb.findByBookingId(auth.db, booking.id);
    const review = await reviewDb.findByBookingId(auth.db, booking.id);

    return apiSuccess({ booking: { ...booking, property, review, payments } });
  } catch {
    return apiError('获取预订详情失败', 500, 'INTERNAL_ERROR');
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');
  try {
    const auth = await getAuthorizedUser(request);
    if (!auth) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const idOrRef = (await params).id;
    const booking =
      (await bookingDb.findById(auth.db, idOrRef)) ||
      (await bookingDb.findByBookingNumber(auth.db, idOrRef));
    if (!booking || booking.userId !== auth.user.id && !['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');

    const body = (await request.json().catch(() => ({}))) as {
      checkIn?: string;
      checkOut?: string;
      guests?: number;
      specialRequests?: string | null;
      status?: string;
    };

    const isHost = ['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(auth.user.role);
    const GUEST_ALLOWED_STATUS: MutableBookingStatus[] = ['PENDING'];
    const HOST_ONLY_STATUS: MutableBookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'];

    const nextStatus = body.status && ALLOWED_BOOKING_STATUS.includes(body.status as MutableBookingStatus)
      ? (body.status as MutableBookingStatus)
      : undefined;

    // Guests can only set PENDING; HOST-only statuses require host role
    if (nextStatus) {
      if (!isHost && HOST_ONLY_STATUS.includes(nextStatus)) {
        const label = nextStatus === 'CONFIRMED' ? '确认' : nextStatus === 'CHECKED_IN' ? '入住' : nextStatus === 'CHECKED_OUT' ? '退房' : '未入住';
        return apiError(`只有房东可以标记${label}状态`, 403, 'HOST_ONLY_STATUS');
      }
      if (!isHost && !GUEST_ALLOWED_STATUS.includes(nextStatus)) {
        return apiError('无权修改预订状态', 403, 'FORBIDDEN_STATUS');
      }
    }

    const updatePayload = {
      ...(body.checkIn ? { checkIn: body.checkIn } : {}),
      ...(body.checkOut ? { checkOut: body.checkOut } : {}),
      ...(typeof body.guests === 'number' ? { guests: body.guests } : {}),
      ...(body.specialRequests !== undefined ? { specialRequests: body.specialRequests } : {}),
      ...(nextStatus ? { status: nextStatus } : {}),
    };

    if (Object.keys(updatePayload).length === 0) {
      return apiError('无可更新字段', 400, 'NO_UPDATE_FIELDS');
    }

    await bookingDb.update(auth.db, booking.id, updatePayload);
    const updatedBooking = await bookingDb.findById(auth.db, booking.id);

    return apiSuccess({ booking: updatedBooking, message: '预订更新成功' });
  } catch {
    return apiError('更新预订失败', 500, 'INTERNAL_ERROR');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');
  try {
    const auth = await getAuthorizedUser(request);
    if (!auth) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const idOrRef = (await params).id;
    const booking =
      (await bookingDb.findById(auth.db, idOrRef)) ||
      (await bookingDb.findByBookingNumber(auth.db, idOrRef));
    if (!booking || booking.userId !== auth.user.id && !['HOST', 'ADMIN', 'SUPER_ADMIN'].includes(auth.user.role)) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');
    if (booking.status === 'CANCELLED') return apiError('预订已取消', 400, 'ALREADY_CANCELLED');
    if (booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
      return apiError('已入住或已完成的预订无法取消', 400, 'INVALID_CANCEL_STATE');
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const payments = await paymentDb.findByBookingId(auth.db, booking.id);
    const completedPayment = payments.find((payment) => payment.status === 'COMPLETED');
    const cancelledAt = new Date().toISOString();

    let paymentStatus = booking.paymentStatus;
    let message = '预订已成功取消';

    if (completedPayment?.stripePaymentIntentId && typeof stripe.refunds?.create === 'function') {
      const refund = await stripe.refunds.create({
        payment_intent: completedPayment.stripePaymentIntentId,
        reason: 'requested_by_customer',
        metadata: { bookingId: booking.id, bookingNumber: booking.bookingNumber },
      });

      paymentStatus = refund.status === 'succeeded' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await paymentDb.updateByPaymentIntentId(auth.db, completedPayment.stripePaymentIntentId, {
        status: 'REFUNDED',
        refundedAt: cancelledAt,
        refundAmount: (refund.amount || 0) / 100,
        refundReason: body.reason || 'Customer cancellation',
      });

      message = '预订已取消，退款已发起';
    }

    await bookingDb.update(auth.db, booking.id, {
      status: 'CANCELLED',
      paymentStatus,
      cancelledAt,
      cancelReason: body.reason || null,
    });

    const updatedBooking = await bookingDb.findById(auth.db, booking.id);
    return apiSuccess({ booking: updatedBooking, message });
  } catch {
    return apiError('取消预订失败', 500, 'INTERNAL_ERROR');
  }
}
