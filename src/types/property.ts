/**
 * 房源类型定义 - 匹配 API 返回结构
 */

import { PropertyType, PropertyStatus } from '@prisma/client';

// 房源图片
export interface PropertyImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

// 房源设施
export interface PropertyAmenity {
  amenity: {
    id: string;
    name: string;
    icon?: string;
  };
}

// Host 信息
export interface PropertyHost {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

// 统计信息
export interface PropertyStats {
  bookings: number;
  reviews: number;
}

// 完整房源类型（来自 API）
export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  
  // 位置信息
  address: string;
  city: string;
  neighborhood: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  
  // 房型信息
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area: number;
  floor?: number;
  
  // 价格信息
  basePrice: number;
  currency: string;
  cleaningFee?: number;
  serviceFee?: number;
  monthlyDiscount?: number;
  weeklyDiscount?: number;
  minNights: number;
  maxNights?: number;
  
  // 状态和标签
  status: PropertyStatus;
  isFeatured: boolean;
  isInstantBook: boolean;
  
  // 关联数据
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  host?: PropertyHost;
  _count?: PropertyStats;
  
  // 统计
  viewCount: number;
  bookingCount: number;
  
  createdAt: string;
  updatedAt: string;
}

// 房源列表项（简化版）
export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  shortDesc?: string;
  city: string;
  neighborhood: string;
  basePrice: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area: number;
  isFeatured: boolean;
  images: PropertyImage[];
  _count?: PropertyStats;
}

// 用于 PropertyCard 的属性（兼容现有组件）
export interface PropertyCardData {
  id: string;
  title: string;
  titleZh?: string;
  titleFr?: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  images: string[];
  maxGuests: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  featured?: boolean;
  description?: string;
  descriptionZh?: string;
  descriptionFr?: string;
  minNights?: number;
  monthlyDiscount?: number;
  cleaningFee?: number;
}

// 房源查询参数
export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  city?: string;
  status?: PropertyStatus;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sortBy?: 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}
