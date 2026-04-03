import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { inquiryDb } from "@/lib/inquiry-db";
import { APIError, safeApiHandler } from "@/lib/utils/error-handler";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateCsrf } from "@/lib/security/csrf";
import { apiError } from "@/lib/api/response";

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "https://neos.rentals",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-csrf-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: JSON_HEADERS });
}

export async function POST(request: Request) {
  const rate = checkRateLimit(request, 'contact:submit', { limit: 10, windowMs: 60_000 });
  if (!rate.allowed) return apiError('Too many contact submissions', 429, 'RATE_LIMITED');

  if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');

  return safeApiHandler(async () => {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!body.name || !body.email || !body.message) {
      throw new APIError("Missing required fields", 400, "BAD_REQUEST");
    }

    const db = getDb();

    await inquiryDb.create(db, {
      type: "contact",
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || "Contact inquiry",
      message: body.message,
      metadata: body,
    });

    return NextResponse.json({ success: true }, { status: 201, headers: JSON_HEADERS });
  });
}
