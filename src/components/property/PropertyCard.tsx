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
    <article className="group" aria-labelledby={`property-title-${property.id}`}>
      <Link href={`/properties/${property.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={property.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
              alt={`${property.title} - 主图`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
            
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Toggle favorite
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={`收藏 ${property.title}`}
              type="button"
            >
              <Heart size={18} className="text-gray-600" aria-hidden="true" />
            </button>

            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                精选
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 id={`property-title-${property.id}`} className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0" aria-label={`评分 ${property.rating} 分`}>
                <Star size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="text-sm font-medium">{property.rating}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-500 mb-3">
              <MapPin size={14} aria-hidden="true" />
              <span className="text-sm truncate">{property.location}</span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 text-gray-500 text-sm mb-4">
              <div className="flex items-center gap-1" aria-label={`最多容纳 ${property.maxGuests} 人`}>
                <Users size={14} aria-hidden="true" />
                <span>最多{property.maxGuests}人</span>
              </div>
              <div className="flex items-center gap-1" aria-label={`面积 ${property.area} 平方米`}>
                <Maximize size={14} aria-hidden="true" />
                <span>{property.area}m²</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">
                  ¥{property.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">/{property.priceUnit}</span>
              </div>
              <span className="text-xs text-gray-400" aria-label={`${property.reviewCount} 条评价`}>{property.reviewCount}条评价</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
