// D1 helpers for messaging tables (B6)
// Note: getDb is used by route handlers that call these functions;

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
  created_at: number;
  updated_at: number;
}

export interface ConversationParticipantRow {
  conversation_id: string;
  user_id: string;
  joined_at: number;
  last_read_at: number;
}

// ── Conversations ────────────────────────────────────────

export async function getConversationsForUser(
  db: D1Database,
  userId: string,
): Promise<Array<ConversationRow & { lastMessage: MessageRow | null; participants: string[] }>> {
  const { results } = await db
    .prepare(
      `SELECT c.* FROM Conversation c
       INNER JOIN ConversationParticipant cp ON cp.conversation_id = c.id
       WHERE cp.user_id = ?
       ORDER BY c.updated_at DESC`
    )
    .bind(userId)
    .all<ConversationRow>();

  const conversations: Array<ConversationRow & { lastMessage: MessageRow | null; participants: string[] }> = [];

  for (const c of results) {
    // Get last message
    const lastMsg = await db
      .prepare(
        `SELECT * FROM Message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`
      )
      .bind(c.id)
      .first<MessageRow>();

    // Get participants
    const parts = await db
      .prepare(`SELECT user_id FROM ConversationParticipant WHERE conversation_id = ?`)
      .bind(c.id)
      .all<{ user_id: string }>();

    conversations.push({
      ...c,
      lastMessage: lastMsg ?? null,
      participants: parts.results.map(p => p.user_id),
    });
  }

  return conversations;
}

export async function getConversation(
  db: D1Database,
  conversationId: string,
  userId: string,
): Promise<(ConversationRow & { lastMessage: MessageRow | null; participants: string[] }) | null> {
  const c = await db
    .prepare(
      `SELECT c.* FROM Conversation c
       INNER JOIN ConversationParticipant cp ON cp.conversation_id = c.id
       WHERE c.id = ? AND cp.user_id = ?`
    )
    .bind(conversationId, userId)
    .first<ConversationRow>();

  if (!c) return null;

  const lastMsg = await db
    .prepare(`SELECT * FROM Message WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`)
    .bind(c.id)
    .first<MessageRow>();

  const parts = await db
    .prepare(`SELECT user_id FROM ConversationParticipant WHERE conversation_id = ?`)
    .bind(c.id)
    .all<{ user_id: string }>();

  return { ...c, lastMessage: lastMsg ?? null, participants: parts.results.map(p => p.user_id) };
}

export async function createConversation(
  db: D1Database,
  participantUserIds: string[],
  type: 'dm' | 'host_guest' = 'dm',
): Promise<ConversationRow> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(`INSERT INTO Conversation (id, type, created_at, updated_at) VALUES (?, ?, ?, ?)`)
    .bind(id, type, now, now)
    .run();

  const stmts = participantUserIds.map((uid) =>
    db
      .prepare(`INSERT INTO ConversationParticipant (conversation_id, user_id, joined_at, last_read_at) VALUES (?, ?, ?, ?)`)
      .bind(id, uid, now, now)
  );
  await db.batch(stmts);

  return { id, type, created_at: now, updated_at: now };
}

export async function isParticipant(
  db: D1Database,
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const row = await db
    .prepare(`SELECT 1 FROM ConversationParticipant WHERE conversation_id = ? AND user_id = ?`)
    .bind(conversationId, userId)
    .first<{ 1: number }>();
  return !!row;
}

export async function updateLastRead(
  db: D1Database,
  conversationId: string,
  userId: string,
): Promise<void> {
  await db
    .prepare(`UPDATE ConversationParticipant SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?`)
    .bind(Date.now(), conversationId, userId)
    .run();
}

// ── Messages ─────────────────────────────────────────────

export async function getMessages(
  db: D1Database,
  conversationId: string,
  cursor?: string | null,
  limit = 50,
): Promise<{ messages: MessageRow[]; nextCursor: string | null }> {
  let query = `SELECT * FROM Message WHERE conversation_id = ?`;
  const binds: (string | number)[] = [conversationId];

  if (cursor) {
    query += ` AND created_at < ?`;
    binds.push(Number(cursor));
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
  binds.push(limit + 1); // fetch one extra to detect hasMore

  const { results } = await db.prepare(query).bind(...binds).all<MessageRow>();

  const hasMore = results.length > limit;
  const messages = hasMore ? results.slice(0, limit) : results;
  // Return oldest-first for client display
  const ordered = [...messages].reverse();
  const nextCursor = hasMore ? String(ordered[0]?.created_at ?? null) : null;

  return { messages: ordered, nextCursor };
}

export async function createMessage(
  db: D1Database,
  conversationId: string,
  senderId: string,
  body: string,
  attachmentsJson = '[]',
): Promise<MessageRow> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO Message (id, conversation_id, sender_id, body, attachments_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, conversationId, senderId, body, attachmentsJson, now)
    .run();

  // Update conversation timestamp
  await db
    .prepare(`UPDATE Conversation SET updated_at = ? WHERE id = ?`)
    .bind(now, conversationId)
    .run();

  return { id, conversation_id: conversationId, sender_id: senderId, body, attachments_json: attachmentsJson, created_at: now };
}

export async function getMessage(
  db: D1Database,
  messageId: string,
): Promise<MessageRow | null> {
  return db.prepare(`SELECT * FROM Message WHERE id = ?`).bind(messageId).first<MessageRow>() ?? null;
}
