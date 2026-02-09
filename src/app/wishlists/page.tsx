'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Container } from '@/components/ui';
import { 
  Heart, 
  MapPin, 
  Star, 
  ArrowRight,
  Trash2,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
}

// Mock wishlist data
const mockWishlist: Property[] = [
  {
    id: 'prop-1',
    title: 'Luxury Downtown Condo with City View',
    location: 'Downtown Toronto, ON',
    price: 180,
    currency: 'CAD',
    priceUnit: 'night',
    rating: 4.9,
    reviewCount: 128,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  },
  {
    id: 'prop-2',
    title: 'Waterfront Executive Suite',
    location: 'Harbourfront, Toronto, ON',
    price: 250,
    currency: 'CAD',
    priceUnit: 'night',
    rating: 4.8,
    reviewCount: 96,
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  },
  {
    id: 'prop-3',
    title: 'Modern Yorkville Apartment',
    location: 'Yorkville, Toronto, ON',
    price: 220,
    currency: 'CAD',
    priceUnit: 'night',
    rating: 4.95,
    reviewCount: 156,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  },
  {
    id: 'prop-4',
    title: 'Cozy Midtown Studio',
    location: 'Midtown Toronto, ON',
    price: 120,
    currency: 'CAD',
    priceUnit: 'night',
    rating: 4.7,
    reviewCount: 84,
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=800',
  },
];

export default function WishlistsPage() {
  const [wishlist, setWishlist] = useState<Property[]>(mockWishlist);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (propertyId: string) => {
    setRemovingId(propertyId);
    // Add a small delay for visual feedback
    setTimeout(() => {
      setWishlist(prev => prev.filter(p => p.id !== propertyId));
      setRemovingId(null);
    }, 300);
  };

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="pt-20 pb-12">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-neutral-300" />
              </div>

              <h1 className="text-3xl font-bold text-neutral-900 mb-4">Your wishlist is empty</h1>
              <p className="text-neutral-600 mb-8">
                Start exploring our properties and save your favorites here. 
                You&apos;ll be able to compare them and book when you&apos;re ready.
              </p>

              <Link href="/properties">
                <Button size="lg">
                  Explore Properties
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </Container>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="pt-20 pb-12">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">My Wishlist</h1>
            <p className="text-neutral-600 mt-2">
              {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((property) => (
              <div
                key={property.id}
                className={cn(
                  "group bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all duration-300",
                  removingId === property.id 
                    ? "opacity-50 scale-95" 
                    : "hover:shadow-lg hover:-translate-y-1"
                )}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(property.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 
                               opacity-0 group-hover:opacity-100 transition-all duration-200
                               hover:bg-red-50 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Price Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 rounded-lg shadow-sm">
                    <span className="font-bold text-neutral-900">${property.price}</span>
                    <span className="text-sm text-neutral-500">/{property.priceUnit}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="block group/title"
                  >
                    <h3 className="font-semibold text-neutral-900 line-clamp-1 
                                   group-hover/title:text-accent transition-colors">
                      {property.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-neutral-500 text-sm mt-1">
                    <MapPin size={14} />
                    <span className="truncate">{property.location}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-neutral-900">{property.rating}</span>
                    <span className="text-sm text-neutral-500">({property.reviewCount} reviews)</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-3 mt-3 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Home size={14} />
                      <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
                    </div>
                    <span className="text-neutral-300">•</span>
                    <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/booking/${property.id}`} className="flex-1">
                      <Button size="sm" fullWidth>
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Browse More */}
          <div className="mt-12 text-center">
            <p className="text-neutral-600 mb-4">Looking for more options?</p>
            <Link href="/properties">
              <Button variant="outline">
                Browse All Properties
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </main>
  );
}
