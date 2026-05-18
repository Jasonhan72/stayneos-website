import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/host/draft/[id] — stub. Drafts live in localStorage today; this
 * endpoint exists so we can move to server persistence later.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
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
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return NextResponse.json({
    draftId: id,
    storage: "client-localstorage",
    note: "Drafts are stored in the browser. This endpoint returns no data.",
  });
}
