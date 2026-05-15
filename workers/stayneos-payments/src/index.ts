/**
 * stayneos-payments worker
 *
 * Handles:
 *  - POST /api/payments/webhook   (Stripe webhook)
 *  - POST /api/payments/create-intent (Stripe PaymentIntent creation)
 *  - GET  /health                 (health check)
 *
 * Shares the same D1 database (stayneos-db) as the main worker.
 * Stripe webhook can point directly to this worker or continue to the
 * main worker (which would then forward via service binding).
 */

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXTAUTH_SECRET?: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  propertyId: string;
  userId: string;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  stripePaymentIntentId: string | null;
}

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeCustomerId: string | null;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  status: string;
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  errorMessage: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── D1 helpers ──────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

async function findBookingById(db: D1Database, id: string): Promise<Booking | null> {
  return db.prepare('SELECT * FROM Booking WHERE id = ?').bind(id).first<Booking>();
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

async function findPaymentByIntentId(db: D1Database, pi: string): Promise<Payment | null> {
  return db.prepare('SELECT * FROM Payment WHERE stripePaymentIntentId = ? LIMIT 1').bind(pi).first<Payment>();
}

async function updatePaymentByIntentId(db: D1Database, pi: string, fields: Record<string, unknown>): Promise<void> {
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
  vals.push(pi);
  await db.prepare(`UPDATE Payment SET ${sets.join(', ')} WHERE stripePaymentIntentId = ?`).bind(...vals).run();
}

async function upsertPendingPayment(db: D1Database, input: {
  bookingId: string; amount: number; currency: string;
  stripePaymentIntentId: string; status?: string; metadata?: Record<string, unknown>;
}): Promise<Payment> {
  const existing = await db.prepare(
    'SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1'
  ).bind(input.bookingId).first<Payment>();

  const updatedAt = nowIso();
  const md = input.metadata ? JSON.stringify(input.metadata) : null;

  if (existing) {
    await db.prepare(`
      UPDATE Payment SET amount=?, currency=?, stripePaymentIntentId=?, paymentMethod='CREDIT_CARD',
      status=?, metadata=?, updatedAt=? WHERE id=?
    `).bind(input.amount, input.currency, input.stripePaymentIntentId,
      input.status || 'PENDING', md, updatedAt, existing.id).run();
    return { ...existing, amount: input.amount, currency: input.currency,
      stripePaymentIntentId: input.stripePaymentIntentId, paymentMethod: 'CREDIT_CARD',
      status: input.status || 'PENDING', metadata: md, updatedAt };
  }

  const payment: Payment = {
    id: crypto.randomUUID(), bookingId: input.bookingId, amount: input.amount,
    currency: input.currency, stripePaymentIntentId: input.stripePaymentIntentId,
    stripeChargeId: null, stripeCustomerId: null, paymentMethod: 'CREDIT_CARD',
    cardBrand: null, cardLast4: null, status: input.status || 'PENDING',
    paidAt: null, failedAt: null, refundedAt: null, refundAmount: null,
    refundReason: null, errorMessage: null, metadata: md,
    createdAt: updatedAt, updatedAt,
  };

  await db.prepare(`
    INSERT INTO Payment (id, bookingId, amount, currency, stripePaymentIntentId, stripeChargeId,
      stripeCustomerId, paymentMethod, cardBrand, cardLast4, status, paidAt, failedAt,
      refundedAt, refundAmount, refundReason, errorMessage, metadata, createdAt, updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(payment.id, payment.bookingId, payment.amount, payment.currency,
    payment.stripePaymentIntentId, payment.stripeChargeId, payment.stripeCustomerId,
    payment.paymentMethod, payment.cardBrand, payment.cardLast4, payment.status,
    payment.paidAt, payment.failedAt, payment.refundedAt, payment.refundAmount,
    payment.refundReason, payment.errorMessage, payment.metadata,
    payment.createdAt, payment.updatedAt).run();

  return payment;
}

// ── Stripe helpers ──────────────────────────────────────────────────────

interface StripeEvent {
  id: string; type: string; data: { object: Record<string, unknown> };
  api_version?: string; created: number; livemode: boolean;
}

interface StripePaymentIntent {
  id: string; amount: number; currency: string; status: string;
  metadata: Record<string, string>;
  customer?: string | { id: string };
  latest_charge?: string;
  last_payment_error?: { message: string } | null;
  client_secret?: string;
}

interface StripeCharge {
  id: string; amount: number; amount_refunded: number;
  payment_intent?: string;
  payment_method_details?: {
    card?: { brand: string; last4: string };
  };
}

// Minimal Stripe webhook verification without the full `stripe` SDK
async function verifyStripeWebhook(
  payload: string, signature: string, secret: string, tolerance: number = 300
): Promise<StripeEvent> {
  // Strip the timestamp-scheme prefix
  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.trim().split('=');
    acc[k] = v;
    return acc;
  }, {});

  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) throw new Error('Invalid Stripe signature format');

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(ts, 10)) > tolerance) {
    throw new Error('Timestamp outside tolerance');
  }

  // HMAC-SHA256 verification
  const signedPayload = `${ts}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sigBytes = Uint8Array.from(atob(v1), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signedPayload));
  if (!valid) throw new Error('Invalid signature');

  return JSON.parse(payload) as StripeEvent;
}

// Minimal Stripe REST helpers (no SDK dependency; uses fetch)
function stripeApi(env: Env) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Stripe-Version': '2026-01-28.clover',
  };

  return {
    async createPaymentIntent(params: Record<string, unknown>): Promise<StripePaymentIntent> {
      const body = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) {
          body.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        }
      }
      const res = await fetch('https://api.stripe.com/v1/payment_intents', { method: 'POST', headers, body });
      if (!res.ok) {
        const err = await res.json() as { error?: { message: string } };
        throw new Error(err.error?.message || `Stripe API error ${res.status}`);
      }
      return res.json() as Promise<StripePaymentIntent>;
    },

    async retrieveCharge(id: string): Promise<StripeCharge> {
      const res = await fetch(`https://api.stripe.com/v1/charges/${id}`, { headers });
      if (!res.ok) throw new Error(`Stripe charge retrieve error ${res.status}`);
      return res.json() as Promise<StripeCharge>;
    },
  };
}

// ── Webhook handlers ────────────────────────────────────────────────────

async function handlePaymentSuccess(env: Env, pi: StripePaymentIntent): Promise<void> {
  const db = env.DB;
  const bookingId = pi.metadata.bookingId;
  if (!bookingId) { console.log('[payments] No bookingId in PI metadata'); return; }

  await updateBooking(db, bookingId, { status: 'CONFIRMED', paymentStatus: 'COMPLETED' });

  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  let stripeChargeId: string | null = null;

  if (pi.latest_charge) {
    try {
      const charge = await stripeApi(env).retrieveCharge(pi.latest_charge);
      cardBrand = charge.payment_method_details?.card?.brand || null;
      cardLast4 = charge.payment_method_details?.card?.last4 || null;
      stripeChargeId = charge.id;
    } catch (e) { console.error('[payments] Failed to retrieve charge:', e); }
  }

  const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id || null;

  await updatePaymentByIntentId(db, pi.id, {
    status: 'COMPLETED', stripeChargeId, stripeCustomerId: customerId,
    cardBrand, cardLast4, paidAt: nowIso(),
  });

  console.log(`[payments] Payment success for booking ${bookingId}`);
}

async function handlePaymentFailed(env: Env, pi: StripePaymentIntent): Promise<void> {
  const db = env.DB;
  const bookingId = pi.metadata.bookingId;
  if (!bookingId) { console.log('[payments] No bookingId in PI metadata'); return; }

  await updateBooking(db, bookingId, { paymentStatus: 'FAILED' });
  await updatePaymentByIntentId(db, pi.id, {
    status: 'FAILED', failedAt: nowIso(),
    errorMessage: pi.last_payment_error?.message || null,
  });

  console.log(`[payments] Payment failed for booking ${bookingId}`);
}

async function handleRefund(env: Env, charge: StripeCharge): Promise<void> {
  const db = env.DB;
  const piId = charge.payment_intent;
  if (!piId) return;

  const payment = await findPaymentByIntentId(db, piId);
  if (payment) {
    await updateBooking(db, payment.bookingId, {
      paymentStatus: 'REFUNDED', status: 'CANCELLED',
    });
  }

  await updatePaymentByIntentId(db, piId, {
    status: 'REFUNDED',
    refundAmount: charge.amount_refunded / 100,
    refundedAt: nowIso(),
  });

  console.log(`[payments] Refund processed for PI ${piId}`);
}

// ── Router ──────────────────────────────────────────────────────────────

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = ['https://www.stayneos.com', 'https://neos.rentals', 'https://stayneos.com'];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : 'https://www.stayneos.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
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

async function handleWebhook(env: Env, request: Request): Promise<Response> {
  const sig = request.headers.get('stripe-signature');
  if (!sig) return apiError('Missing Stripe signature', 400, 'MISSING_SIGNATURE');
  if (!env.STRIPE_WEBHOOK_SECRET) return apiError('Webhook secret not configured', 500, 'SERVER_CONFIG');

  const payload = await request.text();

  let event: StripeEvent;
  try {
    event = await verifyStripeWebhook(payload, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('[payments] Webhook verification failed:', (e as Error).message);
    return apiError('Invalid signature', 400, 'INVALID_SIGNATURE');
  }

  console.log(`[payments] Webhook event: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(env, event.data.object as unknown as StripePaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(env, event.data.object as unknown as StripePaymentIntent);
      break;
    case 'charge.refunded':
      await handleRefund(env, event.data.object as unknown as StripeCharge);
      break;
    default:
      console.log(`[payments] Unhandled event: ${event.type}`);
  }

  return json({ received: true });
}

async function handleCreateIntent(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as { bookingId?: string };
  const bookingId = body.bookingId;
  if (!bookingId) return apiError('预订ID不能为空', 400, 'BAD_REQUEST');

  const booking = await findBookingById(env.DB, bookingId);
  if (!booking) return apiError('预订不存在', 404, 'NOT_FOUND');
  if (booking.status === 'CANCELLED') return apiError('预订已取消', 400, 'BAD_REQUEST');
  if (booking.paymentStatus === 'COMPLETED') return apiError('预订已支付', 400, 'BAD_REQUEST');

  const amountInCents = Math.round(Number(booking.totalPrice) * 100);
  const stripe = stripeApi(env);

  const paymentIntent = await stripe.createPaymentIntent({
    amount: amountInCents,
    currency: (booking.currency || 'cad').toLowerCase(),
    metadata: {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      userId: booking.userId,
      propertyId: booking.propertyId,
    },
    description: `预订 #${booking.bookingNumber}`,
  });

  await updateBooking(env.DB, booking.id, {
    stripePaymentIntentId: paymentIntent.id,
    paymentStatus: 'PROCESSING',
  });

  await upsertPendingPayment(env.DB, {
    bookingId: booking.id,
    amount: booking.totalPrice,
    currency: booking.currency,
    stripePaymentIntentId: paymentIntent.id,
    status: 'PENDING',
    metadata: { clientSecret: paymentIntent.client_secret },
  });

  return json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amountInCents,
    currency: booking.currency,
  });
}

// ── Export ──────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      return json({ ok: true, service: 'stayneos-payments', ts: nowIso() }, 200, cors);
    }

    // Stripe webhook
    if (method === 'POST' && path === '/api/payments/webhook') {
      return handleWebhook(env, request);
    }

    // Create payment intent
    if (method === 'POST' && path === '/api/payments/create-intent') {
      const res = await handleCreateIntent(env, request);
      // Merge CORS headers
      const body = await res.json();
      return json(body, res.status, cors);
    }

    return apiError('Not found', 404, 'NOT_FOUND');
  },
};
