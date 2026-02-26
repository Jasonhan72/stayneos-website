// src/lib/validation/property.ts
// 房源表单验证模式

import { z } from 'zod';
import { PropertyType, PropertyStatus } from '@prisma/client';

// 多语言标题验证
const multilingualTitleSchema = z.object({
  zh: z.string().min(1, '中文标题不能为空').max(200, '标题过长'),
  en: z.string().min(1, '英文标题不能为空').max(200, '标题过长'),
});

// 多语言描述验证
const multilingualDescriptionSchema = z.object({
  zh: z.string().min(10, '中文描述至少10个字符').max(5000, '描述过长'),
  en: z.string().min(10, '英文描述至少10个字符').max(5000, '描述过长'),
});

// 地址验证
export const addressSchema = z.object({
  address: z.string().min(1, '地址不能为空').max(500),
  city: z.string().min(1, '城市不能为空').max(100),
  province: z.string().min(1, '省份不能为空').max(100),
  postalCode: z.string().min(1, '邮政编码不能为空').max(20),
  country: z.string().default('Canada'),
});

// 创建房源表单验证
export const createPropertySchema = z.object({
  // 多语言标题
  title: multilingualTitleSchema,
  
  // 多语言描述
  description: multilingualDescriptionSchema,
  
  // 地址信息
  address: z.string().min(1, '地址不能为空'),
  city: z.string().min(1, '城市不能为空'),
  province: z.string().min(1, '省份不能为空'),
  postalCode: z.string().min(1, '邮政编码不能为空'),
  country: z.string().default('Canada'),
  
  // 房型
  propertyType: z.nativeEnum(PropertyType).default(PropertyType.APARTMENT),
  
  // 容量信息
  maxGuests: z.number().int().min(1, '至少容纳1位客人').max(20, '最多20位客人'),
  bedrooms: z.number().int().min(0, '卧室数不能为负').max(10, '最多10间卧室'),
  beds: z.number().int().min(1, '至少1张床').max(20, '最多20张床'),
  bathrooms: z.number().min(0.5, '至少0.5个卫生间').max(10, '最多10个卫生间'),
  area: z.number().int().min(10, '面积至少10平方米').max(1000).optional(),
  
  // 价格
  pricePerNight: z.number().min(1, '每晚价格至少为1').max(10000),
  cleaningFee: z.number().min(0).max(1000).optional(),
  serviceFee: z.number().min(0).max(1000).optional(),
  
  // 设施
  amenities: z.array(z.string()).default([]),
  
  // 图片
  images: z.array(z.string().url('请输入有效的图片URL')).default([]),
  
  // Host关联
  hostId: z.string().cuid().optional(),
  
  // 其他设置
  minNights: z.number().int().min(1).default(28),
  maxNights: z.number().int().optional(),
  isInstantBook: z.boolean().default(false),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DRAFT),
});

// 更新房源表单验证（所有字段可选）
export const updatePropertySchema = createPropertySchema.partial();

// 房源列表查询验证
export const adminPropertyListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  city: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  hostId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'basePrice', 'bookingCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 导出类型
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type AdminPropertyListQuery = z.infer<typeof adminPropertyListQuerySchema>;
export type MultilingualTitle = z.infer<typeof multilingualTitleSchema>;
export type MultilingualDescription = z.infer<typeof multilingualDescriptionSchema>;
