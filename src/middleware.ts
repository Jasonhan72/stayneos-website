import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getAuthSecret } from '@/lib/config/env';

export type Locale = 'en' | 'fr' | 'zh';
export type UserRole = 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';

// 需要保护的路由
// Note: /wishlists and /messages are redirected to /dashboard/* by middleware
// before auth check, so they don't need to be listed here.
const PROTECTED_ROUTES = [
  '/dashboard',
  '/account',
  '/host',
  '/bookings',
  '/checkout',
];

// 需要认证的路由前缀
const PROTECTED_PREFIXES = [
  '/dashboard/',
  '/account/',
  '/host/',
  '/booking/',
  '/bookings/',
  '/payment/',
  '/checkout/',
];

// 需要 Host 角色的路由
const HOST_EXACT = ['/host'];
const HOST_PREFIXES = [
  '/host/',  // /host/* sub-routes
];

const VALID_LOCALES: Locale[] = ['en', 'fr', 'zh'];

// Extract locale from URL path prefix (e.g., /zh/about → 'zh')
function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  if (segments.length >= 2) {
    const candidate = segments[1] as Locale;
    if (VALID_LOCALES.includes(candidate)) {
      return candidate;
    }
  }
  return null;
}

function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;

  const stripped = pathname.slice(locale.length + 1);
  return stripped.startsWith('/') ? stripped || '/' : `/${stripped}`;
}

// Detect user's preferred locale from URL, Cookie, or Accept-Language
function detectLocale(request: NextRequest): Locale {
  // 1. Check URL path prefix first (highest priority)
  const pathLocale = getLocaleFromPath(request.nextUrl.pathname);
  if (pathLocale) {
    return pathLocale;
  }
  
  // 2. Check cookie (user's explicit preference)
  const cookieLocale = request.cookies.get('stayneos_locale')?.value;
  if (cookieLocale === 'zh' || cookieLocale === 'en' || cookieLocale === 'fr') {
    return cookieLocale;
  }
  
  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().toLowerCase());
    
    for (const lang of languages) {
      if (lang.startsWith('zh')) return 'zh';
      if (lang.startsWith('fr')) return 'fr';
      if (lang.startsWith('en')) return 'en';
    }
  }
  
  // 4. Default to English
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

// 检查是否是 Host 路由
function isHostRoute(pathname: string): boolean {
  if (HOST_EXACT.includes(pathname)) return true;
  for (const prefix of HOST_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

// JWT Payload 类型定义
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tv?: number;
  exp?: number;
  iat?: number;
}

// 验证 JWT token 并返回解码后的信息
async function verifyToken(token: string): Promise<{ valid: boolean; payload?: JWTPayload }> {
  try {
    const secret = getAuthSecret();

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ['HS256'] }
    );

    return {
      valid: true,
      payload: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as UserRole,
        tv: payload.tv as number | undefined,
        exp: payload.exp,
        iat: payload.iat,
      },
    };
  } catch {
    return { valid: false };
  }
}

// 检查用户是否有 Host 权限
function hasHostRole(role?: string): boolean {
  return role === 'HOST' || role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export async function middleware(request: NextRequest) {
  // Canonical domain: www.stayneos.com (primary).
  // neos.rentals and all variants 301 → www.stayneos.com.
  const host = request.headers.get('host') || '';
  if (
    host === 'stayneos.com' ||
    host === 'neos.rentals' ||
    host === 'www.neos.rentals'
  ) {
    const url = request.nextUrl.clone();
    url.host = 'www.stayneos.com';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;
  const pathLocale = getLocaleFromPath(pathname);
  const pathnameWithoutLocale = stripLocaleFromPath(pathname);

  // Route dedup: redirect old flat routes to /dashboard equivalents.
  // Page-level redirect() is unreliable in OpenNext + Cloudflare Workers,
  // so these are handled at the middleware edge.
  const ROUTE_REDIRECTS: Record<string, string> = {
    '/wishlists': '/dashboard/wishlists',
    '/messages': '/dashboard/messages',
  };
  const redirectTarget = ROUTE_REDIRECTS[pathnameWithoutLocale];
  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = pathLocale && pathLocale !== 'en' ? `/${pathLocale}${redirectTarget}` : redirectTarget;
    return NextResponse.redirect(url, 308);
  }

  const locale = detectLocale(request);
  const existingCookieLocale = request.cookies.get('stayneos_locale')?.value;
  if (!pathLocale && (existingCookieLocale === 'zh' || existingCookieLocale === 'fr')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${existingCookieLocale}` : `/${existingCookieLocale}${pathname}`;
    return NextResponse.redirect(url, 307);
  }
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Always set x-locale header for server components
  requestHeaders.set('x-locale', locale);
  
  // 获取 token
  const token = request.cookies.get('stayneos_auth_token')?.value;
  
  // 验证 token 并获取用户信息
  let userPayload: JWTPayload | null = null;
  let isAuthenticated = false;
  
  if (token) {
    const result = await verifyToken(token);
    if (result.valid && result.payload) {
      // Check token version against DB (supports session revocation / password change)
      let tvValid = true;
      const tv = (result.payload as unknown as Record<string, unknown>).tv;
      if (tv !== undefined && tv !== null) {
        try {
          const { getDb } = await import('@/lib/d1');
          const db = getDb();
          const userRow = await db
            .prepare('SELECT token_version FROM User WHERE id = ?')
            .bind(result.payload.userId)
            .first<{ token_version: number }>();
          if (userRow) {
            tvValid = Number(tv) === userRow.token_version;
          }
        } catch {
          // DB unavailable — allow (fail open for page loads)
        }
      }

      if (tvValid) {
        isAuthenticated = true;
        userPayload = result.payload;
        requestHeaders.set('x-user-id', userPayload.userId || '');
        requestHeaders.set('x-user-role', userPayload.role || '');
        requestHeaders.set('x-user-email', userPayload.email || '');
      }
    }
  }
  
  // 检查 Host 路由权限
  if (isHostRoute(pathnameWithoutLocale)) {
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
  if (isProtectedRoute(pathnameWithoutLocale)) {
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
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathnameWithoutLocale;
  const response = pathLocale
    ? NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
  
  // Only set locale cookie for non-default locale (en is default).
  // This eliminates Set-Cookie from most first-visit responses, allowing
  // Cloudflare CDN to cache the HTML (responses with Set-Cookie bypass CDN).
  const existingCookie = request.cookies.get('stayneos_locale')?.value;
  if (pathLocale && pathLocale !== existingCookie) {
    // URL has explicit locale prefix → update cookie to match
    response.cookies.set('stayneos_locale', pathLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  } else if (!existingCookie && locale !== 'en') {
    // First visit with non-default locale → persist it
    response.cookies.set('stayneos_locale', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
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
