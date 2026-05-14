/**
 * Wishlist API 请求 / 响应类型契约
 */
import { z } from 'zod';

export const wishlistPostBodySchema = z.object({
  propertyId: z.string().min(1).max(128),
  action: z.enum(['add', 'remove', 'toggle']).optional(),
});
export type WishlistPostBody = z.infer<typeof wishlistPostBodySchema>;

export interface WishlistEntry { id: string; addedAt: string; }

export interface WishlistProperty {
  id: string;
  title: string;
  slug: string;
  address: string;
  city: string;
  neighborhood: string;
  priceMonthly: number;
  basePrice: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  reviewCount: number;
  averageRating: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

export interface WishlistGetResponse {
  properties: WishlistProperty[];
  wishlist: WishlistEntry[];
}

export interface WishlistPostResponse {
  success: true;
  action: 'added' | 'removed';
  propertyId: string;
}
