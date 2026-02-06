"use client";

import { Heart, Star, MapPin, Users, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  images: string[];
  maxGuests: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  featured?: boolean;
  description?: string;
  minNights?: number;
  monthlyDiscount?: number;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article 
      className="group h-full" 
      aria-labelledby={`property-title-${property.id}`}
    >
      <Link 
        href={`/properties/${property.id}`} 
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
      >
        <div className="card h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={property.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
              alt={`${property.title} - 主图`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Toggle favorite
              }}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`收藏 ${property.title}`}
              type="button"
            >
              <Heart size={20} className="text-neutral-500 hover:text-error transition-colors" aria-hidden="true" />
            </button>

            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-accent text-primary text-xs font-bold rounded-full shadow-md">
                精选
              </div>
            )}

            {/* Monthly Discount Badge */}
            {property.monthlyDiscount && property.monthlyDiscount > 0 && (
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-md">
                月租优惠 {property.monthlyDiscount}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 
                id={`property-title-${property.id}`} 
                className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors duration-200 text-lg"
              >
                {property.title}
              </h3>
              <div 
                className="flex items-center gap-1 shrink-0 bg-accent/10 px-2 py-1 rounded-full" 
                aria-label={`评分 ${property.rating} 分`}
              >
                <Star size={14} className="text-accent fill-accent" aria-hidden="true" />
                <span className="text-sm font-bold text-neutral-800">{property.rating}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-neutral-500 mb-3">
              <MapPin size={16} className="shrink-0" aria-hidden="true" />
              <span className="text-sm truncate">{property.location}</span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 text-neutral-500 text-sm mb-4">
              <div 
                className="flex items-center gap-1.5" 
                aria-label={`最多容纳 ${property.maxGuests} 人`}
              >
                <Users size={16} aria-hidden="true" />
                <span>最多{property.maxGuests}人</span>
              </div>
              <div 
                className="flex items-center gap-1.5" 
                aria-label={`面积 ${property.area} 平方米`}
              >
                <Maximize size={16} aria-hidden="true" />
                <span>{property.area}m²</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline justify-between pt-4 mt-auto border-t border-neutral-100">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-neutral-900">
                  ${property.price.toLocaleString()} CAD
                </span>
                <span className="text-sm text-neutral-500">/{property.priceUnit}</span>
              </div>
              <span 
                className="text-xs text-neutral-400" 
                aria-label={`${property.reviewCount} 条评价`}
              >
                {property.reviewCount}条评价
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
