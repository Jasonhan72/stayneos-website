// src/app/api/bookings/route.ts
// GET /api/bookings - 预订列表
// POST /api/bookings - 创建预订

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { bookingListQuerySchema, createBookingSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, handleError, Errors } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { calculateNights } from '@/lib/utils';
import { Prisma } from '@prisma/client';

// 预订查询包含的关联数据类型
const bookingInclude = {
  property: {
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      neighborhood: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  },
} as const;

type BookingWithProperty = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

// 获取当前用户ID（暂时使用模拟用户，后续集成认证）
async function getCurrentUserId(): Promise<string | null> {
  // TODO: 从 session/token 中获取用户ID
  // 暂时返回 null，表示未登录
  return null;
}

// GET /api/bookings - 获取预订列表
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 获取当前用户
    const userId = await getCurrentUserId();
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // 验证参数
    const validatedParams = bookingListQuerySchema.parse(params);
    const { page, limit, status, fromDate, toDate } = validatedParams;
    
    // 构建 where 条件
    const where: Record<string, unknown> = {};
    
    // 用户筛选（如果已登录）
    if (userId) {
      where.userId = userId;
    }
    
    // 状态筛选
    if (status) {
      where.status = status;
    }
    
    // 日期范围筛选
    if (fromDate || toDate) {
      where.checkIn = {};
      if (fromDate) {
        (where.checkIn as Record<string, unknown>).gte = new Date(fromDate);
      }
      if (toDate) {
        (where.checkIn as Record<string, unknown>).lte = new Date(toDate);
      }
    }
    
    // 计算跳过数量
    const skip = (page - 1) * limit;
    
    // 并行查询总数和列表数据
    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    
    // 计算总页数
    const totalPages = Math.ceil(total / limit);
    
    // 格式化响应数据
    const formattedBookings = (bookings as BookingWithProperty[]).map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      property: {
        id: booking.property.id,
        title: booking.property.title,
        slug: booking.property.slug,
        city: booking.property.city,
        neighborhood: booking.property.neighborhood,
        image: booking.property.images[0]?.url || null,
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));
    
    // 记录日志
    const duration = Date.now() - startTime;
    logger.apiRequest('GET', '/api/bookings', duration, 200);
    
    return createSuccessResponse(formattedBookings, {
      page,
      limit,
      total,
      totalPages,
    });
    
  } catch (error) {
    logger.error('获取预订列表失败', error as Error);
    return handleError(error);
  }
}

// POST /api/bookings - 创建预订
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 获取当前用户
    const userId = await getCurrentUserId();
    
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createBookingSchema.parse(body);
    
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    } = validatedData;
    
    // 验证日期
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    
    if (checkInDate < now) {
      throw Errors.BAD_REQUEST('入住日期不能是过去的时间');
    }
    
    if (checkOutDate <= checkInDate) {
      throw Errors.BAD_REQUEST('退房日期必须晚于入住日期');
    }
    
    // 计算入住天数
    const nights = calculateNights(checkInDate, checkOutDate);
    
    // 查询房源信息
    const property = await prisma.property.findUnique({
      where: { 
        id: propertyId,
        status: 'PUBLISHED',
      },
    });
    
    if (!property) {
      throw Errors.NOT_FOUND('房源不存在或已下架');
    }
    
    // 检查最小入住天数
    if (nights < property.minNights) {
      throw Errors.BAD_REQUEST(`该房源最少需要预订 ${property.minNights} 晚`);
    }
    
    // 检查最大容纳人数
    if (guests > property.maxGuests) {
      throw Errors.BAD_REQUEST(`该房源最多可容纳 ${property.maxGuests} 位客人`);
    }
    
    // 检查日期是否已被预订
    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });
    
    if (existingBooking) {
      throw Errors.CONFLICT('所选日期已被预订，请选择其他日期');
    }
    
    // 计算价格 - 使用 Prisma.Decimal
    const Decimal = Prisma.Decimal;
    const basePrice = property.basePrice.times(nights);
    const cleaningFee = property.cleaningFee || new Decimal(0);
    const serviceFee = property.serviceFee || basePrice.times(0.12); // 默认12%服务费
    
    // 计算折扣
    let discount: Prisma.Decimal = new Decimal(0);
    if (nights >= 30 && property.monthlyDiscount) {
      discount = basePrice.times(property.monthlyDiscount.div(100));
    } else if (nights >= 7 && property.weeklyDiscount) {
      discount = basePrice.times(property.weeklyDiscount.div(100));
    }
    
    // 计算税费（假设13%）
    const subtotal = basePrice.plus(cleaningFee).plus(serviceFee).minus(discount);
    const tax = subtotal.times(0.13);
    const totalPrice = subtotal.plus(tax);
    
    // 创建预订
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        userId: userId || 'guest', // 未登录用户使用 guest
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        basePrice,
        cleaningFee,
        serviceFee,
        discount,
        tax,
        totalPrice,
        currency: property.currency,
        specialRequests: specialRequests || null,
        status: property.isInstantBook ? 'CONFIRMED' : 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            address: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });
    
    // 更新房源预订计数
    prisma.property.update({
      where: { id: propertyId },
      data: { bookingCount: { increment: 1 } },
    }).catch((err: Error) => {
      logger.error('更新预订计数失败', err);
    });
    
    // 记录日志
    const duration = Date.now() - startTime;
    logger.apiRequest('POST', '/api/bookings', duration, 201);
    logger.info('新预订创建成功', { 
      bookingId: booking.id, 
      bookingNumber: booking.bookingNumber,
      propertyId,
    });
    
    return createSuccessResponse({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      property: booking.property,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      priceBreakdown: {
        basePrice: booking.basePrice.toNumber(),
        cleaningFee: booking.cleaningFee?.toNumber() || 0,
        serviceFee: booking.serviceFee?.toNumber() || 0,
        discount: booking.discount?.toNumber() || 0,
        tax: booking.tax?.toNumber() || 0,
        totalPrice: booking.totalPrice.toNumber(),
        currency: booking.currency,
      },
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
    });
    
  } catch (error) {
    logger.error('创建预订失败', error as Error);
    return handleError(error);
  }
}
