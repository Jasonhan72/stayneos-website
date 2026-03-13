import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stayneos.com';
  const lastModified = new Date();
  const routes = [
    '/',
    '/properties',
    '/contact',
    '/about',
    '/for-business',
    '/for-hosts',
    '/for-agents',
    '/for-students',
    '/long-term',
    '/market-insights',
    '/faq',
    '/help',
    '/privacy',
    '/terms',
  ];

  return routes.map((route, index) => ({
    url: route === '/' ? baseUrl : `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '/' || route === '/properties' ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : route === '/properties' ? 0.9 : 0.7,
  }));
}
