import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";
import { getCurrentUserFromRequest } from "@/lib/auth/server";
import { apiError } from "@/lib/api/response";
import { validateCsrf } from "@/lib/security/csrf";
import * as msgDb from "@/lib/messaging-db";

function parseAttachments(json?: string | null) {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function messageToApi(m: msgDb.MessageRow | null) {
  if (!m) return null;
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

function conversationToApi(c: msgDb.ConversationFull, currentUserId: string) {
  const otherPerson = c.people.find((p) => p.id !== currentUserId) ?? null;
  return {
    id: c.id,
    type: c.type,
    booking_id: c.booking_id ?? null,
    bookingId: c.booking_id ?? null,
    created_at: c.created_at,
    createdAt: c.created_at,
    updated_at: c.updated_at,
    updatedAt: c.updated_at,
    participants: c.participants,
    people: c.people.map((p) => ({
      id: p.id,
      name: p.name || p.email?.split("@")[0] || "Guest",
      email: p.email || undefined,
      avatar: p.avatar,
      role: p.role,
    })),
    otherPerson: otherPerson
      ? {
          id: otherPerson.id,
          name: otherPerson.name || otherPerson.email?.split("@")[0] || "Guest",
          email: otherPerson.email || undefined,
          avatar: otherPerson.avatar,
          role: otherPerson.role,
        }
      : null,
    booking: c.booking
      ? {
          id: c.booking.id,
          bookingNumber: c.booking.bookingNumber,
          checkIn: c.booking.checkIn,
          checkOut: c.booking.checkOut,
          guests: c.booking.guests,
          status: c.booking.status,
          paymentStatus: c.booking.paymentStatus,
          totalPrice: c.booking.totalPrice,
          currency: c.booking.currency,
        }
      : null,
    property: c.booking
      ? {
          id: c.booking.propertyId,
          title: c.booking.propertyTitle || "StayNeos home",
          address: c.booking.propertyAddress || "Toronto",
          city: c.booking.propertyCity || undefined,
          imageUrl: c.booking.propertyImageUrl,
          bedrooms: c.booking.bedrooms,
          bathrooms: c.booking.bathrooms,
        }
      : null,
    unreadCount: c.unreadCount,
    lastReadAt: c.lastReadAt,
    lastMessage: messageToApi(c.lastMessage),
  };
}

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  try {
    const db = getDb();
    const conversations = await msgDb.getConversationsForUser(db, user.userId);
    const result = conversations.map((c) => conversationToApi(c, user.userId));
    return NextResponse.json({
      conversations: result,
      unreadCount: result.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    });
  } catch (e) {
    console.error("[conversations:GET]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: Request) {
  if (!validateCsrf(request)) return apiError("Invalid CSRF token", 403, "CSRF_INVALID");
  const user = await getCurrentUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED");

  try {
    const body = (await request.json()) as {
      participant_user_ids?: string[];
      participantUserIds?: string[];
      type?: "dm" | "host_guest";
      booking_id?: string;
      bookingId?: string;
    };

    const db = getDb();
    const bookingId = body.booking_id || body.bookingId || null;
    const existing = bookingId ? await msgDb.findConversationByBooking(db, bookingId, user.userId) : null;
    if (existing) {
      const full = await msgDb.getConversation(db, existing.id, user.userId);
      return NextResponse.json({ conversation: full ? conversationToApi(full, user.userId) : existing });
    }

    let participants = body.participant_user_ids || body.participantUserIds || [];
    let type = body.type || "dm";

    if (bookingId) {
      const booking = await msgDb.getBookingSummary(db, bookingId);
      if (!booking) return apiError("Booking not found", 404, "BOOKING_NOT_FOUND");
      type = "host_guest";
      if (booking.hostId && booking.hostId !== user.userId) {
        participants = [booking.hostId];
      } else {
        const fallbackHostId = await msgDb.findFallbackHostUserId(db, user.userId);
        if (fallbackHostId) participants = [fallbackHostId];
      }
    }

    if (!participants.length) {
      return apiError("Missing participant_user_ids", 400, "BAD_REQUEST");
    }

    const allParticipants = [user.userId, ...participants.filter((id) => id && id !== user.userId)];
    const conv = await msgDb.createConversation(db, allParticipants, type, bookingId);
    const full = await msgDb.getConversation(db, conv.id, user.userId);

    return NextResponse.json({ conversation: full ? conversationToApi(full, user.userId) : conv }, { status: 201 });
  } catch (e) {
    console.error("[conversations:POST]", e);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
