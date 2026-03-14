/**
 * 属性数据转换工具
 * 将 API 返回的数据格式转换为组件需要的格式
 */

import { Property, PropertyListItem, PropertyCardData } from '@/types';

/**
 * 获取属性位置字符串
 */
export function getPropertyLocation(property: PropertyCardData): string {
  return property.location;
}

/**
 * 将 API Property 转换为 PropertyCard 格式
 */
export function toPropertyCardData(property: Property | PropertyListItem): PropertyCardData {
  // 处理 images - API 返回的是对象数组，需要提取 url
  const images = property.images?.length 
    ? property.images.map(img => img.url)
    : ['/images/placeholder-property.jpg'];

  // 处理位置显示
  const location = 'address' in property 
    ? property.address 
    : `${property.city}, ${property.neighborhood}`;

  // 没有真实评价数据时不注入默认评分
  let reviewCount = 0;
  if (property._count && typeof property._count === 'object' && 'reviews' in property._count) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rc = (property._count as any).reviews;
    if (typeof rc === 'number') reviewCount = rc;
  }
  if (!reviewCount && 'reviewCount' in property && typeof property.reviewCount === 'number') {
    reviewCount = property.reviewCount;
  }
  const rating = reviewCount > 0 && 'rating' in property && typeof property.rating === 'number'
    ? property.rating
    : 0;

  // 处理 amenities - API 返回的是对象数组
  const amenities = 'amenities' in property && property.amenities
    ? property.amenities.map(a => a.amenity.name)
    : [];

  // 价格处理 - API 返回的是 Decimal，需要转换为 number
  const price = typeof property.basePrice === 'string' 
    ? parseFloat(property.basePrice)
    : property.basePrice;

  // 构建标题（多语言支持）
  const title = property.title;

  return {
    id: property.id,
    title,
    titleZh: title, // 暂时使用相同标题，后续从 API 获取多语言
    titleFr: title,
    location,
    price,
    priceUnit: '晚',
    rating,
    reviewCount,
    images,
    maxGuests: property.maxGuests,
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: 'bathrooms' in property ? property.bathrooms : 1,
    amenities,
    featured: property.isFeatured,
    description: 'description' in property ? property.description : property.shortDesc || '',
    descriptionZh: 'description' in property ? property.description : property.shortDesc || '',
    descriptionFr: 'description' in property ? property.description : property.shortDesc || '',
    minNights: 'minNights' in property ? property.minNights : 28,
    monthlyDiscount: 'monthlyDiscount' in property && property.monthlyDiscount 
      ? (typeof property.monthlyDiscount === 'string' 
          ? parseFloat(property.monthlyDiscount) 
          : property.monthlyDiscount)
      : undefined,
    cleaningFee: 'cleaningFee' in property && property.cleaningFee
      ? (typeof property.cleaningFee === 'string'
          ? parseFloat(property.cleaningFee)
          : property.cleaningFee)
      : 80,
    monthlyPrice: 'monthlyPrice' in property && property.monthlyPrice
      ? (typeof property.monthlyPrice === 'string' ? parseFloat(property.monthlyPrice) : property.monthlyPrice)
      : undefined,
    quarterlyPrice: 'quarterlyPrice' in property && property.quarterlyPrice
      ? (typeof property.quarterlyPrice === 'string' ? parseFloat(property.quarterlyPrice) : property.quarterlyPrice)
      : undefined,
    annualPrice: 'annualPrice' in property && property.annualPrice
      ? (typeof property.annualPrice === 'string' ? parseFloat(property.annualPrice) : property.annualPrice)
      : undefined,
    quarterlyDiscountPercent: 'quarterlyDiscountPercent' in property && property.quarterlyDiscountPercent
      ? (typeof property.quarterlyDiscountPercent === 'string' ? parseFloat(property.quarterlyDiscountPercent) : property.quarterlyDiscountPercent)
      : undefined,
    annualDiscountPercent: 'annualDiscountPercent' in property && property.annualDiscountPercent
      ? (typeof property.annualDiscountPercent === 'string' ? parseFloat(property.annualDiscountPercent) : property.annualDiscountPercent)
      : undefined,
  };
}

/**
 * 批量转换属性列表
 */
export function toPropertyCardDataList(
  properties: (Property | PropertyListItem)[]
): PropertyCardData[] {
  return properties.map(toPropertyCardData);
}

/**
 * 构建属性图片 URL
 * 处理相对路径和绝对路径
 */
export function getPropertyImageUrl(url: string | undefined): string {
  if (!url) {
    return '/images/placeholder-property.jpg';
  }
  
  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是以 / 开头的相对路径，直接返回
  if (url.startsWith('/')) {
    return url;
  }
  
  // 否则添加 / 前缀
  return `/${url}`;
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number | string, currency = 'CAD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

function normalizePriceUnit(priceUnit?: string): string {
  return (priceUnit || '').toLowerCase().trim();
}

export function toMonthlyListingPrice(price: number | string | undefined | null, priceUnit?: string): number {
  const parsed = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  const numericPrice = Number.isFinite(parsed) ? parsed : 0;
  const unit = normalizePriceUnit(priceUnit);
  const isMonthlyUnit = ['month', 'monthly', 'mo', '/mo', '月', 'mois'].some((value) => unit.includes(value));

  if (isMonthlyUnit) {
    return Math.max(0, Math.floor(numericPrice / 100) * 100);
  }

  return Math.max(0, Math.floor((numericPrice * 30 * 0.8) / 100) * 100);
}

export function formatMonthlyListingPrice(price: number | string | undefined | null, priceUnit?: string): string {
  const monthlyPrice = toMonthlyListingPrice(price, priceUnit);
  return `From $${monthlyPrice.toLocaleString()}/Mo`;
}

/**
 * 计算折扣后价格
 */
export function calculateDiscountedPrice(
  basePrice: number | string,
  discountPercent: number | string | undefined | null
): number {
  const price = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
  
  if (!discountPercent) return price;
  
  const discount = typeof discountPercent === 'string' 
    ? parseFloat(discountPercent) 
    : discountPercent;
  
  return Math.round(price * (100 - discount) / 100);
}


export function resolvePropertyPricingTiers(property: PropertyCardData): { monthly: number; quarterly: number; annual: number } {
  const monthlyBase = property.monthlyPrice ?? toMonthlyListingPrice(property.price, property.priceUnit);

  const quarterly = property.quarterlyPrice
    ?? calculateDiscountedPrice(monthlyBase, property.quarterlyDiscountPercent ?? 10);

  const annual = property.annualPrice
    ?? calculateDiscountedPrice(monthlyBase, property.annualDiscountPercent ?? 20);

  return {
    monthly: Math.max(0, Math.round(monthlyBase)),
    quarterly: Math.max(0, Math.round(quarterly)),
    annual: Math.max(0, Math.round(annual)),
  };
}
