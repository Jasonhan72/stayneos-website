'use client';

import { useState, useCallback } from 'react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import Link from 'next/link';
import { ArrowRight, MapPin, Star, Heart } from 'lucide-react';
import { Card, Badge, Section } from '@/components/ui';
import { useI18n } from '@/lib/i18n';
import { getTierDiscountPercent, type PricingTiers, type PricingTier } from '@/lib/property-pricing-discounts';

interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  maxGuests: number;
  area: number;
  bedrooms: number;
  featured?: boolean;
}

const featuredProperties: FeaturedProperty[] = [
  {
    id: '1',
    title: '55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite',
    location: '55 Cooper St, Toronto, ON M5E 0G1',
    monthlyPrice: 12000,
    quarterlyPrice: 10800,
    annualPrice: 9600,
    rating: 0,
    reviewCount: 0,
    images: [
      '/images/cooper-55-c5e8357d.jpg',
      '/images/cooper-55-e98a880d.jpg',
      '/images/cooper-55-a12c07ee.jpg',
    ],
    maxGuests: 6,
    area: 1273,
    bedrooms: 3,
    featured: true,
  },
  {
    id: '2',
    title: '238 Simcoe St (Grange Park) · Executive 3BR Suite',
    location: '238 Simcoe St, Toronto, ON M5T 0A2',
    monthlyPrice: 6500,
    quarterlyPrice: 5850,
    annualPrice: 5200,
    rating: 0,
    reviewCount: 0,
    images: [
      '/images/simcoe-238-kitchen.jpg',
      '/images/simcoe-238-living.jpg',
      '/images/simcoe-238-1.jpg',
    ],
    maxGuests: 5,
    area: 1100,
    bedrooms: 3,
    featured: true,
  },
  {
    id: '3',
    title: '22 Wellesley St E · Modern 1BR City View',
    location: '22 Wellesley St E, Toronto, ON',
    monthlyPrice: 3500,
    quarterlyPrice: 3150,
    annualPrice: 2800,
    rating: 0,
    reviewCount: 0,
    images: [
      '/images/wellesley-1607-living.jpg',
      '/images/wellesley-1607-bedroom.jpg',
      '/images/wellesley-1607-kitchen.jpg',
    ],
    maxGuests: 2,
    area: 550,
    bedrooms: 1,
    featured: true,
  },
];

function getPricingLabelsFromT(t: (key: string, fallback?: string) => string) {
  return {
    monthly: t('pricing.monthly', 'Monthly'),
    quarterly: t('pricing.quarterly', 'Quarterly'),
    annual: t('pricing.annual', 'Annual'),
    reviews: t('pricing.reviews', 'reviews'),
    perMonth: t('pricing.perMonth', '/month'),
  };
}

function PricingRows({ property }: { property: FeaturedProperty }) {
  const { t } = useI18n();
  const labels = getPricingLabelsFromT(t);
  const tiers: PricingTiers = {
    monthly: property.monthlyPrice,
    quarterly: property.quarterlyPrice,
    annual: property.annualPrice,
  };
  const rows = [
    { key: 'monthly', label: labels.monthly, value: property.monthlyPrice },
    { key: 'quarterly', label: labels.quarterly, value: property.quarterlyPrice },
    { key: 'annual', label: labels.annual, value: property.annualPrice },
  ] satisfies Array<{ key: PricingTier; label: string; value: number }>;

  return (
    <div className="space-y-2 pt-3 border-t border-neutral-200">
      {rows.map((row) => {
        const discountPercent = getTierDiscountPercent(tiers, row.key);

        return (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-600">{row.label}</span>
            <span className="flex shrink-0 items-center gap-2">
              {discountPercent > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {t('property.savePercent', 'Save {percent}%', { percent: discountPercent })}
                </span>
              )}
              <span className="text-base font-semibold text-neutral-900">
                ${row.value.toLocaleString()}
                <span className="text-xs font-normal text-neutral-500 ml-1">{labels.perMonth}</span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [isFav, setIsFav] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const favs = JSON.parse(localStorage.getItem('neos_favorites') || '[]');
      return favs.includes(propertyId);
    } catch { return false; }
  });

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav((prev: boolean) => {
      const next = !prev;
      try {
        const favs: string[] = JSON.parse(localStorage.getItem('neos_favorites') || '[]');
        const updated = next ? [...favs, propertyId] : favs.filter(id => id !== propertyId);
        localStorage.setItem('neos_favorites', JSON.stringify(updated));
      } catch {}
      return next;
    });
  }, [propertyId]);

  return (
    <button
      onClick={toggle}
      className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white transition-colors rounded-full z-10"
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={18} className={isFav ? 'text-red-500 fill-red-500' : 'text-neutral-400'} />
    </button>
  );
}

export function FeaturedPropertiesSection() {
  const { t } = useI18n();
  return (
    <Section bg="neutral">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-3">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3 md:mb-4">
            {t('properties.featured', 'Our Collection — Every home, personally selected')}
          </h2>
          <p className="text-base md:text-lg text-neutral-600 max-w-xl">
            {t('properties.subtitle', 'A curated selection of premium furnished apartments available for monthly stays.')}
          </p>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
        >
          {t('properties.viewAll', 'View all properties')}
          <ArrowRight size={18} className="ml-1" />
        </Link>
      </div>

      {featuredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-500">{t('properties.empty', 'No featured properties are available right now.')}</p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards, no horizontal scrolling. */}
          <div className="md:hidden">
            <div className="grid gap-4">
              {featuredProperties.map((property) => (
                <div key={property.id}>
                  <Card className="group h-full">
                    <Link href={`/property/${property.id}`}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <ResponsiveImage
                          src={property.images[0] || '/images/placeholder-property.jpg'}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {property.featured && (
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="primary">{t('properties.featured', 'Featured')}</Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                            {property.title}
                          </h3>
                          {property.reviewCount > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Star size={14} className="text-accent fill-accent" />
                              <span className="text-sm font-medium">{property.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-neutral-500 mb-3">
                          <MapPin size={14} />
                          <span className="text-sm truncate">{property.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                          <span>{property.bedrooms} {t('property.bedroomsShort', 'beds')}</span>
                          <span>·</span>
                          <span>{property.area.toLocaleString()} {t('property.sqft', 'sqft')}</span>
                          <span>·</span>
                          <span>{t('property.max', 'Up to')} {property.maxGuests}</span>
                        </div>

                        <PricingRows property={property} />
                        {/* Hotel Comparison */}
                        <div className="hotel-comparison mt-1">
                          <span className="text-xs text-neutral-500">
                            {t('property.hotelEquivalent', 'Hotel equivalent:')}{' '}
                            <span className="text-neutral-400 line-through">
                              {property.id === '1' ? '~$18,000/mo' : property.id === '2' ? '~$10,500/mo' : '~$7,500/mo'}
                            </span>
                          </span>
                        </div>
                        {property.reviewCount > 0 && (
                          <p className="mt-2 text-xs text-neutral-400">{property.reviewCount} {t('pricing.reviews', 'reviews')}</p>
                        )}
                      </div>
                    </Link>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="group">
                <Link href={`/property/${property.id}`}>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <ResponsiveImage
                      src={property.images[0] || '/images/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {property.featured && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="primary">{t('properties.featured', 'Featured')}</Badge>
                      </div>
                    )}

                    <FavoriteButton propertyId={property.id} />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      {property.reviewCount > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={14} className="text-accent fill-accent" />
                          <span className="text-sm font-medium">{property.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-neutral-500 mb-4">
                      <MapPin size={14} />
                      <span className="text-sm truncate">{property.location}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
                      <span>{property.bedrooms} {t('property.bedroomsShort', 'beds')}</span>
                      <span>·</span>
                      <span>{property.area.toLocaleString()} {t('property.sqft', 'sqft')}</span>
                      <span>·</span>
                      <span>{t('property.max', 'Up to')} {property.maxGuests} {t('property.guests', 'guests')}</span>
                    </div>

                    <PricingRows property={property} />
                    {/* Hotel Comparison */}
                    <div className="hotel-comparison mt-1">
                      <span className="text-sm text-neutral-500">
                        {t('property.hotelEquivalent', 'Hotel equivalent:')}{' '}
                        <span className="text-neutral-400 line-through">
                          {property.id === '1' ? '~$18,000/mo' : property.id === '2' ? '~$10,500/mo' : '~$7,500/mo'}
                        </span>
                      </span>
                    </div>
                    {property.reviewCount > 0 && (
                      <p className="mt-2 text-sm text-neutral-400">{property.reviewCount} {t('pricing.reviews', 'reviews')}</p>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
