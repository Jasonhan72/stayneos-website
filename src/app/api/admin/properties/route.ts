// src/app/api/admin/properties/route.ts
// Admin 房源管理 API - 列表和创建

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { 
  createPropertySchema, 
  adminPropertyListQuerySchema 
} from '@/lib/validations/property';
import { Prisma } from '@prisma/client';

// 系统Host的固定UUID
const SYSTEM_HOST_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/admin/properties
 * 获取房源列表（Admin专用）
 */
export async function GET(request: NextRequest) {
  // 验证Admin权限
  const auth = await requireAdmin();
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const queryResult = adminPropertyListQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      city: searchParams.get('city') || undefined,
      status: searchParams.get('status') || undefined,
      hostId: searchParams.get('hostId') || undefined,
      adminCreated: searchParams.get('adminCreated') || undefined,
      isFeatured: searchParams.get('isFeatured') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { 
      page, 
      limit, 
      city, 
      status, 
      hostId, 
      adminCreated, 
      isFeatured,
      sortBy,
      sortOrder 
    } = queryResult.data;

    const skip = (page - 1) * limit;

    // 构建where条件
    const where: Prisma.PropertyWhereInput = {};
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (hostId) {
      where.hostId = hostId;
    }
    
    if (adminCreated !== undefined) {
      where.adminCreated = adminCreated;
    }
    
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // 构建排序
    const orderBy: Prisma.PropertyOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // 并行查询数据和总数
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1, // 只取第一张图片作为封面
          },
          host: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('[Admin Properties GET Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '获取房源列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/properties
 * 创建新房源（Admin专用）
 */
export async function POST(request: NextRequest) {
  // 验证Admin权限
  const auth = await requireAdmin();
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();

    // 验证输入数据
    const validationResult = createPropertySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          details: validationResult.error.flatten(),
          message: '输入数据验证失败' 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 检查slug是否已存在
    const existingProperty = await prisma.property.findUnique({
      where: { slug: data.slug },
    });

    if (existingProperty) {
      return NextResponse.json(
        { error: 'Duplicate slug', message: '该slug已被使用' },
        { status: 409 }
      );
    }

    // 确保系统Host存在
    await ensureSystemHost();

    // 使用指定的hostId或默认系统Host
    const hostId = data.hostId || SYSTEM_HOST_ID;
    
    // 验证Host是否存在
    const host = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      return NextResponse.json(
        { error: 'Invalid host', message: '指定的Host不存在' },
        { status: 400 }
      );
    }

    // 使用事务创建房源和相关数据
    const property = await prisma.$transaction(async (tx) => {
      // 1. 创建房源
      const newProperty = await tx.property.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDesc: data.shortDesc,
          address: data.address,
          city: data.city,
          neighborhood: data.neighborhood,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          propertyType: data.propertyType,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          maxGuests: data.maxGuests,
          area: data.area,
          floor: data.floor,
          basePrice: data.basePrice,
          currency: data.currency,
          cleaningFee: data.cleaningFee,
          serviceFee: data.serviceFee,
          monthlyDiscount: data.monthlyDiscount,
          weeklyDiscount: data.weeklyDiscount,
          minNights: data.minNights,
          maxNights: data.maxNights,
          status: data.status,
          isFeatured: data.isFeatured,
          isInstantBook: data.isInstantBook,
          hostId: hostId,
          adminCreated: true,
        },
      });

      // 2. 创建图片
      if (data.images && data.images.length > 0) {
        await tx.propertyImage.createMany({
          data: data.images.map((img, index) => ({
            propertyId: newProperty.id,
            url: img.url,
            alt: img.alt,
            caption: img.caption,
            order: img.order ?? index,
            isPrimary: img.isPrimary ?? (index === 0),
          })),
        });
      }

      // 3. 关联设施
      if (data.amenityIds && data.amenityIds.length > 0) {
        await tx.propertyAmenity.createMany({
          data: data.amenityIds.map((amenityId) => ({
            propertyId: newProperty.id,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }

      // 4. 更新Host的房产统计
      await tx.host.update({
        where: { id: hostId },
        data: {
          totalProperties: {
            increment: 1,
          },
        },
      });

      return newProperty;
    });

    // 返回创建的房源详情
    const createdProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        host: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '房源创建成功',
      data: createdProperty,
    }, { status: 201 });

  } catch (error) {
    console.error('[Admin Properties POST Error]:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 唯一性冲突
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Duplicate entry', message: '该slug已被使用' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: '创建房源失败' },
      { status: 500 }
    );
  }
}

/**
 * 确保系统Host存在
 */
async function ensureSystemHost(): Promise<void> {
  const existingHost = await prisma.host.findUnique({
    where: { id: SYSTEM_HOST_ID },
  });

  if (!existingHost) {
    await prisma.host.create({
      data: {
        id: SYSTEM_HOST_ID,
        displayName: 'StayNeos Team',
        businessEmail: 'hello.stayneos@gmail.com',
        status: 'ACTIVE',
        isVerified: true,
        hostLevel: 'ESTABLISHED',
        timezone: 'America/Toronto',
        preferredLanguages: ['en', 'zh'],
      },
    });
  }
}
