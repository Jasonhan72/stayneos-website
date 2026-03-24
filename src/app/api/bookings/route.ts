import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { userDb, getDb } from '@/lib/d1';
import { bookingDb } from '@/lib/booking-db';
import { validateBookingDates, generateBookingNumber, calculateBookingPrice } from '@/lib/booking';
import { getPropertyById } from '@/lib/data';
import { getPropertySnapshot } from '@/lib/property-catalog';
import { paymentDb } from '@/lib/payment-db';
import { apiError } from '@/lib/api/response';

export function generateStaticParams() {
  return [];
}

function normalizeBookingRow<T extends Record<string, unknown>>(row: T) {
  const r = row as Record<string, unknown>;
  return {
    ...r,
    id: (r.id as string) || '',
    propertyId: (r.propertyId as string) || (r.property_id as string) || '',
    checkIn: (r.checkIn as string) || (r.check_in as string) || '',
    checkOut: (r.checkOut as string) || (r.check_out as string) || '',
    bookingNumber: (r.bookingNumber as string) || (r.booking_number as string) || '',
    totalPrice: Number((r.totalPrice as number) ?? (r.total_price as number) ?? 0),
    paymentStatus: (r.paymentStatus as string) || (r.payment_status as string) || 'PENDING',
    status: (r.status as string) || 'PENDING',
  };
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const db = getDb();
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = body;

    if (!propertyId || !checkIn || !checkOut || !guests) return apiError('请填写所有必填字段', 400, 'VALIDATION_ERROR');

    const property = getPropertyById(propertyId);
    if (!property) return apiError('房源不存在', 404, 'PROPERTY_NOT_FOUND');

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return apiError('用户不存在', 404, 'USER_NOT_FOUND');

    const dateValidation = validateBookingDates(checkIn, checkOut, property.minNights);
    if (!dateValidation.valid) return apiError(dateValidation.error || '日期无效', 400, 'INVALID_DATES');

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
      status: 'PENDING',
      paymentStatus: 'PENDING',
      stripePaymentIntentId: null,
      cancelledAt: null,
      cancelReason: null,
    });

    const bookingPayload = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
    };

    return NextResponse.json({ success: true, booking: bookingPayload, data: { booking: bookingPayload } });
  } catch {
    return apiError('创建预订失败，请稍后重试', 500, 'INTERNAL_ERROR');
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return apiError('用户不存在', 404, 'USER_NOT_FOUND');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bookings = await bookingDb.findByUserId(db, user.id);

    const now = new Date();
    const normalizedBookings = bookings.map((b) => normalizeBookingRow(b as unknown as Record<string, unknown>));

    const filtered = normalizedBookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      if (!status || status === 'all') return true;
      if (status === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(booking.status) && checkIn >= now;
      if (status === 'completed') return booking.status === 'CHECKED_OUT';
      if (status === 'active') return ['CONFIRMED', 'CHECKED_IN'].includes(booking.status);
      return booking.status === status;
    });

    const allPayments = await paymentDb.findByBookingIds(db, filtered.map((b) => b.id));
    const paymentMap = new Map<string, typeof allPayments>();
    for (const payment of allPayments) {
      const arr = paymentMap.get(payment.bookingId) || [];
      arr.push(payment);
      paymentMap.set(payment.bookingId, arr);
    }

    const bookingsWithDetails = filtered.map((booking) => {
      const payments = paymentMap.get(booking.id) || [];
      const paidAmount = payments
        .filter((payment) => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return { ...booking, property: getPropertySnapshot(booking.propertyId || ''), review: null, payments, paidAmount };
    });

    return NextResponse.json({ success: true, bookings: bookingsWithDetails, data: { bookings: bookingsWithDetails } });
  } catch {
    return apiError('获取预订列表失败', 500, 'INTERNAL_ERROR');
  }
}
