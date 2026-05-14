// Mock data for the /messages page
// Replace with real API data later
// Types sourced from shared API contract: src/types/api/messages.ts

import type { ChatMessage, Conversation } from '@/types/api/messages';

const mockMessages1: ChatMessage[] = [
  { id: "m1", senderId: "guest", text: "Hi! I'm interested in your beautiful apartment. Is it available for the dates I selected?", timestamp: "2026-05-10T09:15:00Z" },
  { id: "m2", senderId: "host", text: "Hello! Yes, it's available for those dates. Happy to host you!", timestamp: "2026-05-10T09:32:00Z" },
  { id: "m3", senderId: "guest", text: "Great, thanks! Just one question - is parking included?", timestamp: "2026-05-10T10:05:00Z" },
  { id: "m4", senderId: "host", text: "Yes, we have one dedicated underground parking spot included in the rental.", timestamp: "2026-05-10T10:18:00Z" },
  { id: "m5", senderId: "guest", text: "Perfect! I'll go ahead and book. Looking forward to staying at your place.", timestamp: "2026-05-10T10:30:00Z" },
  { id: "m6", senderId: "host", text: "Wonderful! Let me know if you need any local recommendations before your arrival.", timestamp: "2026-05-10T10:35:00Z" },
  { id: "m7", senderId: "guest", text: "That would be amazing, thank you! Any good coffee shops nearby?", timestamp: "2026-05-10T11:00:00Z" },
  { id: "m8", senderId: "host", text: "Yes, there's a great one called Pilot Coffee just a 5-minute walk away. They have amazing lattes! ☕", timestamp: "2026-05-10T11:12:00Z", reaction: "☕" },
];

const mockMessages2: ChatMessage[] = [
  { id: "m9", senderId: "host", text: "Hi Sarah, thanks for booking! Let me know if you have any questions about the condo.", timestamp: "2026-05-08T14:00:00Z" },
  { id: "m10", senderId: "guest", text: "Thank you! What's the check-in process like?", timestamp: "2026-05-08T14:25:00Z" },
  { id: "m11", senderId: "host", text: "You'll receive a digital door code 24 hours before check-in. Very simple and contactless.", timestamp: "2026-05-08T14:30:00Z" },
  { id: "m12", senderId: "guest", text: "Sounds great! Is there a gym in the building?", timestamp: "2026-05-08T15:00:00Z" },
  { id: "m13", senderId: "host", text: "Yes, there's a full fitness center on the 3rd floor, plus a yoga studio and a pool on the rooftop.", timestamp: "2026-05-08T15:10:00Z" },
  { id: "m14", senderId: "guest", text: "Amazing, can't wait! 😊", timestamp: "2026-05-09T08:45:00Z", reaction: "😊" },
];

const mockMessages3: ChatMessage[] = [
  { id: "m15", senderId: "guest", text: "Hello! I'm a visiting professor at U of T and looking for a place for the fall semester.", timestamp: "2026-05-01T11:00:00Z" },
  { id: "m16", senderId: "host", text: "Hi Professor Chen! Our apartment would be perfect for an academic stay. It's quiet, well-equipped, and only 15 minutes from St. George campus.", timestamp: "2026-05-01T11:20:00Z" },
  { id: "m17", senderId: "guest", text: "That sounds ideal. Do you offer any discounts for longer stays?", timestamp: "2026-05-01T11:35:00Z" },
  { id: "m18", senderId: "host", text: "Absolutely! We offer 15% off for stays of 4+ weeks, and 25% for stays of 12+ weeks.", timestamp: "2026-05-01T11:40:00Z" },
];

const mockMessages4: ChatMessage[] = [
  { id: "m19", senderId: "guest", text: "Hi, is the unit still available for August 1-31?", timestamp: "2026-05-12T16:00:00Z" },
  { id: "m20", senderId: "host", text: "Hi! Yes it is. Would you like to book?", timestamp: "2026-05-12T16:45:00Z" },
];

const mockMessages5: ChatMessage[] = [
  { id: "m21", senderId: "guest", text: "Quick question - do you allow pets? I have a small well-behaved dog.", timestamp: "2026-05-11T09:00:00Z" },
  { id: "m22", senderId: "host", text: "Hi! Yes, we're pet-friendly, but there's a $150 pet cleaning fee. Hope that works!", timestamp: "2026-05-11T09:30:00Z" },
  { id: "m23", senderId: "guest", text: "That's fine with me. Thanks for the quick reply!", timestamp: "2026-05-11T09:45:00Z" },
  { id: "m24", senderId: "host", text: "No problem! Looking forward to hosting you and your furry friend 🐾", timestamp: "2026-05-11T09:50:00Z" },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    guestName: "Alex Johnson",
    guestAvatar: null,
    propertyTitle: "Luxury Condo with CN Tower View",
    propertyImage: "/properties/cn-tower-condo.jpg",
    propertyAddress: "300 Front St W, Toronto, ON M5V 0E9",
    lastMessage: "Yes, there's a great one called Pilot Coffee just…",
    lastMessageAt: "2026-05-10T11:12:00Z",
    unread: true,
    messages: mockMessages1,
    booking: {
      checkIn: "2026-06-15",
      checkOut: "2026-07-15",
      guests: 2,
      nights: 30,
      nightlyRate: 185,
    },
  },
  {
    id: "conv-2",
    guestName: "Sarah Miller",
    guestAvatar: null,
    propertyTitle: "Yorkville Executive Suite",
    propertyImage: "/properties/yorkville-suite.jpg",
    propertyAddress: "88 Davenport Rd, Toronto, ON M5R 0A5",
    lastMessage: "Amazing, can't wait! 😊",
    lastMessageAt: "2026-05-09T08:45:00Z",
    unread: false,
    messages: mockMessages2,
    booking: {
      checkIn: "2026-07-01",
      checkOut: "2026-07-08",
      guests: 1,
      nights: 7,
      nightlyRate: 220,
    },
  },
  {
    id: "conv-3",
    guestName: "Prof. Wei Chen",
    guestAvatar: null,
    propertyTitle: "Annex Academic Studio near U of T",
    propertyImage: "/properties/annex-studio.jpg",
    propertyAddress: "45 Spadina Rd, Toronto, ON M5R 2S9",
    lastMessage: "Absolutely! We offer 15% off for stays of 4+…",
    lastMessageAt: "2026-05-01T11:40:00Z",
    unread: false,
    messages: mockMessages3,
    booking: {
      checkIn: "2026-09-01",
      checkOut: "2026-12-15",
      guests: 1,
      nights: 105,
      nightlyRate: 160,
    },
  },
  {
    id: "conv-4",
    guestName: "Marcus Williams",
    guestAvatar: null,
    propertyTitle: "King West Industrial Loft",
    propertyImage: "/properties/king-west-loft.jpg",
    propertyAddress: "620 King St W, Toronto, ON M5V 1M6",
    lastMessage: "Hi! Yes it is. Would you like to book?",
    lastMessageAt: "2026-05-12T16:45:00Z",
    unread: true,
    messages: mockMessages4,
    booking: {
      checkIn: "2026-08-01",
      checkOut: "2026-08-31",
      guests: 2,
      nights: 30,
      nightlyRate: 195,
    },
  },
  {
    id: "conv-5",
    guestName: "Emily Brown",
    guestAvatar: null,
    propertyTitle: "Distillery District Boutique Flat",
    propertyImage: "/properties/distillery-flat.jpg",
    propertyAddress: "55 Mill St, Toronto, ON M5A 3C4",
    lastMessage: "No problem! Looking forward to hosting you…",
    lastMessageAt: "2026-05-11T09:50:00Z",
    unread: false,
    messages: mockMessages5,
    booking: {
      checkIn: "2026-06-20",
      checkOut: "2026-06-27",
      guests: 1,
      nights: 7,
      nightlyRate: 175,
    },
  },
];
