// src/app/api/properties/route.ts
// GET /api/properties - 房源列表（支持筛选、分页）

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { propertyListQuerySchema } from '@/lib/validation/schemas';
import { createSuccessResponse, handleError } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';

// 房源查询包含的关联数据类型
const propertyInclude = {
  images: {
    orderBy: { order: 'asc' as const },
    take: 1,
  },
  amenities: {
    include: {
      amenity: true,
    },
    take: 5,
  },
  _count: {
    select: {
      reviews: true,
    },
  },
} as const;

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof propertyInclude;
}>;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // 验证参数
    const validatedParams = propertyListQuerySchema.parse(params);
    
    const {
      page,
      limit,
      city,
      neighborhood,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      checkIn,
      checkOut,
      isFeatured,
      sortBy,
      sortOrder,
    } = validatedParams;
    
    // 构建 where 条件
    const where: Record<string, unknown> = {
      status: 'PUBLISHED', // 只返回已发布的房源
    };
    
    // 城市筛选
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    // 街区筛选
    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    }
    
    // 房源类型筛选
    if (propertyType) {
      where.propertyType = propertyType;
    }
    
    // 价格范围筛选
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.basePrice as Record<string, unknown>).lte = maxPrice;
      }
    }
    
    // 卧室数量筛选
    if (bedrooms !== undefined) {
      where.bedrooms = { gte: bedrooms };
    }
    
    // 卫生间数量筛选
    if (bathrooms !== undefined) {
      where.bathrooms = { gte: bathrooms };
    }
    
    // 最大容纳人数筛选
    if (maxGuests !== undefined) {
      where.maxGuests = { gte: maxGuests };
    }
    
    // 特色房源筛选
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }
    
    // 日期可用性筛选（如果提供了日期）
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // 排除在日期范围内已被预订的房源
      where.bookings = {
        none: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      };
    }
    
    // 计算跳过数量
    const skip = (page - 1) * limit;
    
    // 构建排序
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;
    
    // 并行查询总数和列表数据
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: propertyInclude,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // 计算总页数
    const totalPages = Math.ceil(total / limit);

    // 格式化响应数据
    const formattedProperties = (properties as PropertyWithRelations[]).map((property) => ({
      id: property.id,
      title: property.title,
      slug: property.slug,
      shortDesc: property.shortDesc,
      city: property.city,
      neighborhood: property.neighborhood,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      area: property.area,
      basePrice: property.basePrice,
      currency: property.currency,
      monthlyDiscount: property.monthlyDiscount,
      weeklyDiscount: property.weeklyDiscount,
      minNights: property.minNights,
      isFeatured: property.isFeatured,
      isInstantBook: property.isInstantBook,
      image: property.images[0]?.url || null,
      amenities: property.amenities.map((pa: { amenity: { name: string } }) => pa.amenity.name),
      reviewCount: property._count.reviews,
      createdAt: property.createdAt,
    }));
    
    // 记录日志
    const duration = Date.now() - startTime;
    logger.apiRequest('GET', '/api/properties', duration, 200);
    
    return createSuccessResponse(formattedProperties, {
      page,
      limit,
      total,
      totalPages,
    });
    
  } catch (error) {
    logger.error('获取房源列表失败', error as Error);
    return handleError(error);
  }
}

// 获取可用城市列表（用于筛选）
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
