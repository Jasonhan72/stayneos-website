import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { getCurrentUserFromRequest } from "@/lib/auth/server";
import { apiError } from "@/lib/api/response";
import * as msgDb from "@/lib/messaging-db";

function parseAttachments(json?: string | null) {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toApi(m: msgDb.MessageRow) {
  return {
    id: m.id,
    conversation_id: m.conversation_id,
    conversationId: m.conversation_id,
    sender_id: m.sender_id,
    senderId: m.sender_id,
    body: m.body,
    attachments_json: m.attachments_json,
    attachmentsJson: m.attachments_json,
    attachments: parseAttachments(m.attachments_json),
    created_at: m.created_at,
    createdAt: m.created_at,
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");
  const { id: conversationId } = await params;

  try {
    const db = getDb();
    if (!(await msgDb.isParticipant(db, conversationId, user.userId))) {
      return apiError("Forbidden: not a participant", 403, "FORBIDDEN");
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);
    const markRead = url.searchParams.get("markRead") !== "false";
    const { messages, nextCursor } = await msgDb.getMessages(db, conversationId, cursor, limit);
    if (markRead) await msgDb.updateLastRead(db, conversationId, user.userId);
    return NextResponse.json({ messages: messages.map(toApi), cursor: nextCursor });
  } catch (e) {
    console.error("[messages:GET]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");
  const { id: conversationId } = await params;

  try {
    const db = getDb();
    if (!(await msgDb.isParticipant(db, conversationId, user.userId))) {
      return apiError("Forbidden: not a participant", 403, "FORBIDDEN");
    }

    const body = (await request.json()) as { body?: string; attachmentsJson?: string; attachments?: unknown[] };
    const attachmentsJson = body.attachmentsJson ?? JSON.stringify(Array.isArray(body.attachments) ? body.attachments : []);
    if (!body.body?.trim() && parseAttachments(attachmentsJson).length === 0) {
      return apiError("Missing message body", 400, "BAD_REQUEST");
    }

    const msg = await msgDb.createMessage(db, conversationId, user.userId, body.body?.trim() || "", attachmentsJson);
    return NextResponse.json({ message: toApi(msg) }, { status: 201 });
  } catch (e) {
    console.error("[messages:POST]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");
  const { id: conversationId } = await params;
  try {
    const db = getDb();
    if (!(await msgDb.isParticipant(db, conversationId, user.userId))) return apiError("Forbidden", 403, "FORBIDDEN");
    await msgDb.updateLastRead(db, conversationId, user.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[messages:PATCH]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
