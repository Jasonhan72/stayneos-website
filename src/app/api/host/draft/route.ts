import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb, userDb } from "@/lib/d1";

export const dynamic = "force-dynamic";

/**
 * POST /api/host/draft — create a new draft id.
 *
 * The wizard primarily stores drafts in the client's localStorage; this endpoint
 * exists so we can wire server persistence later without breaking the front-end
 * contract. For now it just mints an ID and echoes the payload back.
 */
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUserFromRequest(req);
  if (!currentUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const user = await userDb.findByEmail(db, currentUser.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!["ADMIN", "SUPER_ADMIN", "HOST"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const draftId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `draft_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return NextResponse.json({
    draftId,
    storage: "client-localstorage",
    draft: { ...body, draftId, step: 0 },
  });
}
