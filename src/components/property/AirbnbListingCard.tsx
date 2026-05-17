/**
 * AB-001 / AB-003 — Airbnb-style ListingCard
 *
 * Aspect 20:19 image + 1-line title + location + price-suffix
 * 留白多、无 box border、hover scale 1.03
 *
 * 与现有 PropertyCard 并行存在，由父组件选择使用。
 * Props 兼容现有 Property 接口（来自 PropertyCard.tsx）。
 */

"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import { useI18n } from "@/lib/i18n";
import { useWishlist } from "@/lib/context/WishlistContext";
import {
  Property,
  getLocalizedTitle,
  getPropertyLocation,
  getPropertyPrice,
} from "./PropertyCard";

interface AirbnbListingCardProps {
  property: Property;
  priority?: boolean;
}

export default function AirbnbListingCard({ property, priority }: AirbnbListingCardProps) {
  const { locale, t } = useI18n();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const title = getLocalizedTitle(property, locale);
  const location = getPropertyLocation(property);
  const price = getPropertyPrice(property);
  const isFeatured = property.featured || property.isFeatured || false;
  const wishlisted = isClient && isWishlisted(property.id);

  return (
    <article className="ab-listing-card group" aria-labelledby={`ab-listing-title-${property.id}`}>
      <Link
        href={`/property/${property.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ab-color-text)] focus-visible:ring-offset-2 rounded-[12px]"
      >
        <div className="ab-listing-card__media">
          <ResponsiveImage
            src={property.images[0] || "/images/cooper-55-c5e8357d.jpg"}
            alt={title}
            fill
            className="ab-listing-card__media-img"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={priority ? "eager" : "lazy"}
          />

          {isFeatured && (
            <span className="ab-listing-card__badge">{t("properties.featured")}</span>
          )}

          {isClient && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(property.id);
              }}
              className="ab-listing-card__wishlist"
              aria-pressed={wishlisted}
              aria-label={`Wishlist ${title}`}
            >
              <Heart aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="ab-listing-card__info">
          <div className="ab-listing-card__header">
            <h3 id={`ab-listing-title-${property.id}`} className="ab-listing-card__title">
              {title}
            </h3>
            {property.rating && property.reviewCount > 0 && (
              <span
                className="ab-listing-card__rating"
                aria-label={`Rating ${property.rating}`}
              >
                <Star aria-hidden="true" />
                {Number(property.rating).toFixed(2)}
              </span>
            )}
          </div>

          {location && <p className="ab-listing-card__location">{location}</p>}

          {property.bedrooms != null && (
            <p className="ab-listing-card__meta">
              {property.bedrooms} {property.bedrooms === 1 ? "bed" : "beds"}
              {property.area ? ` · ${property.area.toLocaleString()} sqft` : ""}
            </p>
          )}

          <p className="ab-listing-card__price">
            <span className="ab-listing-card__price-amount">
              ${price.toLocaleString()}
            </span>
            <span className="ab-listing-card__price-suffix">
              {" "}
              / {property.priceUnit || "night"}
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}
