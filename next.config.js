/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    // Cloudflare Pages uses static export; Next.js image optimization server is unavailable there.
    // Keep unoptimized=true so next/image serves direct image URLs in production.
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
      headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }],
    },
  ],

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
