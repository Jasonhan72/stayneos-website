import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Card, Badge, Section } from '@/components/ui';

interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
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
    price: 12000,
    rating: 4.9,
    reviewCount: 42,
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
    price: 6500,
    rating: 4.8,
    reviewCount: 38,
    images: [
      '/images/simcoe-238-living.jpg',
      '/images/simcoe-238-kitchen.jpg',
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
    price: 3500,
    rating: 4.8,
    reviewCount: 21,
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

function formatPropertyPrice(property: FeaturedProperty) {
  return `From $${property.price.toLocaleString()} CAD/month`;
}

export function FeaturedPropertiesSection() {
  return (
    <Section bg="neutral">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-3">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 md:mb-4">
            Featured Toronto residences
          </h2>
          <p className="text-base md:text-lg text-neutral-600 max-w-xl">
            A server-rendered selection of premium furnished apartments available for monthly stays.
          </p>
        </div>

        <Link
          href="/properties"
          className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
        >
          View all properties
          <ArrowRight size={18} className="ml-1" />
        </Link>
      </div>

      {featuredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
          <p className="text-neutral-500">No featured properties are available right now.</p>
        </div>
      ) : (
        <>
          {/* Mobile: horizontal swipe cards */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory">
            <div className="flex gap-4 w-max pb-2">
              {featuredProperties.map((property) => (
                <div key={property.id} className="w-[84vw] max-w-sm snap-start">
                  <Card className="group h-full">
                    <Link href={`/property/${property.id}`}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <Image
                          src={property.images[0] || '/images/placeholder-property.jpg'}
                          alt={property.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {property.featured && (
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="primary">Featured</Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                            {property.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={14} className="text-accent fill-accent" />
                            <span className="text-sm font-medium">{property.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-neutral-500 mb-3">
                          <MapPin size={14} />
                          <span className="text-sm truncate">{property.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                          <span>{property.bedrooms} beds</span>
                          <span>·</span>
                          <span>{property.area.toLocaleString()} sqft</span>
                          <span>·</span>
                          <span>Up to {property.maxGuests}</span>
                        </div>

                        <div className="flex items-baseline justify-between pt-3 border-t border-neutral-200">
                          <span className="text-lg font-bold text-neutral-900">{formatPropertyPrice(property)}</span>
                          <span className="text-xs text-neutral-400">{property.reviewCount} reviews</span>
                        </div>
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
                    <Image
                      src={property.images[0] || '/images/placeholder-property.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {property.featured && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="primary">Featured</Badge>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white transition-colors rounded-full">
                      <Star size={18} className="text-neutral-400" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={14} className="text-accent fill-accent" />
                        <span className="text-sm font-medium">{property.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-500 mb-4">
                      <MapPin size={14} />
                      <span className="text-sm truncate">{property.location}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
                      <span>{property.bedrooms} beds</span>
                      <span>·</span>
                      <span>{property.area.toLocaleString()} sqft</span>
                      <span>·</span>
                      <span>Up to {property.maxGuests} guests</span>
                    </div>

                    <div className="flex items-baseline justify-between pt-4 border-t border-neutral-200">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-neutral-900">{formatPropertyPrice(property)}</span>
                      </div>
                      <span className="text-sm text-neutral-400">{property.reviewCount} reviews</span>
                    </div>
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
