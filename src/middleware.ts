import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type Locale = 'en' | 'fr' | 'zh';

// 需要保护的路由
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/bookings',
  '/wishlists',
  '/checkout',
];

// 需要认证的路由前缀
const PROTECTED_PREFIXES = [
  '/dashboard/',
  '/profile/',
  '/booking/',
  '/payment/',
];

// 公开路由（不需要认证）- 保留供将来使用
// const PUBLIC_ROUTES = [
//   '/',
//   '/login',
//   '/register',
//   '/forgot-password',
//   '/properties',
//   '/property/',
//   '/about',
//   '/contact',
//   '/services',
//   '/landlords',
//   '/corporate',
//   '/help',
//   '/terms',
//   '/privacy',
// ];

// Detect user's preferred locale from Accept-Language header
function detectLocale(request: NextRequest): Locale {
  // 1. Check cookie first (user's explicit preference)
  const cookieLocale = request.cookies.get('stayneos_locale')?.value;
  if (cookieLocale === 'zh' || cookieLocale === 'en' || cookieLocale === 'fr') {
    return cookieLocale;
  }
  
  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().toLowerCase());
    
    for (const lang of languages) {
      if (lang.startsWith('zh')) return 'zh';
      if (lang.startsWith('fr')) return 'fr';
      if (lang.startsWith('en')) return 'en';
    }
  }
  
  // 3. Default to English
  return 'en';
}

// 检查路由是否需要认证
function isProtectedRoute(pathname: string): boolean {
  // 检查精确匹配
  if (PROTECTED_ROUTES.includes(pathname)) {
    return true;
  }
  
  // 检查前缀匹配
  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// 验证 JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    // 简单的 JWT 结构验证
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // 解析 payload
    const payload = JSON.parse(atob(parts[1]));
    
    // 检查是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = detectLocale(request);
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Always set x-locale header for server components
  requestHeaders.set('x-locale', locale);
  
  // 检查是否需要认证
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get('stayneos_auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // 如果没有 token 或 token 无效，重定向到登录页
    if (!token || !(await verifyToken(token))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      
      // Set locale cookie if not already set
      const existingCookie = request.cookies.get('stayneos_locale')?.value;
      if (!existingCookie) {
        response.cookies.set('stayneos_locale', locale, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      
      return response;
    }
    
    // Token 有效，添加用户信息到 headers（可选）
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      requestHeaders.set('x-user-id', payload.sub || '');
      requestHeaders.set('x-user-role', payload.role || '');
    } catch {}
  }
  
  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Set cookie if not already set (first visit)
  const existingCookie = request.cookies.get('stayneos_locale')?.value;
  if (!existingCookie) {
    response.cookies.set('stayneos_locale', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
};
