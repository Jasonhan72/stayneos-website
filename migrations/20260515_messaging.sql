-- Messaging tables for B6: Real messaging with D1 + Durable Objects
-- Conversation type: 'dm' (direct message) or 'host_guest' (host-guest booking conversation)

CREATE TABLE IF NOT EXISTS Conversation (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'dm' CHECK (type IN ('dm', 'host_guest')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversation_updated_at ON Conversation(updated_at DESC);

CREATE TABLE IF NOT EXISTS Message (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES Conversation(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  attachments_json TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_message_conversation_id ON Message(conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ConversationParticipant (
  conversation_id TEXT NOT NULL REFERENCES Conversation(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  last_read_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_user_id ON ConversationParticipant(user_id, last_read_at DESC);
