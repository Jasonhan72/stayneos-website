/**
 * Wishlist API 共享类型
 *
 * Wishlist 域涉及的 API 请求/响应类型。
 * 前后端共用，确保类型安全。
 */

/** 收藏项基础结构 */
export interface WishlistItem {
  id: string;
  addedAt: string;
}

/** GET /api/wishlist 成功返回 */
export interface WishlistGetResponse {
  properties: WishlistPropertyCard[];
  wishlist: WishlistItem[];
  /** 仅当请求失败时出现 */
  error?: string;
}

/** POST /api/wishlist 成功返回 */
export interface WishlistPostResponse {
  success: true;
  action: 'added' | 'removed';
  propertyId: string;
  /** 仅当请求失败时出现 */
  error?: string;
}

/** Wishlist API 返回的精简房源卡片（给收藏页用） */
export interface WishlistPropertyCard {
  id: string;
  title: string;
  slug?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  priceMonthly?: number;
  basePrice?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  reviewCount?: number;
  averageRating?: number;
  images?: WishlistPropertyImage[];
}

export interface WishlistPropertyImage {
  url: string;
  isPrimary?: boolean;
}
