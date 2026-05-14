/**
 * Messages API 共享类型
 */

/** 消息对象 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/** 会话对象 */
export interface Conversation {
  id: string;
  participants: string[];
  propertyId?: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/messages 返回 */
export interface MessagesListResponse {
  conversations: Conversation[];
  unreadCount: number;
}

/** GET /api/messages/[id] 返回 */
export interface MessagesDetailResponse {
  messages: Message[];
  conversation: Conversation;
}

/** POST /api/messages 请求体 */
export interface SendMessageRequest {
  conversationId?: string;
  recipientId?: string;
  content: string;
  propertyId?: string;
}

/** POST /api/messages 返回 */
export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}
