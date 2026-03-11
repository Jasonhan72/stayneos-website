import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { inquiryDb, InquiryType } from "@/lib/inquiry-db";

const VALID_TYPES = new Set<InquiryType>([
  "agents",
  "hosts",
  "business",
  "students",
  "long_term",
  "contact",
  "market_insights",
]);

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

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = (await request.json()) as {
      type?: InquiryType;
      payload?: Record<string, unknown>;
      [key: string]: unknown;
    };

    if (!body.type || !VALID_TYPES.has(body.type)) {
      return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
    }

    const normalizedPayload =
      body.payload && typeof body.payload === "object"
        ? body.payload
        : (body as Record<string, unknown>);

    if (!normalizedPayload || typeof normalizedPayload !== "object") {
      return NextResponse.json({ error: "Invalid inquiry payload" }, { status: 400 });
    }

    const inquiry = buildInquiryRecord(body.type, normalizedPayload);

    if (!inquiry.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await inquiryDb.create(db, {
      type: body.type,
      ...inquiry,
      metadata: normalizedPayload,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}

