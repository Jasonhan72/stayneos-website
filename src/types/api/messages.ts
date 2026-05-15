/**
 * Messages API 共享类型 (B6: Real messaging with D1 + Durable Objects)
 */

// ── Row types (from D1) ──────────────────────────────────

/** API Message object */
export interface ApiMessage {
  id: string;
  conversation_id: string;
  conversationId: string;
  sender_id: string;
  senderId: string;
  body: string;
  attachments_json: string;
  attachmentsJson: string;
  created_at: number;
  createdAt: number;
}

/** API Conversation object with participants */
export interface ApiConversation {
  id: string;
  type: 'dm' | 'host_guest';
  created_at: number;
  createdAt: number;
  updated_at: number;
  updatedAt: number;
  participants: string[];
  /** Last message preview (for the list view) */
  lastMessage?: ApiMessage | null;
}

// ── Request types ────────────────────────────────────────

/** POST /api/conversations */
export interface CreateConversationRequest {
  participant_user_ids: string[];
  type: 'dm' | 'host_guest';
}

/** POST /api/conversations/:id/messages */
export interface SendMessageRequest {
  body: string;
  attachmentsJson?: string;
}

// ── Response types ───────────────────────────────────────

/** GET /api/conversations */
export interface ConversationsListResponse {
  conversations: ApiConversation[];
}

/** GET /api/conversations/:id/messages */
export interface MessagesDetailResponse {
  messages: ApiMessage[];
  cursor: string | null;
}

/** POST /api/conversations/:id/messages */
export interface SendMessageResponse {
  message: ApiMessage;
}

/** POST /api/conversations */
export interface CreateConversationResponse {
  conversation: ApiConversation;
}

// Legacy aliases (keep compatibility)
export type Message = ApiMessage;
export type Conversation = ApiConversation;
