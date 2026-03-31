import { NextResponse } from "next/server";
import { inquiryDb, InquiryType } from "@/lib/inquiry-db";
import { getDb } from "@/lib/d1";
import { APIError, safeApiHandler } from "@/lib/utils/error-handler";

const VALID_TYPES = new Set<InquiryType>([
  "agents",
  "hosts",
  "business",
  "students",
  "long_term",
  "contact",
  "market_insights",
]);

const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "https://neos.rentals",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function buildInquiryRecord(type: InquiryType, payload: Record<string, unknown>) {
  switch (type) {
    case "agents":
      return {
        name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: payload.company ? String(payload.company) : null,
        subject: "Agent partnership inquiry",
        message: payload.message ? String(payload.message) : null,
      };
    case "hosts":
      return {
        name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: null,
        subject: "Host application",
        message: payload.message ? String(payload.message) : null,
      };
    case "business":
      return {
        name: payload.contactName ? String(payload.contactName) : null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: payload.companyName ? String(payload.companyName) : null,
        subject: "Business housing inquiry",
        message: payload.requirements ? String(payload.requirements) : null,
      };
    case "students":
      return {
        name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: payload.university ? String(payload.university) : null,
        subject: "Student housing inquiry",
        message: payload.message ? String(payload.message) : null,
      };
    case "long_term":
      return {
        name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: null,
        subject: "Long-term rental inquiry",
        message: payload.message ? String(payload.message) : null,
      };
    case "contact":
      return {
        name: payload.name ? String(payload.name) : null,
        email: String(payload.email || ""),
        phone: payload.phone ? String(payload.phone) : null,
        company: null,
        subject: payload.subject ? String(payload.subject) : "Contact inquiry",
        message: payload.message ? String(payload.message) : null,
      };
    case "market_insights":
      return {
        name: [payload.firstName, payload.lastName].filter(Boolean).join(" ") || null,
        email: String(payload.email || ""),
        phone: null,
        company: payload.company ? String(payload.company) : null,
        subject: "Market insights report request",
        message: payload.jobTitle ? String(payload.jobTitle) : null,
      };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: JSON_HEADERS });
}

export async function POST(request: Request) {
  return safeApiHandler(async () => {
    const body = (await request.json()) as {
      type?: InquiryType;
      payload?: Record<string, unknown>;
      [key: string]: unknown;
    };

    if (!body.type || !VALID_TYPES.has(body.type)) {
      throw new APIError("Invalid inquiry type", 400, "BAD_REQUEST");
    }

    const normalizedPayload =
      body.payload && typeof body.payload === "object"
        ? body.payload
        : (body as Record<string, unknown>);

    if (!normalizedPayload || typeof normalizedPayload !== "object") {
      throw new APIError("Invalid inquiry payload", 400, "BAD_REQUEST");
    }

    const inquiry = buildInquiryRecord(body.type, normalizedPayload);

    if (!inquiry.email) {
      throw new APIError("Email is required", 400, "BAD_REQUEST");
    }

    const db = getDb();

    await inquiryDb.create(db, {
      type: body.type,
      ...inquiry,
      metadata: normalizedPayload,
    });

    return NextResponse.json({ success: true }, { status: 201, headers: JSON_HEADERS });
  });
}
