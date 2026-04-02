// 配置哪些页面应该被静态生成，哪些应该动态渲染

export const staticPages = [
  '/',
  '/market-insights',
  '/about',
  '/contact',
  '/corporate',
  '/for-business',
  '/for-students',
  '/for-hosts',
  '/for-agents',
  '/landlords',
  '/long-term',
  '/neighborhoods',
  '/services',
  '/faq',
  '/help',
  '/privacy',
  '/terms',
  '/cancellation-policy',
  '/service-animals',
];

export const dynamicPages = [
  '/admin',
  '/admin/email-logs',
  '/admin/inquiries',
  '/admin/properties',
  '/admin/properties/new',
  '/admin/users',
  '/dashboard',
  '/dashboard/bookings',
  '/dashboard/bookings/[id]',
  '/dashboard/properties',
  '/dashboard/properties/new',
  '/profile',
  '/profile/preferences',
  '/properties',
  '/bookings',
  '/wishlists',
  '/payment/cancel',
  '/payment/success',
  '/checkout/[propertyId]',
  '/booking/[propertyId]',
  '/property/[id]',
  '/register',
  '/login',
  '/forgot-password',
  '/reset-password',
];

// 检查页面是否需要动态渲染
export function shouldBeDynamic(pathname: string): boolean {
  return dynamicPages.some(pattern => {
    if (pattern.includes('[id]') || pattern.includes('[propertyId]')) {
      // 动态路径匹配
      const patternRegex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$');
      return patternRegex.test(pathname);
    }
    return pathname === pattern;
  });
}