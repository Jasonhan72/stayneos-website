'use client';

import { useState, useEffect } from 'react';
import { PropertyCardData } from '@/types';

type PropertyWithBookedRanges = PropertyCardData & { bookedRanges?: Array<{ start: string; end: string }> };

export function useProperties() {
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/properties', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return {
    properties,
    pagination: properties.length
      ? { totalPages: 1, currentPage: 1, total: properties.length }
      : undefined,
    isLoading,
    error,
    mutate: () => {}, // Simple stub for compatibility
  };
}

export function useProperty(idOrSlug: string | null, initialProperty?: PropertyWithBookedRanges | null) {
  const [property, setProperty] = useState<PropertyWithBookedRanges | null>(initialProperty || null);
  const [isLoading, setIsLoading] = useState(!initialProperty);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!idOrSlug) {
      setIsLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${idOrSlug}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch property');
        const data = await res.json();
        setProperty(data.property ? { ...data.property, bookedRanges: data.bookedRanges || [] } : null);
      } catch (err) {
        if (!initialProperty) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [idOrSlug, initialProperty]);

  return {
    property,
    isLoading,
    error,
    mutate: () => {}, // Simple stub for compatibility
  };
}

export function useFeaturedProperties(limit = 6) {
  const { properties, isLoading, error } = useProperties();
  const featuredProperties = properties.slice(0, limit);

  return { properties: featuredProperties, isLoading, error, mutate: () => {} };
}

export async function fetchProperty(idOrSlug: string) {
  const res = await fetch(`/api/properties/${idOrSlug}`, { credentials: 'include' });
  const data = await res.json();
  return data?.property || null;
}

export async function fetchProperties() {
  const res = await fetch('/api/properties', { credentials: 'include' });
  const data = await res.json();
  return data?.properties || [];
}