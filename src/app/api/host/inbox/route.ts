import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

type InquiryRow = {
  id: string;
  type: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

// GET /api/host/inbox
//
// Guest messaging proper (threaded per-booking chat) is still on the roadmap;
// for now the host inbox aggregates inquiries / contact submissions that the
// website funnels into the Inquiry table. This at least gives the host a
// single place to see incoming leads instead of the stub "coming soon" page.
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status"); // optional

    const query = statusFilter
      ? `SELECT id, type, name, email, phone, company, subject, message, status, createdAt
           FROM Inquiry
          WHERE UPPER(status) = UPPER(?)
          ORDER BY createdAt DESC
          LIMIT 200`
      : `SELECT id, type, name, email, phone, company, subject, message, status, createdAt
           FROM Inquiry
          ORDER BY createdAt DESC
          LIMIT 200`;

    const stmt = statusFilter ? db.prepare(query).bind(statusFilter) : db.prepare(query);
    const { results } = await stmt.all<InquiryRow>();

    const byStatus = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CLOSED: 0 } as Record<string, number>;
    for (const r of results ?? []) {
      const key = (r.status ?? "NEW").toUpperCase();
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }

    const res = NextResponse.json({
      inquiries: results ?? [],
      counts: byStatus,
    });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  } catch (err) {
    console.error("host/inbox:get", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/host/inbox — update inquiry status.
// Body: { id: string; status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED' }
export async function PATCH(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as { id?: unknown; status?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status.toUpperCase() : "";

    const allowed = new Set(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]);
    if (!id || !allowed.has(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    await db
      .prepare(
        `UPDATE Inquiry SET status = ?, updatedAt = datetime('now') WHERE id = ?`
      )
      .bind(status, id)
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("host/inbox:patch", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
