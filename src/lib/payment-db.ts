import { getDb } from "@/lib/d1";

export interface Payment {
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
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" | "DISPUTED";
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

interface UpsertPaymentInput {
  bookingId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  paymentMethod?: string;
  status?: Payment["status"];
  metadata?: Record<string, unknown>;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const paymentDb = {
  async findByBookingId(db: ReturnType<typeof getDb>, bookingId: string): Promise<Payment[]> {
    const result = await db
      .prepare("SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC")
      .bind(bookingId)
      .all<Payment>();

    return result.results || [];
  },

  async findLatestByBookingId(db: ReturnType<typeof getDb>, bookingId: string): Promise<Payment | null> {
    return (
      (await db
        .prepare("SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1")
        .bind(bookingId)
        .first<Payment>()) || null
    );
  },

  async findByPaymentIntentId(db: ReturnType<typeof getDb>, stripePaymentIntentId: string): Promise<Payment | null> {
    return (
      (await db
        .prepare("SELECT * FROM Payment WHERE stripePaymentIntentId = ? LIMIT 1")
        .bind(stripePaymentIntentId)
        .first<Payment>()) || null
    );
  },

  async upsertPending(db: ReturnType<typeof getDb>, input: UpsertPaymentInput): Promise<Payment> {
    const existing = await this.findLatestByBookingId(db, input.bookingId);
    const updatedAt = nowIso();
    const metadata = input.metadata ? JSON.stringify(input.metadata) : null;

    if (existing) {
      await db
        .prepare(`
          UPDATE Payment
          SET amount = ?, currency = ?, stripePaymentIntentId = ?, paymentMethod = ?, status = ?, metadata = ?, updatedAt = ?
          WHERE id = ?
        `)
        .bind(
          input.amount,
          input.currency,
          input.stripePaymentIntentId,
          input.paymentMethod || "CREDIT_CARD",
          input.status || "PENDING",
          metadata,
          updatedAt,
          existing.id
        )
        .run();

      return {
        ...existing,
        amount: input.amount,
        currency: input.currency,
        stripePaymentIntentId: input.stripePaymentIntentId,
        paymentMethod: input.paymentMethod || "CREDIT_CARD",
        status: input.status || "PENDING",
        metadata,
        updatedAt,
      };
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      bookingId: input.bookingId,
      amount: input.amount,
      currency: input.currency,
      stripePaymentIntentId: input.stripePaymentIntentId,
      stripeChargeId: null,
      stripeCustomerId: null,
      paymentMethod: input.paymentMethod || "CREDIT_CARD",
      cardBrand: null,
      cardLast4: null,
      status: input.status || "PENDING",
      paidAt: null,
      failedAt: null,
      refundedAt: null,
      refundAmount: null,
      refundReason: null,
      errorMessage: null,
      metadata,
      createdAt: updatedAt,
      updatedAt,
    };

    await db
      .prepare(`
        INSERT INTO Payment (
          id, bookingId, amount, currency, stripePaymentIntentId, stripeChargeId, stripeCustomerId,
          paymentMethod, cardBrand, cardLast4, status, paidAt, failedAt, refundedAt, refundAmount,
          refundReason, errorMessage, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        payment.id,
        payment.bookingId,
        payment.amount,
        payment.currency,
        payment.stripePaymentIntentId,
        payment.stripeChargeId,
        payment.stripeCustomerId,
        payment.paymentMethod,
        payment.cardBrand,
        payment.cardLast4,
        payment.status,
        payment.paidAt,
        payment.failedAt,
        payment.refundedAt,
        payment.refundAmount,
        payment.refundReason,
        payment.errorMessage,
        payment.metadata,
        payment.createdAt,
        payment.updatedAt
      )
      .run();

    return payment;
  },

  async updateByPaymentIntentId(
    db: ReturnType<typeof getDb>,
    stripePaymentIntentId: string,
    data: Partial<Pick<
      Payment,
      | "status"
      | "stripeChargeId"
      | "stripeCustomerId"
      | "cardBrand"
      | "cardLast4"
      | "paidAt"
      | "failedAt"
      | "refundedAt"
      | "refundAmount"
      | "refundReason"
      | "errorMessage"
      | "metadata"
    >>
  ): Promise<void> {
    const sets: string[] = [];
    const values: Array<string | number | null> = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        values.push(value as string | number | null);
      }
    }

    if (sets.length === 0) {
      return;
    }

    sets.push("updatedAt = ?");
    values.push(nowIso());
    values.push(stripePaymentIntentId);

    await db
      .prepare(`UPDATE Payment SET ${sets.join(", ")} WHERE stripePaymentIntentId = ?`)
      .bind(...values)
      .run();
  },
};

