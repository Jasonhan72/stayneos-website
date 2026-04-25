import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ invoiceId: string }> }) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const { invoiceId } = await context.params;
  const db = getDb();
  const row = await db.prepare(`SELECT * FROM user_invoices WHERE id = ? AND user_id = ?`).bind(invoiceId, auth.userId).first<Record<string, unknown>>();
  if (!row) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  return NextResponse.json({
    invoice: {
      id: row.id,
      bookingId: row.booking_id,
      amount: Number(row.amount || 0),
      currency: row.currency,
      status: row.status,
      stripeInvoiceId: row.stripe_invoice_id,
      issuedAt: row.issued_at,
      paidAt: row.paid_at,
      pdfUrl: row.pdf_url,
    },
    todo: 'Stripe invoice sync/webhook pending',
  });
}
