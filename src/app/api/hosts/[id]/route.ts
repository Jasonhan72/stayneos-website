// src/app/api/hosts/[id]/route.ts
// Host 详情 API - 公开接口

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 查询参数验证
const hostPropertiesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(24).default(12),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ALL']).default('PUBLISHED'),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/hosts/:id
 * 获取Host详情 - 公开接口
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const queryResult = hostPropertiesQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status') || 'PUBLISHED',
    });

    const { page, limit, status } = queryResult.success ? queryResult.data : 
      { page: 1, limit: 12, status: 'PUBLISHED' as const };

    // 获取Host详情
    const host = await prisma.host.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        tagline: true,
        bio: true,
        avatarUrl: true,
        status: true,
        isVerified: true,
        hostLevel: true,
        superhostSince: true,
        totalProperties: true,
        totalBookings: true,
        responseRate: true,
        responseTimeMinutes: true,
        rating: true,
        timezone: true,
        createdAt: true,
      },
    });

    if (!host) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Host不存在' },
        { status: 404 }
      );
    }

    // 检查Host状态
    if (host.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Host Inactive', message: '该Host当前不可用' },
        { status: 403 }
      );
    }

    // 构建房源查询条件
    const propertyWhere: any = {
      hostId: id,
    };

    // 非管理员只能看到已发布的房源
    if (status === 'PUBLISHED') {
      propertyWhere.status = 'PUBLISHED';
    } else if (status === 'DRAFT') {
      propertyWhere.status = 'DRAFT';
    }
    // status === 'ALL' 则不限制状态

    // 获取Host的房源列表
    const skip = (page - 1) * limit;
    
    const [properties, totalProperties] = await Promise.all([
      prisma.property.findMany({
        where: propertyWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDesc: true,
          address: true,
          city: true,
          neighborhood: true,
          bedrooms: true,
          bathrooms: true,
          maxGuests: true,
          basePrice: true,
          currency: true,
          status: true,
          isFeatured: true,
          isInstantBook: true,
          viewCount: true,
          bookingCount: true,
          createdAt: true,
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
          amenities: {
            select: {
              amenity: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
            take: 5,
          },
        },
      }),
      prisma.property.count({ where: propertyWhere }),
    ]);

    // 计算hosting年数
    const yearsHosting = Math.max(
      1,
      new Date().getFullYear() - new Date(host.createdAt).getFullYear()
    );

    // 格式化响应数据
    const formattedHost = {
      ...host,
      yearsHosting,
      properties: {
        data: properties.map(p => ({
          ...p,
          coverImage: p.images[0] || null,
          images: undefined,
          amenities: p.amenities.map(a => a.amenity),
        })),
        pagination: {
          page,
          limit,
          total: totalProperties,
          totalPages: Math.ceil(totalProperties / limit),
        },
      },
    };

    return NextResponse.json({
      data: formattedHost,
    });

  } catch (error) {
    console.error('[Host GET Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '获取Host详情失败' },
      { status: 500 }
    );
  }
}
