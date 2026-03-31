import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { inquiryDb } from "@/lib/inquiry-db";
import { APIError, safeApiHandler } from "@/lib/utils/error-handler";

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "https://neos.rentals",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: JSON_HEADERS });
}

export async function POST(request: Request) {
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
