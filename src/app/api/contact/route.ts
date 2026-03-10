import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { inquiryDb } from "@/lib/inquiry-db";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await inquiryDb.create(db, {
      type: "contact",
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || "Contact inquiry",
      message: body.message,
      metadata: body,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}

