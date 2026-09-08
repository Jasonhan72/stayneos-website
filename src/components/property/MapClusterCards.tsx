'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface ClusterCardProperty {
  id: string;
  slug?: string;
  title: string;
  location?: string;
  address?: string;
  price?: number;
  priceMonthly?: number;
  images?: string[];
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface MapClusterCardsProps {
  properties: ClusterCardProperty[];
  /** Overrides the count shown in the header (e.g. full cluster size). */
  count?: number;
  onSelect?: (id: string) => void;
  onClose: () => void;
}

export function propertyPrice(property: ClusterCardProperty): number {
  return Number(property.priceMonthly || property.price || 0);
}

export function propertyImage(property: ClusterCardProperty): string {
  return property.images?.[0] || '/images/cooper-55-c5e8357d.jpg';
}

export function propertyLocation(property: ClusterCardProperty): string {
  return property.location || property.address || '';
}

export default function MapClusterCards({ properties, count, onSelect, onClose }: MapClusterCardsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ left: 0 });
  }, [properties]);

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (el && typeof el.scrollBy === 'function') el.scrollBy({ left: direction * 264, behavior: 'smooth' });
  };

  if (properties.length === 0) return null;

  const total = count ?? properties.length;

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-3 pb-3" data-testid="cluster-cards">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/10 backdrop-blur">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <p className="text-sm font-semibold text-neutral-900">
            {total} {total === 1 ? 'stay' : 'stays'} in this area
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cluster cards"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10 transition hover:bg-neutral-50 md:flex"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.slug || property.id}`}
                onClick={() => onSelect?.(property.id)}
                className="group flex w-60 shrink-0 snap-start overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-300"
              >
                <div className="relative h-20 w-24 shrink-0 bg-neutral-100">
                  <Image
                    src={propertyImage(property)}
                    alt={property.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
                  <p className="truncate text-sm font-semibold text-neutral-900">{property.title}</p>
                  <p className="truncate text-xs text-neutral-500">{propertyLocation(property)}</p>
                  <p className="mt-1 text-sm font-bold text-[#DC2626]">
                    ${propertyPrice(property).toLocaleString()}
                    <span className="text-xs font-normal text-neutral-500">/mo</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10 transition hover:bg-neutral-50 md:flex"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
