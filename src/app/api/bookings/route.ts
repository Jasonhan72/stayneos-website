import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { userDb, getDb } from '@/lib/d1';
import { bookingDb } from '@/lib/booking-db';
import { validateBookingDates, generateBookingNumber, calculateBookingPrice, normalizeStayType, getStayTypeMinimumUnits } from '@/lib/booking';
import { paymentDb } from '@/lib/payment-db';
import { apiError } from '@/lib/api/response';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrf } from '@/lib/security/csrf';
import { type PropertyRecord, toPublicProperty } from '@/lib/property-db';
import { sendBookingReceived } from '@/lib/email';

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
    stayType: (r.stayType as string) || 'NIGHTLY',
    unitCount: Number((r.unitCount as number) ?? (r.nights as number) ?? 0),
    unitRate: Number((r.unitRate as number) ?? 0),
  };
}

function toPropertySnapshot(row: PropertyRecord) {
  const property = toPublicProperty(row);
  return {
    id: property.id,
    title: property.title,
    address: property.address || property.location,
    city: property.city || 'Toronto',
    description: property.description,
    images: property.images.map((url, index) => ({
      url,
      alt: `${property.title} image ${index + 1}`,
    })),
    amenities: property.amenities.map((name) => ({
      amenity: {
        name,
        icon: null,
      },
    })),
  };
}

async function findPublishedProperty(db: D1Database, propertyId: string) {
  const row = await db
    .prepare("SELECT * FROM Property WHERE (id = ? OR slug = ?) AND status = 'PUBLISHED' LIMIT 1")
    .bind(propertyId, propertyId)
    .first<PropertyRecord>();

  return row ? toPublicProperty(row) : null;
}

async function findPropertySnapshotMap(db: D1Database, propertyIds: string[]) {
  if (propertyIds.length === 0) return new Map<string, ReturnType<typeof toPropertySnapshot>>();

  const uniqueIds = Array.from(new Set(propertyIds.filter(Boolean)));
  const placeholders = uniqueIds.map(() => '?').join(', ');
  const result = await db
    .prepare(`SELECT * FROM Property WHERE id IN (${placeholders}) OR slug IN (${placeholders})`)
    .bind(...uniqueIds, ...uniqueIds)
    .all<PropertyRecord>();

  const map = new Map<string, ReturnType<typeof toPropertySnapshot>>();
  for (const row of result.results || []) {
    const snapshot = toPropertySnapshot(row);
    map.set(row.id, snapshot);
    map.set(row.slug, snapshot);
  }
  return map;
}

export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request, 'booking:create', { limit: 10, windowMs: 60_000 });
    if (!rate.allowed) return apiError('Too many booking attempts', 429, 'RATE_LIMITED');

    if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');

    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) return apiError('请先登录', 401, 'UNAUTHORIZED');

    const db = getDb();
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = body;
    const stayType = normalizeStayType(body.stayType, propertyId ? undefined : 'nightly');

    if (!propertyId || !checkIn || !checkOut || !guests) return apiError('请填写所有必填字段', 400, 'VALIDATION_ERROR');

    const property = await findPublishedProperty(db, propertyId);
    if (!property) return apiError('房源不存在', 404, 'PROPERTY_NOT_FOUND');

    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return apiError('用户不存在', 404, 'USER_NOT_FOUND');

    const dateValidation = validateBookingDates(checkIn, checkOut, property.minNights, stayType);
    if (!dateValidation.valid) return apiError(dateValidation.error || '日期无效', 400, 'INVALID_DATES');

    const priceCalc = calculateBookingPrice(property, checkIn, checkOut, stayType);
    const requestedUnitCount = Number(body.unitCount || priceCalc.unitCount);
    const requestedUnitRate = Number(body.unitRate || priceCalc.unitRate);
    if (stayType !== 'NIGHTLY' && requestedUnitCount < getStayTypeMinimumUnits(stayType)) {
      return apiError('预订期限不满足最短要求', 400, 'INVALID_STAY_TYPE_DURATION');
    }
    const booking = await bookingDb.create(db, {
      bookingNumber: generateBookingNumber(),
      propertyId,
      userId: user.id,
      checkIn,
      checkOut,
      nights: priceCalc.nights,
      stayType: priceCalc.stayType,
      unitCount: requestedUnitCount,
      unitRate: requestedUnitRate,
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
      stayType: booking.stayType,
      unitCount: booking.unitCount,
      unitRate: booking.unitRate,
    };

    await sendBookingReceived({
      booking,
      property,
      userEmail: user.email,
      locale: (user as { locale?: string | null }).locale,
    });

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

    const propertySnapshotMap = await findPropertySnapshotMap(db, filtered.map((booking) => booking.propertyId || ''));

    const bookingsWithDetails = filtered.map((booking) => {
      const payments = paymentMap.get(booking.id) || [];
      const paidAmount = payments
        .filter((payment) => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      return {
        ...booking,
        property: propertySnapshotMap.get(booking.propertyId || '') || null,
        review: null,
        payments,
        paidAmount,
      };
    });

    return NextResponse.json({ success: true, bookings: bookingsWithDetails, data: { bookings: bookingsWithDetails } });
  } catch {
    return apiError('获取预订列表失败', 500, 'INTERNAL_ERROR');
  }
}
