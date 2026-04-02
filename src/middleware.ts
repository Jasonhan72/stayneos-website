import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

// 创建国际化中间件
const intlMiddleware = createMiddleware({
  // 支持的语言
  locales,
  
  // 默认语言
  defaultLocale,
  
  // 语言检测
  localeDetection: true,
  
  // 路径名格式
  pathnames: {
    // 主页
    '/': '/',
    
    // 市场洞察
    '/market-insights': '/market-insights',
    
    // 房源详情
    '/property/[id]': '/property/[id]',
    
    // 关于我们
    '/about': '/about',
    
    // 联系我们
    '/contact': '/contact',
    
    // 长期租赁
    '/long-term': '/long-term',
    
    // 商业客户
    '/for-business': '/for-business',
    
    // 房东页面
    '/for-hosts': '/for-hosts',
    
    // 代理商页面
    '/for-agents': '/for-agents',
    
    // 仪表板
    '/dashboard': '/dashboard',
    '/dashboard/bookings': '/dashboard/bookings',
    '/dashboard/profile': '/dashboard/profile',
    '/dashboard/wishlists': '/dashboard/wishlists',
    
    // 认证页面
    '/login': '/login',
    '/register': '/register',
    '/forgot-password': '/forgot-password',
    '/reset-password': '/reset-password',
    
    // 其他页面
    '/faq': '/faq',
    '/privacy': '/privacy',
    '/terms': '/terms',
    '/cancellation-policy': '/cancellation-policy',
    '/service-animals': '/service-animals',
    '/help': '/help',
  },
  
  // 默认区域设置前缀
  localePrefix: 'as-needed',
  
  // 备用语言
  alternateLinks: true,
});

// 导出配置
export const config = {
  matcher: [
    // 匹配所有路径，除了：
    // - 内部路径 (_next, api, static files)
    // - 图片文件
    // - favicon.ico
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

// 导出中间件
export default intlMiddleware;