import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';

// Required for static export
export function generateStaticParams() {
  return [];
}

// 创建支付意图 (Payment Intent)
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
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: '预订ID不能为空' },
        { status: 400 }
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

    // 获取预订信息
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
      },
      include: {
        property: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '预订不存在' },
        { status: 404 }
      );
    }

    // 检查预订状态
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '预订已取消' },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: '预订已支付' },
        { status: 400 }
      );
    }

    // 计算支付金额（转换为分）
    const amountInCents = Math.round(Number(booking.totalPrice) * 100);

    // 创建 Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: user.id,
        propertyId: booking.propertyId,
      },
      description: `预订 #${booking.bookingNumber} - ${booking.property.title}`,
      receipt_email: user.email || undefined,
    });

    // 更新预订的 Stripe Payment Intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'PROCESSING',
      },
    });

    // 创建支付记录
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency,
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: 'CREDIT_CARD',
        status: 'PENDING',
        metadata: {
          clientSecret: paymentIntent.client_secret,
        },
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: booking.currency,
    });
  } catch (error: unknown) {
    console.error('Create payment intent error:', error);
    const errorMessage = error instanceof Error ? error.message : '创建支付失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
