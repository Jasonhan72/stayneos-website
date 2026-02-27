/**
 * 预订数据获取 Hooks
 * 使用 SWR 进行数据缓存和重新验证
 */

'use client';

import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiClient } from '@/lib/api-client';
import { 
  Booking, 
  CreateBookingRequest, 
  CreateBookingResponse,
  BookingQueryParams,
  PaginatedResponse 
} from '@/types';

// SWR 默认配置
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
};

// 构建查询字符串
function buildQueryString(params?: BookingQueryParams): string {
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
 * 获取用户预订列表
 */
export function useBookings(params?: BookingQueryParams, config?: SWRConfiguration) {
  const queryString = buildQueryString(params);
  const key = `/api/bookings${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Booking>
  >(
    key,
    () => apiClient.get(`/api/bookings${queryString}`),
    { ...defaultSWRConfig, ...config }
  );
  
  return {
    bookings: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 获取单个预订详情
 */
export function useBooking(id: string | null, config?: SWRConfiguration) {
  const key = id ? `/api/bookings/${id}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<Booking>(
    key,
    () => apiClient.get(`/api/bookings/${id}`),
    { ...defaultSWRConfig, ...config }
  );
  
  return {
    booking: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 创建预订 Mutation
 */
export function useCreateBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/bookings',
    async (_key: string, { arg }: { arg: CreateBookingRequest }) => {
      return apiClient.post<CreateBookingResponse>('/api/bookings', arg);
    }
  );
  
  return {
    createBooking: trigger,
    isCreating: isMutating,
    error,
  };
}

/**
 * 取消预订 Mutation
 */
export function useCancelBooking() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/bookings/cancel',
    async (_key: string, { arg }: { arg: { bookingId: string; reason?: string } }) => {
      return apiClient.patch<Booking>(`/api/bookings/${arg.bookingId}/cancel`, { 
        reason: arg.reason 
      });
    }
  );
  
  return {
    cancelBooking: trigger,
    isCancelling: isMutating,
    error,
  };
}

/**
 * 检查预订是否可创建（验证日期是否可用）
 */
export function useCheckAvailability(
  propertyId: string | null,
  checkIn?: string,
  checkOut?: string,
  config?: SWRConfiguration
) {
  const params = new URLSearchParams();
  if (checkIn) params.append('checkIn', checkIn);
  if (checkOut) params.append('checkOut', checkOut);
  
  const queryString = params.toString();
  const key = propertyId && checkIn && checkOut 
    ? `/api/bookings/check-availability/${propertyId}?${queryString}` 
    : null;
  
  const { data, error, isLoading } = useSWR<{ available: boolean; message?: string }>(
    key,
    () => apiClient.get(`/api/bookings/check-availability/${propertyId}?${queryString}`),
    { ...defaultSWRConfig, ...config, revalidateOnFocus: false }
  );
  
  return {
    isAvailable: data?.available ?? null,
    message: data?.message,
    isLoading,
    error,
  };
}

/**
 * 预加载预订数据
 */
export function preloadBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
  const queryString = buildQueryString(params);
  return apiClient.get(`/api/bookings${queryString}`);
}

export function preloadBooking(id: string): Promise<Booking> {
  return apiClient.get(`/api/bookings/${id}`);
}
