import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Required for static export
export function generateStaticParams() {
  return [];
}

// 创建支付意图 (Payment Intent)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '支付功能暂时不可用，正在维护中' },
      { status: 503 }
    );

    /*
    // TODO: Re-enable after migrating Booking and Payment models to D1
    const body = await request.json();
    const { bookingId } = body;
    ...
    */
  } catch (error: unknown) {
    console.error('Create payment intent error:', error);
    const errorMessage = error instanceof Error ? error.message : '创建支付失败';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
