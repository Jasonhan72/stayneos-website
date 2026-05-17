/** Shared API types for StayNeos messaging. */

export interface ApiAttachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
  size?: number;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  conversationId: string;
  sender_id: string;
  senderId: string;
  body: string;
  attachments_json: string;
  attachmentsJson: string;
  attachments?: ApiAttachment[];
  created_at: number;
  createdAt: number;
}

export interface ConversationPerson {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  role?: string | null;
}

export interface ConversationBooking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  paymentStatus?: string;
  totalPrice?: number;
  currency?: string;
}

export interface ConversationProperty {
  id: string;
  title: string;
  address: string;
  city?: string;
  imageUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

export interface ApiConversation {
  id: string;
  type: 'dm' | 'host_guest';
  booking_id?: string | null;
  bookingId?: string | null;
  created_at: number;
  createdAt: number;
  updated_at: number;
  updatedAt: number;
  participants: string[];
  people?: ConversationPerson[];
  otherPerson?: ConversationPerson | null;
  booking?: ConversationBooking | null;
  property?: ConversationProperty | null;
  unreadCount?: number;
  lastReadAt?: number;
  lastMessage?: ApiMessage | null;
}

export interface CreateConversationRequest {
  participant_user_ids?: string[];
  participantUserIds?: string[];
  booking_id?: string;
  bookingId?: string;
  type?: 'dm' | 'host_guest';
}

export interface SendMessageRequest {
  body?: string;
  attachmentsJson?: string;
  attachments?: ApiAttachment[];
}

export interface ConversationsListResponse {
  conversations: ApiConversation[];
  unreadCount?: number;
}

export interface MessagesDetailResponse {
  messages: ApiMessage[];
  cursor: string | null;
}

export interface SendMessageResponse {
  message: ApiMessage;
}

export interface CreateConversationResponse {
  conversation: ApiConversation;
}

export type Message = ApiMessage;
export type Conversation = ApiConversation;
