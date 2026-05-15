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

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY?: string;
  NEXTAUTH_SECRET?: string;
}

// ── Types ───────────────────────────────────────────────────────────────

interface BookingRow {
  id: string; bookingNumber: string; propertyId: string; userId: string;
  checkIn: string; checkOut: string; nights: number; guests: number;
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

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    INSERT INTO Booking (id, bookingNumber, propertyId, userId, checkIn, checkOut, nights, guests,
      guestName, guestEmail, guestPhone, basePrice, cleaningFee, serviceFee, discount, discountRate,
      tax, totalPrice, currency, specialRequests, status, paymentStatus,
      stripePaymentIntentId, cancelledAt, cancelReason, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(id, data.bookingNumber, data.propertyId, data.userId, data.checkIn, data.checkOut,
    data.nights, data.guests, data.guestName, data.guestEmail, data.guestPhone,
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

async function extractUserId(_request: Request, _env: Env): Promise<string | null> {
  // IMPORTANT: In staging mode, the worker runs standalone.
  // In production (after traffic switch), auth will be done by the main worker
  // which calls this one via service binding with an internal JWT or shared session.
  //
  // For the staging phase: read a header `X-StayNeos-User-Id` set by the main
  // worker when forwarding. For standalone testing, this header can be set
  // manually to a test user ID.
  //
  // When NEXTAUTH_SECRET is configured, also support JWT cookie auth.
  const cookie = _request.headers.get('Cookie') || '';
  // This is a simplified check — full JWT auth is handled by the main worker
  // in production. The staging worker accepts `X-StayNeos-User-Id` header
  // for testing purposes.
  const headerUserId = _request.headers.get('X-StayNeos-User-Id');
  if (headerUserId) return headerUserId;

  // Fallback: try to extract from Authorization header (Bearer JWT)
  const authHeader = _request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // In staging, accept raw user ID as Bearer token for testing
    const token = authHeader.slice(7);
    if (token.length > 10 && !token.includes('.')) {
      // Not a JWT - could be a raw user ID for dev/testing
      return token;
    }
    // TODO: full JWT verify when NEXTAUTH_SECRET is set
  }

  return null;
}

// ── Booking validation ──────────────────────────────────────────────────

function validateBookingDates(checkIn: string, checkOut: string, minNights: number = 1): { valid: boolean; error?: string } {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (isNaN(ci.getTime()) || isNaN(co.getTime())) return { valid: false, error: '无效的日期格式' };
  if (ci <= new Date()) return { valid: false, error: '入住日期必须在今天之后' };
  if (co <= ci) return { valid: false, error: '退房日期必须在入住日期之后' };
  const nights = Math.round((co.getTime() - ci.getTime()) / (86400000));
  if (nights < minNights) return { valid: false, error: `最少需要预订${minNights}天` };
  return { valid: true };
}

// ── Route handlers ──────────────────────────────────────────────────────

const ALLOWED_STATUS: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW'];

async function handleCreateBooking(env: Env, request: Request, userId: string): Promise<Response> {
  const body = await request.json() as {
    propertyId?: string; checkIn?: string; checkOut?: string;
    guests?: number; guestName?: string; guestEmail?: string;
    guestPhone?: string; specialRequests?: string;
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

  const dateValidation = validateBookingDates(checkIn, checkOut, 1);
  if (!dateValidation.valid) return apiError(dateValidation.error || '日期无效', 400, 'INVALID_DATES');

  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  // Simple pricing: base price * nights, 10% service fee, 13% HST
  const basePrice = 200; // Default nightly rate — real pricing uses property.pricePerNight
  const serviceFee = Math.round(basePrice * nights * 0.10);
  const tax = Math.round((basePrice * nights + serviceFee) * 0.13);
  const total = basePrice * nights + serviceFee + tax;

  const booking = await createBooking(env.DB, {
    bookingNumber: generateBookingNumber(),
    propertyId,
    userId,
    checkIn, checkOut, nights, guests: Number(guests),
    guestName: body.guestName || null,
    guestEmail: body.guestEmail || null,
    guestPhone: body.guestPhone || null,
    basePrice, cleaningFee: 50, serviceFee, discount: null, discountRate: null,
    tax, totalPrice: total, currency: 'CAD',
    specialRequests: body.specialRequests || null,
    status: 'PENDING', paymentStatus: 'PENDING',
    stripePaymentIntentId: null, cancelledAt: null, cancelReason: null,
  });

  return json({ success: true, booking: { id: booking.id, bookingNumber: booking.bookingNumber, totalPrice: booking.totalPrice, currency: booking.currency } });
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

  const nextStatus = body.status && ALLOWED_STATUS.includes(body.status as BookingStatus)
    ? body.status as BookingStatus : undefined;

  const payload: Record<string, unknown> = {};
  if (body.checkIn) payload.checkIn = body.checkIn;
  if (body.checkOut) payload.checkOut = body.checkOut;
  if (typeof body.guests === 'number') payload.guests = body.guests;
  if (body.specialRequests !== undefined) payload.specialRequests = body.specialRequests;
  if (nextStatus) payload.status = nextStatus;

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
  const userId = await extractUserId(request, env);

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

export default { fetch: route };
