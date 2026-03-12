'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { PropertyCardData } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useProperties(_params?: Record<string, unknown>, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR('/api/properties', fetcher, {
    revalidateOnFocus: false,
    ...config,
  });

  return {
    properties: (data?.properties || []) as PropertyCardData[],
    pagination: data?.properties
      ? { totalPages: 1, currentPage: 1, total: data.properties.length }
      : undefined,
    isLoading,
    error,
    mutate,
  };
}

export function useProperty(idOrSlug: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    idOrSlug ? `/api/properties/${idOrSlug}` : null,
    fetcher,
    { revalidateOnFocus: false, ...config }
  );

  return {
    property: (data?.property || null) as PropertyCardData | null,
    isLoading,
    error,
    mutate,
  };
}

export function useFeaturedProperties(limit = 6, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR('/api/properties', fetcher, {
    revalidateOnFocus: false,
    ...config,
  });

  const properties = ((data?.properties || []) as PropertyCardData[]).slice(0, limit);

  return { properties, isLoading, error, mutate };
}

export async function fetchProperty(idOrSlug: string) {
  const data = await fetcher(`/api/properties/${idOrSlug}`);
  return data?.property || null;
}

export async function fetchProperties() {
  const data = await fetcher('/api/properties');
  return data?.properties || [];
}
