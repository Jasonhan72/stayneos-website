/**
 * Messages API 请求 / 响应类型契约
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  reaction?: string | null;
}

export interface BookingSummary {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  nightlyRate: number;
}

export interface Conversation {
  id: string;
  guestName: string;
  guestAvatar: string | null;
  propertyTitle: string;
  propertyImage: string;
  propertyAddress: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: ChatMessage[];
  booking: BookingSummary;
}

export interface ConversationListResponse { conversations: Conversation[]; }
