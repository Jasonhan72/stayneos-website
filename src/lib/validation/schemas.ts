// src/lib/validation/schemas.ts
// Zod 数据验证模式定义

import { z } from 'zod';
import { PropertyType, BookingStatus } from '@prisma/client';

// ========== 房源相关验证 ==========

// 房源列表查询参数验证
export const propertyListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().min(1).optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  isFeatured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['price', 'rating', 'createdAt', 'bookingCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 房源ID参数验证
export const propertyIdSchema = z.object({
  id: z.string().cuid({ message: '无效的房间ID格式' }),
});

// ========== 预订相关验证 ==========

// 创建预订请求体验证
export const createBookingSchema = z.object({
  propertyId: z.string().cuid({ message: '无效的房间ID' }),
  checkIn: z.string().datetime({ message: '无效的入住日期' }),
  checkOut: z.string().datetime({ message: '无效的退房日期' }),
  guests: z.number().int().min(1, { message: '至少1位客人' }).max(10, { message: '最多10位客人' }),
  guestName: z.string().min(1, { message: '客人姓名不能为空' }).max(100).optional(),
  guestEmail: z.string().email({ message: '无效的邮箱格式' }).optional(),
  guestPhone: z.string().max(20).optional(),
  specialRequests: z.string().max(1000, { message: '特殊需求描述过长' }).optional(),
});

// 预订查询参数验证
export const bookingListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.nativeEnum(BookingStatus).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// ========== 用户认证相关验证 ==========

// 用户注册验证
export const registerSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string()
    .min(8, { message: '密码至少需要8个字符' })
    .max(100, { message: '密码过长' })
    .regex(/[A-Z]/, { message: '密码需要包含至少一个大写字母' })
    .regex(/[a-z]/, { message: '密码需要包含至少一个小写字母' })
    .regex(/[0-9]/, { message: '密码需要包含至少一个数字' }),
  name: z.string().min(1, { message: '姓名不能为空' }).max(100).optional(),
  phone: z.string().max(20).optional(),
});

// 用户登录验证
export const loginSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(1, { message: '请输入密码' }),
});

// 修改密码验证
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: '请输入当前密码' }),
  newPassword: z.string()
    .min(8, { message: '新密码至少需要8个字符' })
    .max(100)
    .regex(/[A-Z]/, { message: '密码需要包含至少一个大写字母' })
    .regex(/[a-z]/, { message: '密码需要包含至少一个小写字母' })
    .regex(/[0-9]/, { message: '密码需要包含至少一个数字' }),
});

// ========== 评价相关验证 ==========

export const createReviewSchema = z.object({
  propertyId: z.string().cuid(),
  bookingId: z.string().cuid().optional(),
  rating: z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(5).optional(),
  accuracy: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  checkIn: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10, { message: '评价内容至少需要10个字符' }).max(2000),
});

// 导出类型定义
export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
