import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type Locale = 'en' | 'fr' | 'zh';

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

export function middleware(request: NextRequest) {
  const locale = detectLocale(request);
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Always set x-locale header for server components
  requestHeaders.set('x-locale', locale);
  
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
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
