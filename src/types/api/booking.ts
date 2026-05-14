/**
 * Booking API 请求 / 响应类型契约
 */
import { z } from 'zod';

export const bookingCreateSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.number().int().positive(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
});
export type BookingCreateRequest = z.infer<typeof bookingCreateSchema>;

export interface BookingDetail {
  id: string;
  bookingNumber: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  discount?: number;
  discountRate?: number;
  tax?: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  specialRequests?: string;
  property?: { id: string; title: string; images: Array<{ url: string }> };
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateResponse { booking: BookingDetail; clientSecret?: string; }
export interface BookingListResponse { bookings: BookingDetail[]; }
