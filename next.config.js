/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: "export",
  distDir: "dist",
  trailingSlash: true,
  
  // Image optimization
  images: {
    // Disable image optimization for static export
    unoptimized: true,
    // Allow images from external domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Image formats to serve
    formats: ["image/webp", "image/avif"],
    // Image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (1 day)
    minimumCacheTTL: 86400,
    // Enable dangerouslyAllowSVG for SVG optimization
    dangerouslyAllowSVG: true,
    // Content Security Policy for images
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react"],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      {
        // Cache static assets
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images
        source: "/(.*).(jpg|jpeg|png|webp|avif|svg|gif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=31536000",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Trailing slash
  trailingSlash: false,

  // Powered by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Static export for Cloudflare Pages
  output: "export",
  distDir: "dist",
};

module.exports = nextConfig;
