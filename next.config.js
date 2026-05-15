/** @type {import('next').NextConfig} */
// CSP strategy:
// - Replace bare `https:` allowlists with explicit hosts (drastically smaller
//   attack surface than "any HTTPS origin").
// - Keep 'unsafe-inline' for script (JSON-LD via react's inline children) and
//   style (Next.js streaming SSR style chunks). Full nonce/hash migration is
//   tracked as a follow-up; OpenNext on Cloudflare Workers does not expose a
//   per-request nonce hook today, so this stays at the current state.
// - Add upgrade-insecure-requests to force any stray http:// resource over TLS.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://*.cloudflare.com https://*.r2.cloudflarestorage.com https://*.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "connect-src 'self' https://*.cloudflareinsights.com https://api.resend.com",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig = {
  // i18n handled at runtime by middleware + @/lib/i18n (App Router style).
  // The legacy Pages Router `i18n` config block doesn't apply here and
  // would only produce a build-time warning.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  outputFileTracingRoot: __dirname,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.cloudflare.com', port: '', pathname: '/**' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/:path*.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|otf)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/api/:path*',
      headers: [{ key: 'Cache-Control', value: 'no-store, private' }],
    },
    {
      source: '/(login|register|forgot-password|reset-password)',
      headers: [{ key: 'Cache-Control', value: 'no-store, private' }],
    },
    {
      source: '/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],

  redirects: async () => [
    {
      source: '/listings',
      destination: '/properties',
      permanent: true,
    },
    {
      source: '/listings/:path*',
      destination: '/properties/:path*',
      permanent: true,
    },
    {
      source: '/wishlists',
      destination: '/dashboard/wishlists',
      permanent: true,
    },
    {
      source: '/messages',
      destination: '/dashboard/messages',
      permanent: true,
    },
  ],

  poweredByHeader: false,
  compress: true,
};

// Wrap with bundle analyzer only when ANALYZE=true. Keeps the dependency
// out of every production build but lets `npm run analyze` produce reports.
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
