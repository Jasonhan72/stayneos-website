import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type Locale = 'en' | 'fr' | 'zh';
export type UserRole = 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';

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

// 需要 Admin 角色的路由
const ADMIN_ROUTES = [
  '/admin',
];

const ADMIN_PREFIXES = [
  '/admin/',
];

// 需要 Host 角色的路由
const HOST_PREFIXES = [
  '/host/',
];

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

// 检查是否是 Admin 路由
function isAdminRoute(pathname: string): boolean {
  if (ADMIN_ROUTES.includes(pathname)) {
    return true;
  }
  
  for (const prefix of ADMIN_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// 检查是否是 Host 路由
function isHostRoute(pathname: string): boolean {
  for (const prefix of HOST_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

// JWT Payload 类型定义
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

// 验证 JWT token 并返回解码后的信息
async function verifyToken(token: string): Promise<{ valid: boolean; payload?: JWTPayload }> {
  try {
    // 简单的 JWT 结构验证
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    
    // 解析 payload
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    // 检查是否过期
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { valid: false };
    }
    
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// 检查用户是否有 Admin 权限
function hasAdminRole(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

// 检查用户是否有 Host 权限
function hasHostRole(role?: string): boolean {
  return role === 'HOST' || role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = detectLocale(request);
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Always set x-locale header for server components
  requestHeaders.set('x-locale', locale);
  
  // 获取 token
  const token = request.cookies.get('stayneos_auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // 验证 token 并获取用户信息
  let userPayload: JWTPayload | null = null;
  let isAuthenticated = false;
  
  if (token) {
    const result = await verifyToken(token);
    if (result.valid && result.payload) {
      isAuthenticated = true;
      userPayload = result.payload;
      requestHeaders.set('x-user-id', userPayload.userId || '');
      requestHeaders.set('x-user-role', userPayload.role || '');
      requestHeaders.set('x-user-email', userPayload.email || '');
    }
  }
  
  // 检查 Admin 路由权限
  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      
      const response = NextResponse.redirect(loginUrl);
      if (!request.cookies.get('stayneos_locale')?.value) {
        response.cookies.set('stayneos_locale', locale, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      return response;
    }
    
    const userRole = userPayload?.role;
    if (!hasAdminRole(userRole)) {
      // 用户已登录但没有 Admin 权限
      const forbiddenUrl = new URL('/403', request.url);
      const response = NextResponse.redirect(forbiddenUrl);
      return response;
    }
  }
  
  // 检查 Host 路由权限
  if (isHostRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'host_required');
      
      const response = NextResponse.redirect(loginUrl);
      if (!request.cookies.get('stayneos_locale')?.value) {
        response.cookies.set('stayneos_locale', locale, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      return response;
    }
    
    const userRole = userPayload?.role;
    if (!hasHostRole(userRole)) {
      // 用户已登录但没有 Host 权限，重定向到 Host 申请页面
      const applyUrl = new URL('/become-host', request.url);
      const response = NextResponse.redirect(applyUrl);
      return response;
    }
  }
  
  // 检查普通受保护路由
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      if (!request.cookies.get('stayneos_locale')?.value) {
        response.cookies.set('stayneos_locale', locale, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60,
          sameSite: 'lax',
        });
      }
      return response;
    }
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
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
};
