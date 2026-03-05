import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateBookingDates, generateBookingNumber } from '@/lib/booking';
import { getCurrentUser } from '@/lib/auth';

// Required for static export - returns empty as this is an API route
export function generateStaticParams() {
  return [];
}

// 创建预订
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = body;

    // 验证必填字段
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 获取房源信息
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: '房源不存在' },
        { status: 404 }
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证日期
    const dateValidation = validateBookingDates(
      checkIn,
      checkOut,
      property.minNights
    );

    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // 计算晚数
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // 基础价格 (将 Decimal 转为 number)
    const basePrice = Number(property.basePrice);
    
    // 月租折扣
    const isMonthly = nights >= 28;
    let discountRate = 1;
    let discountPercentage = 0;
    
    if (isMonthly && property.monthlyDiscount) {
      discountPercentage = Number(property.monthlyDiscount);
      discountRate = (100 - discountPercentage) / 100;
    }
    
    const discountedPrice = Math.round(basePrice * discountRate);
    const subtotal = nights * discountedPrice;
    
    // 清洁费和服务费
    const cleaningFee = Number(property.cleaningFee || 0);
    const serviceFee = Math.round(subtotal * 0.1);
    
    // 折扣金额
    const discount = nights * basePrice - subtotal;
    
    // 税费 (13% HST)
    const taxableAmount = subtotal + cleaningFee + serviceFee;
    const tax = Math.round(taxableAmount * 0.13);
    
    // 总计
    const total = subtotal + cleaningFee + serviceFee + tax;
    
    // 验证最低入住天数
    if (nights < property.minNights) {
      return NextResponse.json(
        { error: `最少需要预订 ${property.minNights} 天` },
        { status: 400 }
      );
    }

    // 创建预订
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        propertyId,
        userId: user.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights,
        guests,
        guestName: guestName || user.name,
        guestEmail: guestEmail || user.email,
        guestPhone: guestPhone || user.phone,
        basePrice: basePrice,
        cleaningFee: cleaningFee,
        serviceFee: serviceFee,
        discount: discount,
        discountRate: discountRate,
        tax: tax,
        totalPrice: total,
        currency: property.currency || 'CAD',
        specialRequests,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        totalPrice: total,
        currency: property.currency || 'CAD',
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: '创建预订失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取用户预订列表
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { userId: string; status?: string | { in: string[] }; checkIn?: { gte: Date } } = { userId: user.id };
    
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        where.status = { in: ['PENDING', 'CONFIRMED'] };
        where.checkIn = { gte: new Date() };
      } else if (status === 'completed') {
        where.status = 'CHECKED_OUT';
      } else if (status === 'active') {
        where.status = { in: ['CONFIRMED', 'CHECKED_IN'] };
      }
    }

    const bookings = await prisma.booking.findMany({
      // @ts-expect-error - Prisma types are complex, using runtime validation
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        payments: {
          where: { status: 'COMPLETED' },
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookings: (bookings as any[]).map(booking => ({
        ...booking,
        paidAmount: booking.payments.reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0),
      })),
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: '获取预订列表失败' },
      { status: 500 }
    );
  }
}
