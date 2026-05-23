import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";
import { stripe } from "@/lib/stripe";
import { validateCsrf } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";

function getPaymentMethodCustomerId(pm: { customer?: string | { id?: string } | null }): string | null {
  const customer = pm.customer;
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id ?? null;
}

async function requireOwnedPaymentMethod(paymentMethodId: string, customerId: string) {
  if (typeof stripe.paymentMethods?.retrieve !== "function") {
    return { ok: false as const, response: NextResponse.json({ error: "Stripe not configured" }, { status: 503 }) };
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (getPaymentMethodCustomerId(paymentMethod) !== customerId) {
    return { ok: false as const, response: NextResponse.json({ error: "Payment method not found" }, { status: 404 }) };
  }

  return { ok: true as const, paymentMethod };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ paymentMethodId: string }> }) {
  try {
    if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { paymentMethodId } = await params;
    const db = getDb();
    const user = await userDb.findById(db, auth.userId);
    const customerId = (user as typeof user & { stripeCustomerId?: string | null })?.stripeCustomerId;
    if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const ownership = await requireOwnedPaymentMethod(paymentMethodId, customerId);
    if (!ownership.ok) return ownership.response;

    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("account/payments:patch", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ paymentMethodId: string }> }) {
  try {
    if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { paymentMethodId } = await params;
    const db = getDb();
    const user = await userDb.findById(db, auth.userId);
    const customerId = (user as typeof user & { stripeCustomerId?: string | null })?.stripeCustomerId;
    if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const ownership = await requireOwnedPaymentMethod(paymentMethodId, customerId);
    if (!ownership.ok) return ownership.response;

    await stripe.paymentMethods.detach(paymentMethodId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("account/payments:delete", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
