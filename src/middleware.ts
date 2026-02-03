import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000");
  
  // Add performance headers
  response.headers.set("Accept-CH", "DPR, Width, Viewport-Width");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
