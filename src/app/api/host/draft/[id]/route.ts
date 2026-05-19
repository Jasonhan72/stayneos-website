import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

async function ensureHost(req: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(req);
  if (!currentUser?.email) return null;
  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);
  if (!user) return null;
  if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) return null;
  return true;
}

/**
 * PATCH /api/host/draft/[id] — stub. Drafts live in localStorage today; this
 * endpoint exists so we can move to server persistence later.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!validateCsrf(req)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  if (!(await ensureHost(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  return NextResponse.json({
    draftId: id,
    storage: "client-localstorage",
    updated: body,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await ensureHost(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  return NextResponse.json({
    draftId: id,
    storage: "client-localstorage",
    note: "Drafts are stored in the browser. This endpoint returns no data.",
  });
}
