// src/app/api/properties/[id]/route.ts
// GET /api/properties/[id] - 房源详情

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { propertyIdSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, handleError, Errors } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { Prisma } from '@prisma/client';

// 房源详情查询包含的关联数据类型
const propertyDetailInclude = {
  images: {
    orderBy: { order: 'asc' as const },
  },
  amenities: {
    include: {
      amenity: {
        include: {
          category: true,
        },
      },
    },
  },
  reviews: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
    take: 10,
  },
  _count: {
    select: {
      reviews: true,
      bookings: true,
    },
  },
} as const;

type PropertyDetailWithRelations = Prisma.PropertyGetPayload<{
  include: typeof propertyDetailInclude;
}>;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  
  try {
    // 验证ID参数
    const { id } = await params;
    propertyIdSchema.parse({ id });
    
    // 查询房源详情
    const property = await prisma.property.findUnique({
      where: { 
        id,
        status: 'PUBLISHED', // 只返回已发布的房源
      },
      include: propertyDetailInclude,
    }) as PropertyDetailWithRelations | null;

    // 房源不存在
    if (!property) {
      throw Errors.NOT_FOUND('房源不存在或已下架');
    }

    // 计算平均评分
    const reviewStats = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: {
        rating: true,
        cleanliness: true,
        accuracy: true,
        location: true,
        checkIn: true,
        communication: true,
        value: true,
      },
      _count: {
        rating: true,
      },
    });

    // 增加浏览计数（异步，不阻塞响应）
    prisma.property.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch((err: Error) => {
      logger.error('更新浏览计数失败', err);
    });

    // 格式化响应数据
    const formattedProperty = {
      id: property.id,
      title: property.title,
      slug: property.slug,
      description: property.description,
      shortDesc: property.shortDesc,
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood,
      state: property.state,
      country: property.country,
      postalCode: property.postalCode,
      latitude: property.latitude,
      longitude: property.longitude,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      area: property.area,
      floor: property.floor,
      basePrice: property.basePrice,
      currency: property.currency,
      cleaningFee: property.cleaningFee,
      serviceFee: property.serviceFee,
      monthlyDiscount: property.monthlyDiscount,
      weeklyDiscount: property.weeklyDiscount,
      minNights: property.minNights,
      maxNights: property.maxNights,
      isFeatured: property.isFeatured,
      isInstantBook: property.isInstantBook,
      images: property.images.map((img: { id: string; url: string; alt: string | null; caption: string | null; isPrimary: boolean; order: number }) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        caption: img.caption,
        isPrimary: img.isPrimary,
        order: img.order,
      })),
      amenities: property.amenities.map((pa: { amenity: { id: string; name: string; icon: string | null; category?: { name: string } | null } }) => ({
        id: pa.amenity.id,
        name: pa.amenity.name,
        icon: pa.amenity.icon,
        category: pa.amenity.category?.name,
      })),
      reviews: property.reviews.map((review: { id: string; rating: number; comment: string; createdAt: Date; user: { id: string; name: string | null; avatar: string | null } }) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          avatar: review.user.avatar,
        },
      })),
      stats: {
        viewCount: property.viewCount,
        bookingCount: property.bookingCount,
        reviewCount: property._count.reviews,
        avgRating: reviewStats._avg.rating || 0,
        avgCleanliness: reviewStats._avg.cleanliness || 0,
        avgAccuracy: reviewStats._avg.accuracy || 0,
        avgLocation: reviewStats._avg.location || 0,
        avgCheckIn: reviewStats._avg.checkIn || 0,
        avgCommunication: reviewStats._avg.communication || 0,
        avgValue: reviewStats._avg.value || 0,
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
    
    // 记录日志
    const duration = Date.now() - startTime;
    logger.apiRequest('GET', `/api/properties/${id}`, duration, 200);
    
    return createSuccessResponse(formattedProperty);
    
  } catch (error) {
    logger.error(`获取房源详情失败: ${(await params).id}`, error as Error);
    return handleError(error);
  }
}
