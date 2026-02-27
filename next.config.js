/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static Export Mode (Cloudflare Pages)
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,

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

  // NOTE: headers and redirects don't work with output: 'export'
  // Moved to Cloudflare Pages: public/_headers and public/_redirects

  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
