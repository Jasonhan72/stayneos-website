// src/lib/validations/property.ts
// Zod 验证 schemas for 房源录入

import { z } from 'zod';
import { PropertyType, PropertyStatus } from '@prisma/client';

// ========== 房源创建/更新验证 ==========

// 价格相关字段
const priceSchema = z.object({
  basePrice: z.number().min(0, { message: '基础价格必须大于等于0' }),
  currency: z.string().default('CAD'),
  cleaningFee: z.number().min(0).optional(),
  serviceFee: z.number().min(0).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  minNights: z.number().int().min(1).default(28),
  maxNights: z.number().int().min(1).optional(),
});

// 位置信息
const locationSchema = z.object({
  address: z.string().min(1, { message: '地址不能为空' }),
  city: z.string().min(1, { message: '城市不能为空' }),
  neighborhood: z.string().min(1, { message: '社区不能为空' }),
  state: z.string().optional(),
  country: z.string().default('Canada'),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// 房型信息
const roomSchema = z.object({
  propertyType: z.nativeEnum(PropertyType),
  bedrooms: z.number().int().min(0, { message: '卧室数量必须大于等于0' }),
  bathrooms: z.number().min(0, { message: '卫生间数量必须大于等于0' }),
  maxGuests: z.number().int().min(1, { message: '最大入住人数至少为1' }),
  area: z.number().int().min(1, { message: '面积必须大于0' }),
  floor: z.number().int().optional(),
});

// 图片信息
const imageSchema = z.object({
  url: z.string().url({ message: '无效的图片URL' }),
  alt: z.string().optional(),
  caption: z.string().optional(),
  order: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

// 创建房源验证
export const createPropertySchema = z.object({
  title: z.string().min(1, { message: '标题不能为空' }).max(200, { message: '标题过长' }),
  slug: z.string().min(1, { message: 'slug不能为空' }).regex(/^[a-z0-9-]+$/, { message: 'slug只能包含小写字母、数字和连字符' }),
  description: z.string().min(1, { message: '描述不能为空' }),
  shortDesc: z.string().max(500, { message: '简短描述不能超过500字符' }).optional(),
  
  // 位置
  ...locationSchema.shape,
  
  // 房型
  ...roomSchema.shape,
  
  // 价格
  ...priceSchema.shape,
  
  // 状态和标签
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DRAFT),
  isFeatured: z.boolean().default(false),
  isInstantBook: z.boolean().default(false),
  
  // Host关联
  hostId: z.string().cuid({ message: '无效的Host ID' }).optional(),
  adminCreated: z.boolean().default(true),
  
  // 图片
  images: z.array(imageSchema).min(1, { message: '至少需要一张图片' }),
  
  // 设施ID列表
  amenityIds: z.array(z.string().cuid()).optional(),
});

// 更新房源验证（所有字段可选）
export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().cuid({ message: '无效的房源ID' }),
});

// 房源ID参数验证
export const propertyIdSchema = z.object({
  id: z.string().cuid({ message: '无效的房源ID格式' }),
});

// 房源列表查询参数验证（扩展admin专用参数）
export const adminPropertyListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  city: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  hostId: z.string().optional(),
  adminCreated: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  isFeatured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'basePrice', 'viewCount', 'bookingCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ========== Host相关验证 ==========

// 创建Host验证
export const createHostSchema = z.object({
  displayName: z.string().min(1, { message: '显示名称不能为空' }).max(255),
  tagline: z.string().max(500).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().max(50).optional(),
  timezone: z.string().default('America/Toronto'),
  preferredLanguages: z.array(z.string()).default([]),
});

// 更新Host验证
export const updateHostSchema = createHostSchema.partial();

// Host ID参数验证
export const hostIdSchema = z.object({
  id: z.string().cuid({ message: '无效的Host ID格式' }),
});

// Host申请验证
export const hostApplicationSchema = z.object({
  fullName: z.string().min(1, { message: '姓名不能为空' }),
  phone: z.string().min(1, { message: '电话不能为空' }),
  email: z.string().email({ message: '无效的邮箱格式' }),
  expectedProperties: z.number().int().min(1).default(1),
  propertyLocation: z.string().optional(),
  notes: z.string().optional(),
});

// ========== 类型导出 ==========

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type AdminPropertyListQuery = z.infer<typeof adminPropertyListQuerySchema>;
export type CreateHostInput = z.infer<typeof createHostSchema>;
export type UpdateHostInput = z.infer<typeof updateHostSchema>;
export type HostApplicationInput = z.infer<typeof hostApplicationSchema>;
