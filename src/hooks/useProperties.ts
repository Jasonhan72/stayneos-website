/**
 * 房源数据获取 Hooks
 * 使用 SWR 进行数据缓存和重新验证
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { apiClient } from '@/lib/api-client';
import { 
  Property, 
  PropertyListItem, 
  PropertyQueryParams,
  PaginatedResponse 
} from '@/types';

// SWR 默认配置
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 5 * 60 * 1000, // 5 分钟自动刷新
  errorRetryCount: 3,
};

// 构建查询字符串
function buildQueryString(params?: PropertyQueryParams): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 获取房源列表
 */
export function useProperties(params?: PropertyQueryParams, config?: SWRConfiguration) {
  const queryString = buildQueryString(params);
  const key = `/api/properties${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<PropertyListItem>
  >(
    key,
    () => apiClient.get(`/api/properties${queryString}`),
    { ...defaultSWRConfig, ...config }
  );
  
  return {
    properties: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取单个房源详情
 */
export function useProperty(id: string | null, config?: SWRConfiguration) {
  const key = id ? `/api/properties/${id}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<Property>(
    key,
    () => apiClient.get(`/api/properties/${id}`),
    { ...defaultSWRConfig, ...config }
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
  const key = `/api/properties/featured?limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<Property[]>(
    key,
    () => apiClient.get(`/api/properties/featured?limit=${limit}`),
    { ...defaultSWRConfig, ...config }
  );
  
  return {
    properties: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取房源可用日期
 */
export function usePropertyAvailability(
  propertyId: string | null, 
  startDate?: string, 
  endDate?: string,
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const key = propertyId ? `/api/properties/${propertyId}/availability${queryString ? `?${queryString}` : ''}` : null;
  
  const { data, error, isLoading } = useSWR<{ dates: string[] }>(
    key,
    () => apiClient.get(`/api/properties/${propertyId}/availability${queryString ? `?${queryString}` : ''}`),
    { ...defaultSWRConfig, ...config }
  );
  
  return {
    availableDates: data?.dates || [],
    isLoading,
    error,
  };
}

/**
 * 预加载房源数据（用于预取）
 */
export function preloadProperty(id: string): Promise<Property> {
  return apiClient.get(`/api/properties/${id}`);
}

export function preloadProperties(params?: PropertyQueryParams): Promise<PaginatedResponse<PropertyListItem>> {
  const queryString = buildQueryString(params);
  return apiClient.get(`/api/properties${queryString}`);
}
