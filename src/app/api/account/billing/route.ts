import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { requireAccountUser } from "@/lib/account-auth";

export const dynamic = "force-dynamic";

function mapInvoice(row: Record<string, unknown>) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    amount: Number(row.amount || 0),
    currency: row.currency,
    status: row.status,
    stripeInvoiceId: row.stripe_invoice_id,
    issuedAt: row.issued_at,
    paidAt: row.paid_at,
    pdfUrl: row.pdf_url,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAccountUser(request);
  if (auth instanceof NextResponse) return auth;
  const db = getDb();
  const rows = await db.prepare(`SELECT * FROM user_invoices WHERE user_id = ? ORDER BY issued_at DESC`).bind(auth.userId).all<Record<string, unknown>>();
  return NextResponse.json({ invoices: (rows.results || []).map(mapInvoice), todo: 'Stripe invoice sync/webhook pending' });
}
