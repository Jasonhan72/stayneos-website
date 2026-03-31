'use client';

import Link from 'next/link';
import { BedDouble, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type ChatPropertyCardProps = {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    bedrooms: number;
  };
};

export function ChatPropertyCard({ property }: ChatPropertyCardProps) {
  const { t } = useI18n();

  return (
    <Link
      href={`/property/${property.id}`}
      className="block w-[200px] shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="h-24 bg-gradient-to-br from-neutral-900 via-neutral-700 to-amber-200" />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">{property.title}</h3>
        <div className="flex items-start gap-1.5 text-xs text-neutral-500">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{property.location}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-neutral-900">
            {new Intl.NumberFormat('en-CA', {
              style: 'currency',
              currency: 'CAD',
              maximumFractionDigits: 0,
            }).format(property.price)}
            <span className="ml-1 text-xs font-normal text-neutral-500">
              {t('chat.perMonth', '/month')}
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-600">
            <BedDouble size={14} />
            {t('chat.bedroomsValue', '{count} BR', { count: property.bedrooms })}
          </span>
        </div>
      </div>
    </Link>
  );
}
