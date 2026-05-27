'use client';

import { BedDouble, Bath, MapPin, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type ChatExternalProperty = {
  title: string;
  url: string;
  source: string;
  price?: number;
  priceText?: string;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  image?: string;
  imageUrl?: string;
  snippet?: string;
};

interface Props {
  property: ChatExternalProperty;
  variant?: 'light' | 'dark'; // dark = on hero glass panel (white text), light = standalone
}

function formatPrice(num?: number, raw?: string): string | null {
  if (typeof num === 'number') {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(num);
  }
  if (raw) return raw;
  return null;
}

function cleanSource(host: string): string {
  return host.replace(/^www\./, '');
}

export function ChatExternalPropertyCard({ property, variant = 'dark' }: Props) {
  const { t } = useI18n();
  const priceLabel = formatPrice(property.price, property.priceText);

  const isDark = variant === 'dark';
  const cardBg = isDark
    ? 'bg-white/10 border-white/15 hover:bg-white/15'
    : 'bg-white border-neutral-200 hover:shadow-lg';
  const titleClr = isDark ? 'text-white' : 'text-neutral-900';
  const subClr = isDark ? 'text-white/65' : 'text-neutral-600';
  const priceClr = isDark ? 'text-accent' : 'text-neutral-900';
  const badgeClr = isDark
    ? 'bg-white/15 text-white/85'
    : 'bg-neutral-100 text-neutral-700';
  const iconClr = isDark ? 'text-white/70' : 'text-neutral-500';
  const imageSrc = property.image || property.imageUrl || '/images/placeholder-property.jpg';

  return (
    <a
      href={property.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block w-[260px] shrink-0 overflow-hidden rounded-2xl border transition ${cardBg}`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={property.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).src = '/images/wellesley-1607-living.jpg';
          }}
        />
        <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClr}`}>
          <ExternalLink size={10} />
          {cleanSource(property.source)}
        </span>
      </div>
      <div className="space-y-2 p-3">
        <h4 className={`line-clamp-2 text-sm font-semibold leading-snug ${titleClr}`}>
          {property.title}
        </h4>
        {property.location ? (
          <div className={`flex items-start gap-1.5 text-xs ${subClr}`}>
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 pt-1">
          {priceLabel ? (
            <span className={`text-sm font-bold ${priceClr}`}>
              {priceLabel}
              {typeof property.price === 'number' ? (
                <span className={`ml-0.5 text-[10px] font-normal ${subClr}`}>
                  /{t('common.month', 'mo')}
                </span>
              ) : null}
            </span>
          ) : (
            <span className={`text-xs ${subClr}`}>{t('chat.priceUnavailable', 'See listing')}</span>
          )}
          <div className={`flex items-center gap-2 text-[11px] ${iconClr}`}>
            {property.bedrooms !== undefined ? (
              <span className="flex items-center gap-1">
                <BedDouble size={12} />
                {property.bedrooms === 0
                  ? t('chat.studio', 'Studio')
                  : `${property.bedrooms}`}
              </span>
            ) : null}
            {property.bathrooms !== undefined ? (
              <span className="flex items-center gap-1">
                <Bath size={12} />
                {property.bathrooms}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </a>
  );
}
