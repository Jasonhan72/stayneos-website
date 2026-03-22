import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/checkout/',
          '/payment/',
          '/booking/',
        ],
      },
    ],
    sitemap: 'https://stayneos.com/sitemap.xml',
  };
}
