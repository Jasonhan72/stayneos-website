import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { getCurrentUserFromRequest } from "@/lib/auth/server";
import { apiError } from "@/lib/api/response";
import * as msgDb from "@/lib/messaging-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const { id: conversationId } = await params;

  try {
    const db = getDb();

    // Verify participation
    const isPart = await msgDb.isParticipant(db, conversationId, user.userId);
    if (!isPart) {
      return apiError("Forbidden: not a participant", 403, "FORBIDDEN");
    }

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    const { messages, nextCursor } = await msgDb.getMessages(db, conversationId, cursor, limit);

    // Transform to API format (snake_case + camelCase for backwards compat)
    const result = messages.map((m) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      conversationId: m.conversation_id,
      sender_id: m.sender_id,
      senderId: m.sender_id,
      body: m.body,
      attachments_json: m.attachments_json,
      attachmentsJson: m.attachments_json,
      created_at: m.created_at,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ messages: result, cursor: nextCursor });
  } catch (e) {
    console.error("[messages:GET]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  const { id: conversationId } = await params;

  try {
    const db = getDb();

    const isPart = await msgDb.isParticipant(db, conversationId, user.userId);
    if (!isPart) {
      return apiError("Forbidden: not a participant", 403, "FORBIDDEN");
    }

    const body = (await request.json()) as {
      body: string;
      attachmentsJson?: string;
    };

    if (!body.body?.trim()) {
      return apiError("Missing message body", 400, "BAD_REQUEST");
    }

    const msg = await msgDb.createMessage(
      db,
      conversationId,
      user.userId,
      body.body,
      body.attachmentsJson ?? "[]"
    );

    return NextResponse.json(
      {
        message: {
          id: msg.id,
          conversation_id: msg.conversation_id,
          conversationId: msg.conversation_id,
          sender_id: msg.sender_id,
          senderId: msg.sender_id,
          body: msg.body,
          attachments_json: msg.attachments_json,
          attachmentsJson: msg.attachments_json,
          created_at: msg.created_at,
          createdAt: msg.created_at,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[messages:POST]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
