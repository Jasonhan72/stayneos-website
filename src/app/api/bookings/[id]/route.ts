import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Required for static export - API routes need this but won't function in static export
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

// 获取单个预订详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              select: { url: true, alt: true },
            },
            amenities: {
              include: {
                amenity: true,
              },
            },
          },
        },
        review: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '预订不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking detail error:', error);
    return NextResponse.json(
      { error: '获取预订详情失败' },
      { status: 500 }
    );
  }
}

// 取消预订
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { action, reason } = body;

    if (action !== 'cancel') {
      return NextResponse.json(
        { error: '无效的操作' },
        { status: 400 }
      );
    }

    // 获取预订信息
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '预订不存在' },
        { status: 404 }
      );
    }

    // 检查是否可以取消
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '预订已取消' },
        { status: 400 }
      );
    }

    if (booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
      return NextResponse.json(
        { error: '已入住或已完成的预订无法取消' },
        { status: 400 }
      );
    }

    // 更新预订状态
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    // TODO: 如果有已支付金额，发起退款
    // 这里应该调用 Stripe 退款 API

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: '预订已成功取消',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: '取消预订失败' },
      { status: 500 }
    );
  }
}
