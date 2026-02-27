/**
 * 预订类型定义
 */

import { BookingStatus, PaymentStatus } from '@prisma/client';

// 预订信息
export interface Booking {
  id: string;
  bookingNumber: string;
  
  propertyId: string;
  userId: string;
  
  // 日期
  checkIn: string;
  checkOut: string;
  nights: number;
  
  // 客人
  guests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  
  // 价格明细
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  discount?: number;
  discountRate?: number;
  tax?: number;
  totalPrice: number;
  currency: string;
  
  // 状态
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  
  // 特殊需求
  specialRequests?: string;
  
  // 取消信息
  cancelledAt?: string;
  cancelReason?: string;
  
  // 关联数据
  property?: {
    id: string;
    title: string;
    images: { url: string }[];
  };
  
  createdAt: string;
  updatedAt: string;
}

// 创建预订请求
export interface CreateBookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
}

// 创建预订响应
export interface CreateBookingResponse {
  booking: Booking;
  clientSecret?: string;
}

// 预订查询参数
export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  upcoming?: boolean;
}

// 价格计算结果
export interface BookingPriceCalculation {
  nights: number;
  basePrice: number;
  subtotal: number;
  discount: number;
  discountPercentage: number;
  cleaningFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  currency: string;
}
