import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { getCurrentUserFromRequest } from "@/lib/auth/server";
import { apiError } from "@/lib/api/response";
import * as msgDb from "@/lib/messaging-db";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  try {
    const db = getDb();
    const conversations = await msgDb.getConversationsForUser(db, user.userId);

    // Transform to API format
    const result = conversations.map((c) => ({
      id: c.id,
      type: c.type,
      created_at: c.created_at,
      createdAt: c.created_at,
      updated_at: c.updated_at,
      updatedAt: c.updated_at,
      participants: c.participants,
      lastMessage: c.lastMessage
        ? {
            id: c.lastMessage.id,
            conversation_id: c.lastMessage.conversation_id,
            conversationId: c.lastMessage.conversation_id,
            sender_id: c.lastMessage.sender_id,
            senderId: c.lastMessage.sender_id,
            body: c.lastMessage.body,
            attachments_json: c.lastMessage.attachments_json,
            attachmentsJson: c.lastMessage.attachments_json,
            created_at: c.lastMessage.created_at,
            createdAt: c.lastMessage.created_at,
          }
        : null,
    }));

    return NextResponse.json({ conversations: result });
  } catch (e) {
    console.error("[conversations:GET]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  try {
    const body = (await request.json()) as {
      participant_user_ids: string[];
      type: "dm" | "host_guest";
    };

    if (!body.participant_user_ids?.length) {
      return apiError("Missing participant_user_ids", 400, "BAD_REQUEST");
    }

    // Ensure the current user is always a participant
    const allParticipants = [user.userId, ...body.participant_user_ids.filter((id) => id !== user.userId)];

    const db = getDb();
    const conv = await msgDb.createConversation(db, allParticipants, body.type || "dm");

    return NextResponse.json(
      {
        conversation: {
          id: conv.id,
          type: conv.type,
          created_at: conv.created_at,
          createdAt: conv.created_at,
          updated_at: conv.updated_at,
          updatedAt: conv.updated_at,
          participants: allParticipants,
          lastMessage: null,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[conversations:POST]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
