import { getPublicBaseUrl } from '@/lib/config/env';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/host/',
          '/dashboard/',
          '/account/',
          '/checkout/',
          '/payment/',
          '/booking/',
        ],
      },
    ],
    sitemap: `${getPublicBaseUrl()}/sitemap.xml`,
  };
}
