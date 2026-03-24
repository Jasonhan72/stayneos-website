const fs = require('fs');
const path = require('path');

// 修复 PropertyDetailClient.tsx
const filePath = path.join(__dirname, 'src/app/property/[id]/PropertyDetailClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. 添加 useEffect 导入
content = content.replace(
  "import { useState, useMemo, useRef } from 'react';",
  "import { useState, useMemo, useRef, useEffect } from 'react';"
);

// 2. 在组件中添加 isClient 状态
content = content.replace(
  '  const [currentImageIndex, setCurrentImageIndex] = useState(0);',
  `  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false); // 客户端检测状态
  
  // 客户端检测 useEffect
  useEffect(() => {
    setIsClient(true);
  }, []);`
);

// 3. 修复 window.location.reload() 调用
content = content.replace(
  '            onRetry={() => window.location.reload()}',
  '            onRetry={() => { if (typeof window !== "undefined") window.location.reload(); }}'
);

// 4. 修复 share 函数中的 window 和 navigator 访问
const shareFunctionStart = content.indexOf('onClick={async () => {');
if (shareFunctionStart !== -1) {
  const shareFunctionEnd = content.indexOf('}', shareFunctionStart + 50);
  const shareFunction = content.substring(shareFunctionStart, shareFunctionEnd + 1);
  
  const fixedShareFunction = shareFunction.replace(
    'const shareUrl = `${window.location.origin}/property/${propertyId}`;',
    'const shareUrl = isClient ? `${window.location.origin}/property/${propertyId}` : "";'
  ).replace(
    'if (navigator.share) {',
    'if (isClient && navigator.share) {'
  ).replace(
    'await navigator.clipboard.writeText(shareUrl);',
    'if (isClient && navigator.clipboard) await navigator.clipboard.writeText(shareUrl);'
  );
  
  content = content.substring(0, shareFunctionStart) + fixedShareFunction + content.substring(shareFunctionEnd + 1);
}

// 5. 添加 suppressHydrationWarning 到主元素
content = content.replace(
  '    <main className="min-h-screen bg-white" suppressHydrationWarning>',
  '    <main className="min-h-screen bg-white" suppressHydrationWarning>'
);

fs.writeFileSync(filePath, content);
console.log('Fixed PropertyDetailClient.tsx');

// 现在创建 /api/wishlist 路由
const apiDir = path.join(__dirname, 'src/app/api/wishlist');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// 创建 GET 路由
const getRoute = path.join(apiDir, 'route.ts');
fs.writeFileSync(getRoute, `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/wishlist - 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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
      message: \`Wishlist updated for property \${propertyId}\`,
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
`);

console.log('Created /api/wishlist route');
