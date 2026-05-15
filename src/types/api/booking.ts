/**
 * Booking API 共享类型
 */

import type { Booking } from '../booking';

/** GET /api/bookings 返回 */
export interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** GET /api/bookings/[id] 返回 */
export interface BookingDetailResponse {
  booking: Booking;
}

/** POST /api/bookings 请求体 */
export interface CreateBookingRequestBody {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  stayType?: 'NIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  unitCount?: number;
  unitRate?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
}

/** POST /api/bookings 返回 */
export interface CreateBookingResponseBody {
  booking: Booking;
  clientSecret?: string;
}

/** PATCH /api/bookings/[id] 请求体 */
export interface UpdateBookingRequestBody {
  status?: string;
  specialRequests?: string;
  guestName?: string;
  guestPhone?: string;
}
