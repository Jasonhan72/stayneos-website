/**
 * Property API 请求 / 响应类型契约
 */
export interface PropertyCardImage { url: string; isPrimary: boolean; }

export interface PropertyCard {
  id: string;
  title: string;
  titleZh?: string;
  titleFr?: string;
  slug: string;
  location: string;
  neighborhood: string;
  city: string;
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
  featured: boolean;
  description: string;
  descriptionZh?: string;
  descriptionFr?: string;
  minNights: number;
  monthlyDiscount: number;
  currency: string;
  priceMonthly?: number | null;
  priceQuarterly?: number | null;
  priceAnnual?: number | null;
  status?: string;
  address?: string;
  nearestSubway?: string | null;
  subwayWalkMinutes?: number | null;
  nearbyLandmarks?: string[];
  idealFor?: string[];
  checkInTime?: string | null;
  checkOutTime?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: string | null;
}

export interface PropertyListResponse { properties: PropertyCard[]; }
export interface PropertyDetailResponse {
  property: PropertyCard;
  bookedRanges: Array<{ start: string; end: string }>;
}
