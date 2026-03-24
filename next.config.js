/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https: data:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https:",
  "frame-src 'self' https://maps.google.com https://www.google.com",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudflare.com", port: "", pathname: "/**" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/:path*.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|otf)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "no-store, private" }],
    },
    {
      source: "/(login|register|forgot-password|reset-password)",
      headers: [{ key: "Cache-Control", value: "no-store, private" }],
    },
    {
      source: "/:path*",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        { key: "Content-Security-Policy", value: csp },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
