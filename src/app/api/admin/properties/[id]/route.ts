// src/app/api/admin/properties/[id]/route.ts
// Admin 单个房源管理 API - 获取、更新、删除

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';
import { updatePropertySchema } from '@/lib/validations/property';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/properties/:id
 * 获取单个房源详情（Admin专用）
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // 验证Admin权限
  const auth = await requireAdmin();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
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
        host: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Not Found', message: '房源不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: property,
    });

  } catch (error) {
    console.error('[Admin Property GET Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '获取房源详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/properties/:id
 * 更新房源信息（Admin专用）
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  // 验证Admin权限
  const auth = await requireAdmin();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    // 验证输入数据
    const validationResult = updatePropertySchema.safeParse({ ...body, id });
    
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

    // 检查房源是否存在
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Not Found', message: '房源不存在' },
        { status: 404 }
      );
    }

    // 如果修改了slug，检查是否与其他房源冲突
    if (data.slug && data.slug !== existingProperty.slug) {
      const slugConflict = await prisma.property.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: 'Duplicate slug', message: '该slug已被其他房源使用' },
          { status: 409 }
        );
      }
    }

    // 如果修改了hostId，验证新Host是否存在
    if (data.hostId && data.hostId !== existingProperty.hostId) {
      const host = await prisma.host.findUnique({
        where: { id: data.hostId },
      });

      if (!host) {
        return NextResponse.json(
          { error: 'Invalid host', message: '指定的Host不存在' },
          { status: 400 }
        );
      }
    }

    // 使用事务更新
    const updatedProperty = await prisma.$transaction(async (tx) => {
      // 1. 更新房源基本信息
      const propertyUpdate: Prisma.PropertyUpdateInput = {};
      
      if (data.title !== undefined) propertyUpdate.title = data.title;
      if (data.slug !== undefined) propertyUpdate.slug = data.slug;
      if (data.description !== undefined) propertyUpdate.description = data.description;
      if (data.shortDesc !== undefined) propertyUpdate.shortDesc = data.shortDesc;
      
      // 位置信息
      if (data.address !== undefined) propertyUpdate.address = data.address;
      if (data.city !== undefined) propertyUpdate.city = data.city;
      if (data.neighborhood !== undefined) propertyUpdate.neighborhood = data.neighborhood;
      if (data.state !== undefined) propertyUpdate.state = data.state;
      if (data.country !== undefined) propertyUpdate.country = data.country;
      if (data.postalCode !== undefined) propertyUpdate.postalCode = data.postalCode;
      if (data.latitude !== undefined) propertyUpdate.latitude = data.latitude;
      if (data.longitude !== undefined) propertyUpdate.longitude = data.longitude;
      
      // 房型信息
      if (data.propertyType !== undefined) propertyUpdate.propertyType = data.propertyType;
      if (data.bedrooms !== undefined) propertyUpdate.bedrooms = data.bedrooms;
      if (data.bathrooms !== undefined) propertyUpdate.bathrooms = data.bathrooms;
      if (data.maxGuests !== undefined) propertyUpdate.maxGuests = data.maxGuests;
      if (data.area !== undefined) propertyUpdate.area = data.area;
      if (data.floor !== undefined) propertyUpdate.floor = data.floor;
      
      // 价格信息
      if (data.basePrice !== undefined) propertyUpdate.basePrice = data.basePrice;
      if (data.currency !== undefined) propertyUpdate.currency = data.currency;
      if (data.cleaningFee !== undefined) propertyUpdate.cleaningFee = data.cleaningFee;
      if (data.serviceFee !== undefined) propertyUpdate.serviceFee = data.serviceFee;
      if (data.monthlyDiscount !== undefined) propertyUpdate.monthlyDiscount = data.monthlyDiscount;
      if (data.weeklyDiscount !== undefined) propertyUpdate.weeklyDiscount = data.weeklyDiscount;
      if (data.minNights !== undefined) propertyUpdate.minNights = data.minNights;
      if (data.maxNights !== undefined) propertyUpdate.maxNights = data.maxNights;
      
      // 状态
      if (data.status !== undefined) propertyUpdate.status = data.status;
      if (data.isFeatured !== undefined) propertyUpdate.isFeatured = data.isFeatured;
      if (data.isInstantBook !== undefined) propertyUpdate.isInstantBook = data.isInstantBook;
      if (data.hostId !== undefined) propertyUpdate.host = { connect: { id: data.hostId } };
      if (data.adminCreated !== undefined) propertyUpdate.adminCreated = data.adminCreated;

      const updated = await tx.property.update({
        where: { id },
        data: propertyUpdate,
      });

      // 2. 更新图片（如果提供了images）
      if (data.images !== undefined) {
        // 删除旧图片
        await tx.propertyImage.deleteMany({
          where: { propertyId: id },
        });

        // 创建新图片
        if (data.images.length > 0) {
          await tx.propertyImage.createMany({
            data: data.images.map((img, index) => ({
              propertyId: id,
              url: img.url,
              alt: img.alt,
              caption: img.caption,
              order: img.order ?? index,
              isPrimary: img.isPrimary ?? (index === 0),
            })),
          });
        }
      }

      // 3. 更新设施关联（如果提供了amenityIds）
      if (data.amenityIds !== undefined) {
        // 删除旧关联
        await tx.propertyAmenity.deleteMany({
          where: { propertyId: id },
        });

        // 创建新关联
        if (data.amenityIds.length > 0) {
          await tx.propertyAmenity.createMany({
            data: data.amenityIds.map((amenityId) => ({
              propertyId: id,
              amenityId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 4. 如果修改了hostId，更新Host统计
      if (data.hostId && data.hostId !== existingProperty.hostId) {
        // 新Host +1
        await tx.host.update({
          where: { id: data.hostId },
          data: {
            totalProperties: {
              increment: 1,
            },
          },
        });

        // 旧Host -1
        if (existingProperty.hostId) {
          await tx.host.update({
            where: { id: existingProperty.hostId },
            data: {
              totalProperties: {
                decrement: 1,
              },
            },
          });
        }
      }

      return updated;
    });

    // 返回更新后的详情
    const property = await prisma.property.findUnique({
      where: { id: updatedProperty.id },
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
      message: '房源更新成功',
      data: property,
    });

  } catch (error) {
    console.error('[Admin Property PATCH Error]:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Duplicate entry', message: '该slug已被使用' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: '更新房源失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/properties/:id
 * 删除房源（Admin专用）
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // 验证Admin权限
  const auth = await requireAdmin();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;

    // 检查房源是否存在
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Not Found', message: '房源不存在' },
        { status: 404 }
      );
    }

    // 检查是否有未完成的预订
    const activeBookings = await prisma.booking.count({
      where: {
        propertyId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
        },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { 
          error: 'Has active bookings', 
          message: `该房源有 ${activeBookings} 个未完成的预订，无法删除` 
        },
        { status: 400 }
      );
    }

    const hostId = property.hostId;

    // 使用事务删除
    await prisma.$transaction(async (tx) => {
      // 1. 删除关联的预订（已完成的可以归档，这里先删除）
      await tx.booking.deleteMany({
        where: { propertyId: id },
      });

      // 2. 删除评价
      await tx.review.deleteMany({
        where: { propertyId: id },
      });

      // 3. 删除可用性日历
      await tx.availability.deleteMany({
        where: { propertyId: id },
      });

      // 4. 删除设施关联
      await tx.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      // 5. 删除图片
      await tx.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      // 6. 删除房源
      await tx.property.delete({
        where: { id },
      });

      // 7. 更新Host统计
      if (hostId) {
        await tx.host.update({
          where: { id: hostId },
          data: {
            totalProperties: {
              decrement: 1,
            },
          },
        });
      }
    });

    return NextResponse.json({
      message: '房源删除成功',
      data: { id },
    });

  } catch (error) {
    console.error('[Admin Property DELETE Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '删除房源失败' },
      { status: 500 }
    );
  }
}
