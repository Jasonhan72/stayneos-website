import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Required for static export - returns empty as this is an API route
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateStaticParams() {
  return [];
}

// 创建预订
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
      { error: '预订功能暂时不可用，正在维护中' },
      { status: 503 }
    );

    /*
    // TODO: Re-enable after migrating Property model to D1
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone, specialRequests } = body;

    // 验证必填字段
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }
    
    ... rest of implementation ...
    */
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: '创建预订失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取用户预订列表
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '预订列表功能暂时不可用，正在维护中' },
      { status: 503 }
    );

    /*
    // TODO: Re-enable after migrating Booking model to D1
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    ...
    */
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: '获取预订列表失败' },
      { status: 500 }
    );
  }
}
