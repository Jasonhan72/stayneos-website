/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR Mode (Cloudflare Pages + Workers via OpenNext)
  // output: 'export' removed for SSR

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
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error"] }
        : false,
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=3600, stale-while-revalidate=60',
        },
      ],
    },
  ],

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
