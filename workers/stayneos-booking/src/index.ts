import { calculateBookingPrice, normalizeStayType, validateBookingDates } from '../../../src/lib/booking';
import { authenticateWorkerRequest, type SessionEnv } from '../../../src/lib/auth/edge-session';
/**
 * stayneos-booking worker
 *
 * Handles:
 *  - POST   /api/bookings            (create booking)
 *  - GET    /api/bookings            (list user's bookings)
 *  - GET    /api/bookings/:id        (get booking detail)
 *  - PATCH  /api/bookings/:id        (update booking)
 *  - DELETE /api/bookings/:id        (cancel booking with refund)
 *  - GET    /api/bookings/:id/review (get review)
 *  - POST   /api/bookings/:id/review (submit review)
 *  - GET    /health                  (health check)
 *
 * Shares D1 (stayneos-db) with the main worker.
 */

interface Env extends SessionEnv {
  DB: D1Database;
  STRIPE_SECRET_KEY?: string;
  NEXTAUTH_SECRET?: string;
}

// ── Types ───────────────────────────────────────────────────────────────

interface BookingRow {
  id: string; bookingNumber: string; propertyId: string; userId: string;
  checkIn: string; checkOut: string; nights: number; stayType: 'NIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'; unitCount: number; unitRate: number; guests: number;
  guestName: string | null; guestEmail: string | null; guestPhone: string | null;
  basePrice: number; cleaningFee: number | null; serviceFee: number | null;
  discount: number | null; discountRate: number | null; tax: number | null;
  totalPrice: number; currency: string; specialRequests: string | null;
  status: string; paymentStatus: string;
  stripePaymentIntentId: string | null;
  cancelledAt: string | null; cancelReason: string | null;
  createdAt: string; updatedAt: string;
}

interface PaymentRow {
  id: string; bookingId: string; amount: number; currency: string;
  stripePaymentIntentId: string | null; status: string;
}

interface ReviewRow {
  id: string; bookingId: string; propertyId: string; userId: string;
  rating: number; comment: string; createdAt: string; updatedAt: string;
}



// ── Helpers ─────────────────────────────────────────────────────────────

function nowIso(): string { return new Date().toISOString(); }

function uuid(): string { return crypto.randomUUID(); }

function generateBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NEOS-${ts}-${rand}`;
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function apiError(message: string, status: number, code: string): Response {
  return json({ error: message, code }, status);
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = ['https://www.stayneos.com', 'https://neos.rentals', 'https://stayneos.com'];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : 'https://www.stayneos.com',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
  };
}

// ── D1 Query Helpers ────────────────────────────────────────────────────

async function findBooking(db: D1Database, id: string): Promise<BookingRow | null> {
  return db.prepare('SELECT * FROM Booking WHERE id = ?').bind(id).first<BookingRow>();
}

async function listBookingsByUser(db: D1Database, userId: string): Promise<BookingRow[]> {
  const res = await db.prepare('SELECT * FROM Booking WHERE userId = ? ORDER BY createdAt DESC')
    .bind(userId).all<BookingRow>();
  return res.results || [];
}

async function findPaymentsByBookingIds(db: D1Database, ids: string[]): Promise<PaymentRow[]> {
  if (ids.length === 0) return [];
  const ph = ids.map(() => '?').join(',');
  const res = await db.prepare(`SELECT * FROM Payment WHERE bookingId IN (${ph}) ORDER BY createdAt DESC`)
    .bind(...ids).all<PaymentRow>();
  return res.results || [];
}

async function findPaymentsByBookingId(db: D1Database, bookingId: string): Promise<PaymentRow[]> {
  const res = await db.prepare('SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC')
    .bind(bookingId).all<PaymentRow>();
  return res.results || [];
}

async function findReviewByBookingId(db: D1Database, bookingId: string): Promise<ReviewRow | null> {
  return db.prepare('SELECT * FROM Review WHERE bookingId = ? LIMIT 1').bind(bookingId).first<ReviewRow>();
}

async function updateBooking(db: D1Database, id: string, fields: Record<string, unknown>): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) {
      sets.push(`${k} = ?`);
      vals.push(v as string | number | null);
    }
  }
  if (sets.length === 0) return;
  sets.push('updatedAt = ?');
  vals.push(nowIso());
  vals.push(id);
  await db.prepare(`UPDATE Booking SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
}

async function createBooking(db: D1Database, data: Omit<BookingRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingRow> {
  const id = uuid();
  const now = nowIso();
  await db.prepare(`
    INSERT INTO Booking (id, bookingNumber, propertyId, userId, checkIn, checkOut, nights, stayType, unitCount, unitRate, guests,
      guestName, guestEmail, guestPhone, basePrice, cleaningFee, serviceFee, discount, discountRate,
      tax, totalPrice, currency, specialRequests, status, paymentStatus,
      stripePaymentIntentId, cancelledAt, cancelReason, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(id, data.bookingNumber, data.propertyId, data.userId, data.checkIn, data.checkOut,
    data.nights, data.stayType, data.unitCount, data.unitRate, data.guests, data.guestName, data.guestEmail, data.guestPhone,
    data.basePrice, data.cleaningFee, data.serviceFee, data.discount, data.discountRate,
    data.tax, data.totalPrice, data.currency, data.specialRequests, data.status,
    data.paymentStatus, data.stripePaymentIntentId, data.cancelledAt, data.cancelReason, now, now).run();

  return { ...data, id, createdAt: now, updatedAt: now };
}

async function upsertReview(db: D1Database, data: {
  bookingId: string; propertyId: string; userId: string; rating: number; comment: string;
}): Promise<ReviewRow> {
  const now = nowIso();
  const existing = await findReviewByBookingId(db, data.bookingId);
  if (existing) {
    await db.prepare('UPDATE Review SET rating=?, comment=?, updatedAt=? WHERE bookingId=?')
      .bind(data.rating, data.comment, now, data.bookingId).run();
    return { ...existing, rating: data.rating, comment: data.comment, updatedAt: now };
  }
  const id = uuid();
  await db.prepare(`
    INSERT INTO Review (id, bookingId, propertyId, userId, rating, comment, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?)
  `).bind(id, data.bookingId, data.propertyId, data.userId, data.rating, data.comment, now, now).run();
  return { id, ...data, createdAt: now, updatedAt: now };
}

// ── Stripe refund helper ────────────────────────────────────────────────

async function processRefund(env: Env, paymentIntentId: string, bookingId: string): Promise<{ status: string }> {
  if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');

  const res = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2026-01-28.clover',
    },
    body: new URLSearchParams({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      'metadata[bookingId]': bookingId,
    }),
  });

  const data = await res.json() as { status?: string; error?: { message: string } };
  if (!res.ok) throw new Error(data.error?.message || `Refund API error ${res.status}`);
  return { status: data.status || 'unknown' };
}

async function updatePaymentByIntentId(db: D1Database, pi: string, fields: Record<string, unknown>): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
  }
  if (sets.length === 0) return;
  sets.push('updatedAt = ?'); vals.push(nowIso()); vals.push(pi);
  await db.prepare(`UPDATE Payment SET ${sets.join(', ')} WHERE stripePaymentIntentId = ?`).bind(...vals).run();
}

// ── Auth helpers (minimal JWT verification without full Next.js Auth) ───

// ── Booking validation ──────────────────────────────────────────────────

async function handleCreateBooking(env: Env, request: Request, userId: string): Promise<Response> {
  const body = await request.json() as {
    propertyId?: string; checkIn?: string; checkOut?: string;
    guests?: number; guestName?: string; guestEmail?: string;
    guestPhone?: string; specialRequests?: string; stayType?: string; unitCount?: number; unitRate?: number;
  };

  const { propertyId, checkIn, checkOut, guests } = body;
  if (!propertyId || !checkIn || !checkOut || !guests) {
    return apiError('请填写所有必填字段', 400, 'VALIDATION_ERROR');
  }

  // Verify property exists
  const property = await env.DB.prepare(
    "SELECT * FROM Property WHERE (id=? OR slug=?) AND status='PUBLISHED' LIMIT 1"
  ).bind(propertyId, propertyId).first();
  if (!property) return apiError('房源不存在', 404, 'PROPERTY_NOT_FOUND');

  const stayType = normalizeStayType(body.stayType);
  const dateValidation = validateBookingDates(checkIn, checkOut, Number(property.minStayDays || 1), stayType);
  if (!Number.isInteger(guests) || guests < 1 || guests > Math.max(1, Number(property.bedrooms || 1) * 2)) return apiError('Invalid guest count', 400, 'VALIDATION_ERROR');
  if (!dateValidation.valid) return apiError(dateValidation.error || '日期无效', 400, 'INVALID_DATES');

  // Client prices and unit counts are never authoritative.
  const price = calculateBookingPrice({
    ...property,
    price: Number(property.monthlyRate || property.priceMonthly || 0),
    minNights: Number(property.minStayDays || 1),
    currency: String(property.currency || 'CAD'),
  }, checkIn, checkOut, stayType);
  if (!Number.isFinite(price.total) || price.total <= 0) return apiError('Invalid price', 400, 'INVALID_AMOUNT');

  const booking = await createBooking(env.DB, {
    bookingNumber: generateBookingNumber(),
    propertyId: String(property.id),
    userId,
    checkIn, checkOut, nights: price.nights, stayType, unitCount: price.unitCount, unitRate: price.unitRate, guests: Number(guests),
    guestName: body.guestName || null,
    guestEmail: body.guestEmail || null,
    guestPhone: body.guestPhone || null,
    basePrice: price.basePrice, cleaningFee: price.cleaningFee, serviceFee: price.serviceFee, discount: price.discount, discountRate: price.discountRate,
    tax: price.tax, totalPrice: price.total, currency: price.currency,
    specialRequests: body.specialRequests || null,
    status: 'PENDING', paymentStatus: 'PENDING',
    stripePaymentIntentId: null, cancelledAt: null, cancelReason: null,
  });

  return json({ success: true, booking: { id: booking.id, bookingNumber: booking.bookingNumber, totalPrice: booking.totalPrice, currency: booking.currency, stayType: booking.stayType, unitCount: booking.unitCount, unitRate: booking.unitRate } });
}

async function handleListBookings(env: Env, _request: Request, userId: string): Promise<Response> {
  const url = new URL(_request.url);
  const statusFilter = url.searchParams.get('status');
  const bookings = await listBookingsByUser(env.DB, userId);
  const now = new Date();

  const filtered = bookings.filter(b => {
    const ci = new Date(b.checkIn);
    if (!statusFilter || statusFilter === 'all') return true;
    if (statusFilter === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(b.status) && ci >= now;
    if (statusFilter === 'completed') return b.status === 'CHECKED_OUT';
    if (statusFilter === 'active') return ['CONFIRMED', 'CHECKED_IN'].includes(b.status);
    return b.status === statusFilter;
  });

  const payments = await findPaymentsByBookingIds(env.DB, filtered.map(b => b.id));
  const paymentMap = new Map<string, PaymentRow[]>();
  for (const p of payments) {
    const arr = paymentMap.get(p.bookingId) || [];
    arr.push(p);
    paymentMap.set(p.bookingId, arr);
  }

  const result = filtered.map(b => {
    const ps = paymentMap.get(b.id) || [];
    const paid = ps.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
    return { ...b, payments: ps, paidAmount: paid, review: null, property: null };
  });

  return json({ success: true, bookings: result });
}

async function handleGetBooking(env: Env, _request: Request, userId: string, id: string): Promise<Response> {
  const booking = await findBooking(env.DB, id);
  if (!booking || booking.userId !== userId) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');

  const payments = await findPaymentsByBookingId(env.DB, booking.id);
  const review = await findReviewByBookingId(env.DB, booking.id);

  return json({ success: true, booking: { ...booking, payments, review, property: null } });
}

async function handleUpdateBooking(env: Env, _request: Request, userId: string, id: string): Promise<Response> {
  const booking = await findBooking(env.DB, id);
  if (!booking || booking.userId !== userId) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');

  const body = await _request.json().catch(() => ({})) as {
    checkIn?: string; checkOut?: string; guests?: number;
    specialRequests?: string | null; status?: string;
  };

  // Changing a paid quote needs the main booking amendment/payment flow.
  if (body.status !== undefined || body.checkIn !== undefined || body.checkOut !== undefined || body.guests !== undefined) {
    return apiError('Only special requests can be edited here', 400, 'IMMUTABLE_BOOKING_FIELDS');
  }
  const payload: Record<string, unknown> = {};
  if (body.specialRequests !== undefined) {
    if (body.specialRequests !== null && (typeof body.specialRequests !== 'string' || body.specialRequests.length > 4000)) return apiError('Invalid special requests', 400, 'VALIDATION_ERROR');
    payload.specialRequests = body.specialRequests;
  }

  if (Object.keys(payload).length === 0) {
    return apiError('无可更新字段', 400, 'NO_UPDATE_FIELDS');
  }

  await updateBooking(env.DB, id, payload);
  const updated = await findBooking(env.DB, id);
  return json({ success: true, booking: updated, message: '预订更新成功' });
}

async function handleCancelBooking(env: Env, _request: Request, userId: string, id: string): Promise<Response> {
  const booking = await findBooking(env.DB, id);
  if (!booking || booking.userId !== userId) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');
  if (booking.status === 'CANCELLED') return apiError('预订已取消', 400, 'ALREADY_CANCELLED');
  if (booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
    return apiError('已入住或已完成的预订无法取消', 400, 'INVALID_CANCEL_STATE');
  }

  const body = await _request.json().catch(() => ({})) as { reason?: string };
  const payments = await findPaymentsByBookingId(env.DB, booking.id);
  const completedPayment = payments.find(p => p.status === 'COMPLETED');
  const cancelledAt = nowIso();

  let paymentStatus = booking.paymentStatus;
  let message = '预订已成功取消';

  if (completedPayment?.stripePaymentIntentId && env.STRIPE_SECRET_KEY) {
    try {
      const refund = await processRefund(env, completedPayment.stripePaymentIntentId, booking.id);
      paymentStatus = refund.status === 'succeeded' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await updatePaymentByIntentId(env.DB, completedPayment.stripePaymentIntentId, {
        status: 'REFUNDED', refundedAt: cancelledAt,
        refundAmount: booking.totalPrice,
        refundReason: body.reason || 'Customer cancellation',
      });
      message = '预订已取消，退款已发起';
    } catch (e) {
      console.error('[booking] Refund failed:', (e as Error).message);
      paymentStatus = booking.paymentStatus;
      message = '预订已取消，退款处理中';
    }
  }

  await updateBooking(env.DB, id, {
    status: 'CANCELLED', paymentStatus, cancelledAt,
    cancelReason: body.reason || null,
  });

  const updated = await findBooking(env.DB, id);
  return json({ success: true, booking: updated, message });
}

async function handleGetReview(env: Env, id: string, userId: string): Promise<Response> {
  const booking = await findBooking(env.DB, id);
  if (!booking || booking.userId !== userId) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');

  const review = await findReviewByBookingId(env.DB, booking.id);
  return json({ success: true, review });
}

async function handleSubmitReview(env: Env, _request: Request, id: string, userId: string): Promise<Response> {
  const booking = await findBooking(env.DB, id);
  if (!booking || booking.userId !== userId) return apiError('预订不存在', 404, 'BOOKING_NOT_FOUND');
  if (booking.status !== 'CHECKED_OUT') return apiError('仅已完成预订可评价', 400, 'BAD_REQUEST');

  const body = await _request.json().catch(() => ({})) as { rating?: number; comment?: string };
  const rating = Number(body.rating);
  const comment = (body.comment || '').trim();
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return apiError('评分必须在 1-5', 400, 'BAD_REQUEST');
  if (!comment) return apiError('请填写评价内容', 400, 'BAD_REQUEST');

  const review = await upsertReview(env.DB, {
    bookingId: booking.id, propertyId: booking.propertyId,
    userId: booking.userId, rating, comment,
  });

  return json({ success: true, review });
}

// ── Router ──────────────────────────────────────────────────────────────

async function route(env: Env, request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const cors = corsHeaders(request);

  // Health check
  if (method === 'GET' && path === '/health') {
    return json({ ok: true, service: 'stayneos-booking', ts: nowIso() }, 200, cors);
  }

  // Extract user identity
  const identity = await authenticateWorkerRequest(request, env);
  const userId = identity?.userId;

  // Booking review routes (before general /:id routes)
  const reviewMatch = path.match(/^\/api\/bookings\/([^\/]+)\/review$/);
  if (reviewMatch) {
    const bookingId = reviewMatch[1];
    if (!userId) return apiError('请先登录', 401, 'UNAUTHORIZED');

    if (method === 'GET') {
      const res = await handleGetReview(env, bookingId, userId);
      return res;
    }
    if (method === 'POST') {
      const res = await handleSubmitReview(env, request, bookingId, userId);
      return res;
    }
  }

  // Booking by ID routes
  const idMatch = path.match(/^\/api\/bookings\/([^\/]+)$/);
  if (idMatch) {
    const bookingId = idMatch[1];
    if (!userId) return apiError('请先登录', 401, 'UNAUTHORIZED');

    if (method === 'GET') return handleGetBooking(env, request, userId, bookingId);
    if (method === 'PATCH') return handleUpdateBooking(env, request, userId, bookingId);
    if (method === 'DELETE') return handleCancelBooking(env, request, userId, bookingId);
  }

  // Booking list / create
  if (path === '/api/bookings') {
    if (!userId) return apiError('请先登录', 401, 'UNAUTHORIZED');

    if (method === 'POST') return handleCreateBooking(env, request, userId);
    if (method === 'GET') return handleListBookings(env, request, userId);
  }

  return apiError('Not found', 404, 'NOT_FOUND');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try { return await route(env, request); }
    catch { return apiError('Request could not be processed', 500, 'INTERNAL_ERROR'); }
  },
};
