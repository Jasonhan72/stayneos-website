import { MetadataRoute } from 'next';
import { getPublicBaseUrl } from '@/lib/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicBaseUrl();
  const lastModified = new Date();
  
  const routes = [
    { path: '/', priority: 1, changeFreq: 'weekly' as const },
    { path: '/properties', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/for-business', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/for-hosts', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/for-agents', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/for-students', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/long-term', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/market-insights', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/help', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/services', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/neighborhoods', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/corporate', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/become-a-host', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/landlords', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/cancellation-policy', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/service-animals', priority: 0.5, changeFreq: 'monthly' as const },
  ];

  return routes.map(({ path, priority, changeFreq }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: changeFreq,
    priority,
  }));
}
