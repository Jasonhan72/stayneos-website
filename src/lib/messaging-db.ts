// D1 helpers for Airbnb-style messaging.

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachments_json: string;
  created_at: number;
}

export interface ConversationRow {
  id: string;
  type: 'dm' | 'host_guest';
  booking_id?: string | null;
  created_at: number;
  updated_at: number;
}

export interface ConversationParticipantRow {
  conversation_id: string;
  user_id: string;
  joined_at: number;
  last_read_at: number;
}

export interface ConversationPersonRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string | null;
}

export interface BookingSummaryRow {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  propertyId: string;
  propertyTitle: string | null;
  propertyAddress: string | null;
  propertyCity: string | null;
  propertyImageUrl: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  hostId: string | null;
}

export type ConversationFull = ConversationRow & {
  lastMessage: MessageRow | null;
  participants: string[];
  people: ConversationPersonRow[];
  unreadCount: number;
  lastReadAt: number;
  booking: BookingSummaryRow | null;
};

function parseTableColumn(row: Record<string, unknown>): string | null {
  return typeof row.name === 'string' ? row.name : null;
}

async function hasConversationBookingColumn(db: D1Database): Promise<boolean> {
  try {
    const { results } = await db.prepare(`PRAGMA table_info(Conversation)`).all<Record<string, unknown>>();
    return results.map(parseTableColumn).includes('booking_id');
  } catch {
    return false;
  }
}

export async function getConversationsForUser(db: D1Database, userId: string): Promise<ConversationFull[]> {
  const hasBooking = await hasConversationBookingColumn(db);
  const selectBooking = hasBooking ? 'c.booking_id' : 'NULL AS booking_id';
  const { results } = await db
    .prepare(
      `SELECT c.id, c.type, ${selectBooking}, c.created_at, c.updated_at, cp.last_read_at
       FROM Conversation c
       INNER JOIN ConversationParticipant cp ON cp.conversation_id = c.id
       WHERE cp.user_id = ?
       ORDER BY c.updated_at DESC`
    )
    .bind(userId)
    .all<ConversationRow & { last_read_at: number }>();

  const conversations: ConversationFull[] = [];
  for (const c of results) {
    const [lastMsg, parts, unread, booking] = await Promise.all([
      db.prepare(`SELECT * FROM Message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`).bind(c.id).first<MessageRow>(),
      db.prepare(
        `SELECT cp.user_id, u.id, u.name, u.email, u.avatar, u.role
         FROM ConversationParticipant cp
         LEFT JOIN User u ON u.id = cp.user_id
         WHERE cp.conversation_id = ?`
      ).bind(c.id).all<ConversationPersonRow & { user_id: string }>(),
      db.prepare(
        `SELECT COUNT(*) as count FROM Message
         WHERE conversation_id = ? AND sender_id <> ? AND created_at > ?`
      ).bind(c.id, userId, c.last_read_at || 0).first<{ count: number }>(),
      c.booking_id ? getBookingSummary(db, c.booking_id) : Promise.resolve(null),
    ]);

    conversations.push({
      ...c,
      booking_id: c.booking_id ?? null,
      lastMessage: lastMsg ?? null,
      participants: parts.results.map((p) => p.user_id),
      people: parts.results.map((p) => ({
        id: p.id || p.user_id,
        name: p.name,
        email: p.email,
        avatar: p.avatar,
        role: p.role,
      })),
      unreadCount: Number(unread?.count || 0),
      lastReadAt: c.last_read_at || 0,
      booking,
    });
  }
  return conversations;
}

export async function getConversation(db: D1Database, conversationId: string, userId: string): Promise<ConversationFull | null> {
  const list = await getConversationsForUser(db, userId);
  return list.find((c) => c.id === conversationId) ?? null;
}

export async function findConversationByBooking(db: D1Database, bookingId: string, userId: string): Promise<ConversationRow | null> {
  if (!(await hasConversationBookingColumn(db))) return null;
  return db.prepare(
    `SELECT c.* FROM Conversation c
     INNER JOIN ConversationParticipant cp ON cp.conversation_id = c.id
     WHERE c.booking_id = ? AND cp.user_id = ? LIMIT 1`
  ).bind(bookingId, userId).first<ConversationRow>();
}

export async function getBookingSummary(db: D1Database, bookingId: string): Promise<BookingSummaryRow | null> {
  return db.prepare(
    `SELECT b.id, b.bookingNumber, b.checkIn, b.checkOut, b.guests, b.status, b.paymentStatus,
            b.totalPrice, b.currency, b.propertyId,
            p.title AS propertyTitle, p.address AS propertyAddress, p.city AS propertyCity,
            p.bedrooms, p.bathrooms, p.createdBy AS hostId,
            (SELECT url FROM PropertyImage pi WHERE pi.propertyId = p.id ORDER BY pi.isPrimary DESC, pi."order" ASC LIMIT 1) AS propertyImageUrl
     FROM Booking b
     LEFT JOIN Property p ON p.id = b.propertyId OR p.slug = b.propertyId
     WHERE b.id = ? OR b.bookingNumber = ?
     LIMIT 1`
  ).bind(bookingId, bookingId).first<BookingSummaryRow>();
}

export async function findFallbackHostUserId(db: D1Database, currentUserId: string): Promise<string | null> {
  const row = await db.prepare(
    `SELECT id FROM User
     WHERE id <> ? AND role IN ('HOST', 'ADMIN', 'SUPER_ADMIN')
     ORDER BY CASE role WHEN 'HOST' THEN 0 WHEN 'ADMIN' THEN 1 WHEN 'SUPER_ADMIN' THEN 2 ELSE 3 END, createdAt ASC
     LIMIT 1`
  ).bind(currentUserId).first<{ id: string }>();
  return row?.id ?? null;
}

export async function createConversation(db: D1Database, participantUserIds: string[], type: 'dm' | 'host_guest' = 'dm', bookingId?: string | null): Promise<ConversationRow> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const hasBooking = await hasConversationBookingColumn(db);
  if (hasBooking) {
    await db.prepare(`INSERT INTO Conversation (id, type, booking_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`).bind(id, type, bookingId ?? null, now, now).run();
  } else {
    await db.prepare(`INSERT INTO Conversation (id, type, created_at, updated_at) VALUES (?, ?, ?, ?)`).bind(id, type, now, now).run();
  }

  const unique = [...new Set(participantUserIds.filter(Boolean))];
  await db.batch(unique.map((uid) =>
    db.prepare(`INSERT OR IGNORE INTO ConversationParticipant (conversation_id, user_id, joined_at, last_read_at) VALUES (?, ?, ?, ?)`).bind(id, uid, now, uid === unique[0] ? now : 0)
  ));
  return { id, type, booking_id: bookingId ?? null, created_at: now, updated_at: now };
}

export async function isParticipant(db: D1Database, conversationId: string, userId: string): Promise<boolean> {
  const row = await db.prepare(`SELECT 1 FROM ConversationParticipant WHERE conversation_id = ? AND user_id = ?`).bind(conversationId, userId).first<{ 1: number }>();
  return !!row;
}

export async function updateLastRead(db: D1Database, conversationId: string, userId: string): Promise<void> {
  await db.prepare(`UPDATE ConversationParticipant SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?`).bind(Date.now(), conversationId, userId).run();
}

export async function getMessages(db: D1Database, conversationId: string, cursor?: string | null, limit = 50): Promise<{ messages: MessageRow[]; nextCursor: string | null }> {
  let query = `SELECT * FROM Message WHERE conversation_id = ?`;
  const binds: (string | number)[] = [conversationId];
  if (cursor) { query += ` AND created_at < ?`; binds.push(Number(cursor)); }
  query += ` ORDER BY created_at DESC LIMIT ?`;
  binds.push(limit + 1);
  const { results } = await db.prepare(query).bind(...binds).all<MessageRow>();
  const hasMore = results.length > limit;
  const messages = hasMore ? results.slice(0, limit) : results;
  const ordered = [...messages].reverse();
  return { messages: ordered, nextCursor: hasMore ? String(ordered[0]?.created_at ?? null) : null };
}

export async function createMessage(db: D1Database, conversationId: string, senderId: string, body: string, attachmentsJson = '[]'): Promise<MessageRow> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db.prepare(`INSERT INTO Message (id, conversation_id, sender_id, body, attachments_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(id, conversationId, senderId, body, attachmentsJson, now).run();
  await db.prepare(`UPDATE Conversation SET updated_at = ? WHERE id = ?`).bind(now, conversationId).run();
  await updateLastRead(db, conversationId, senderId);
  return { id, conversation_id: conversationId, sender_id: senderId, body, attachments_json: attachmentsJson, created_at: now };
}

export async function getMessage(db: D1Database, messageId: string): Promise<MessageRow | null> {
  return db.prepare(`SELECT * FROM Message WHERE id = ?`).bind(messageId).first<MessageRow>() ?? null;
}
