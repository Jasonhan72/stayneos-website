import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

type Prefs = {
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  specialOffers: boolean;
  newsletter: boolean;
  hostPayouts: boolean;
  hostNewInquiries: boolean;
  productUpdates: boolean;
  smsBookingUpdates: boolean;
  smsPromotions: boolean;
};

const DEFAULTS: Prefs = {
  bookingConfirmations: true,
  bookingReminders: true,
  specialOffers: false,
  newsletter: true,
  hostPayouts: true,
  hostNewInquiries: true,
  productUpdates: true,
  smsBookingUpdates: false,
  smsPromotions: false,
};

function flag(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return fallback;
}

function rowToPrefs(row?: Record<string, unknown> | null): Prefs {
  if (!row) return DEFAULTS;

  return {
    bookingConfirmations: flag(row.booking_confirmations, DEFAULTS.bookingConfirmations),
    bookingReminders: flag(row.booking_reminders, DEFAULTS.bookingReminders),
    specialOffers: flag(row.special_offers, DEFAULTS.specialOffers),
    newsletter: flag(row.newsletter, DEFAULTS.newsletter),
    hostPayouts: flag(row.host_payouts, DEFAULTS.hostPayouts),
    hostNewInquiries: flag(row.host_new_inquiries, DEFAULTS.hostNewInquiries),
    productUpdates: flag(row.product_updates, DEFAULTS.productUpdates),
    smsBookingUpdates: flag(row.sms_booking_updates, DEFAULTS.smsBookingUpdates),
    smsPromotions: flag(row.sms_promotions, DEFAULTS.smsPromotions),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const row = await db
      .prepare("SELECT * FROM user_notification_preferences WHERE user_id = ?")
      .bind(auth.userId)
      .first<Record<string, unknown>>();

    return NextResponse.json({ preferences: rowToPrefs(row) });
  } catch (error) {
    console.error("account/notifications:get", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const auth = await getCurrentUserFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<Prefs>;
    const merged: Prefs = { ...DEFAULTS, ...body };
    const db = getDb();
    const now = new Date().toISOString();

    await db
      .prepare(`
        INSERT INTO user_notification_preferences (
          user_id,
          booking_confirmations,
          booking_reminders,
          special_offers,
          newsletter,
          host_payouts,
          host_new_inquiries,
          product_updates,
          sms_booking_updates,
          sms_promotions,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          booking_confirmations = excluded.booking_confirmations,
          booking_reminders = excluded.booking_reminders,
          special_offers = excluded.special_offers,
          newsletter = excluded.newsletter,
          host_payouts = excluded.host_payouts,
          host_new_inquiries = excluded.host_new_inquiries,
          product_updates = excluded.product_updates,
          sms_booking_updates = excluded.sms_booking_updates,
          sms_promotions = excluded.sms_promotions,
          updated_at = excluded.updated_at
      `)
      .bind(
        auth.userId,
        merged.bookingConfirmations ? 1 : 0,
        merged.bookingReminders ? 1 : 0,
        merged.specialOffers ? 1 : 0,
        merged.newsletter ? 1 : 0,
        merged.hostPayouts ? 1 : 0,
        merged.hostNewInquiries ? 1 : 0,
        merged.productUpdates ? 1 : 0,
        merged.smsBookingUpdates ? 1 : 0,
        merged.smsPromotions ? 1 : 0,
        now,
        now,
      )
      .run();

    return NextResponse.json({ preferences: merged });
  } catch (error) {
    console.error("account/notifications:patch", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
