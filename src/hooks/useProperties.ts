/**
 * 房源数据获取 Hooks
 * 静态导出模式：直接使用本地数据
 * 后端就绪后切换为 API 调用
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { mockProperties } from '@/lib/data';
import { PropertyCardData } from '@/types';

type MockProperty = (typeof mockProperties)[number];

function toCardData(p: MockProperty): PropertyCardData {
  return {
    id: p.id,
    title: p.title,
    titleZh: p.titleZh,
    titleFr: p.titleFr,
    location: p.location,
    price: p.price,
    priceUnit: p.priceUnit,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    maxGuests: p.maxGuests,
    area: p.area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    amenities: p.amenities,
    featured: p.featured,
    description: p.description,
    descriptionZh: p.descriptionZh,
    descriptionFr: p.descriptionFr,
    minNights: p.minNights,
    monthlyDiscount: p.monthlyDiscount,
  };
}

/**
 * 获取房源列表
 */
export function useProperties(_params?: Record<string, unknown>, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    'properties-list',
    () => Promise.resolve(mockProperties.map(toCardData)),
    { revalidateOnFocus: false, ...config }
  );

  return {
    properties: data || [],
    pagination: undefined as {totalPages: number; currentPage: number; total: number} | undefined,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取单个房源详情
 */
export function useProperty(id: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `property-${id}` : null,
    () => {
      const p = mockProperties.find(p => p.id === id);
      return Promise.resolve(p ? toCardData(p) : null);
    },
    { revalidateOnFocus: false, ...config }
  );

  return {
    property: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取精选房源
 */
export function useFeaturedProperties(limit = 6, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    `featured-${limit}`,
    () => Promise.resolve(
      mockProperties.filter(p => p.featured).slice(0, limit).map(toCardData)
    ),
    { revalidateOnFocus: false, ...config }
  );

  return {
    properties: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取房源可用性
 */
export function usePropertyAvailability(
  propertyId: string | null,
  _params?: { checkIn?: string; checkOut?: string },
  config?: SWRConfiguration
) {
  const { data, error, isLoading } = useSWR(
    propertyId ? `availability-${propertyId}` : null,
    () => Promise.resolve({ available: true, price: 0 }),
    { revalidateOnFocus: false, ...config }
  );

  return {
    availability: data,
    isLoading,
    error,
  };
}

/**
 * 获取房源详情（函数形式）
 */
export async function fetchProperty(id: string) {
  const p = mockProperties.find(p => p.id === id);
  return p ? toCardData(p) : null;
}

/**
 * 获取房源列表（函数形式）
 */
export async function fetchProperties() {
  return mockProperties.map(toCardData);
}
