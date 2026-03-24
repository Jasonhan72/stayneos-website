import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';

// GET /api/wishlist - 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // TODO: 从数据库获取用户收藏
    // 这里返回模拟数据
    const wishlist = [
      { id: 'prop-55-cooper', addedAt: new Date().toISOString() },
      { id: 'prop-238-simcoe', addedAt: new Date().toISOString() }
    ];
    
    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - 添加或删除收藏
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { propertyId, action = 'toggle' } = body;
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: 实现数据库操作
    // action: 'add' | 'remove' | 'toggle'
    
    return NextResponse.json({ 
      success: true, 
      message: `Wishlist updated for property ${propertyId}`,
      action
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
