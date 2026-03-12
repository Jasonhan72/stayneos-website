import { getDb } from '@/lib/d1';

export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PropertyRecord {
  id: string;
  title: string;
  titleZh: string | null;
  titleFr: string | null;
  slug: string;
  status: PropertyStatus;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  floor: number | null;
  facing: string | null;
  balconySqft: number | null;
  buildingYear: number | null;
  developer: string | null;
  description: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
  priceMonthly: number | null;
  priceQuarterly: number | null;
  priceAnnual: number | null;
  currency: string | null;
  includedAmenities: string | null;
  buildingAmenities: string | null;
  nearestSubway: string | null;
  subwayWalkMinutes: number | null;
  nearbyLandmarks: string | null;
  minStayDays: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  selfCheckIn: number | null;
  images: string | null;
  heroImage: string | null;
  idealFor: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseImages(value: string | null | undefined): Array<{ url: string; alt?: string; order?: number }> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toPublicProperty(property: PropertyRecord) {
  const images = parseImages(property.images);
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    titleZh: property.titleZh || undefined,
    titleFr: property.titleFr || undefined,
    location: `${property.address}, ${property.city}`,
    neighborhood: property.neighborhood,
    city: property.city,
    price: property.priceMonthly || 0,
    priceUnit: 'month',
    rating: 4.9,
    reviewCount: 0,
    images: images.map((img) => img.url).filter(Boolean),
    maxGuests: Math.max(1, (property.bedrooms || 1) * 2),
    area: property.sqft || 0,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: [...parseJsonArray(property.includedAmenities), ...parseJsonArray(property.buildingAmenities)],
    featured: property.status === 'PUBLISHED',
    description: property.description || '',
    descriptionZh: property.descriptionZh || undefined,
    descriptionFr: property.descriptionFr || undefined,
    minNights: property.minStayDays || 30,
    monthlyDiscount: 0,
    currency: property.currency || 'CAD',
    metaTitle: property.metaTitle,
    metaDescription: property.metaDescription,
    heroImage: property.heroImage || images[0]?.url || null,
    status: property.status,
    priceMonthly: property.priceMonthly,
    priceQuarterly: property.priceQuarterly,
    priceAnnual: property.priceAnnual,
    address: property.address,
    nearestSubway: property.nearestSubway,
    subwayWalkMinutes: property.subwayWalkMinutes,
    nearbyLandmarks: parseJsonArray(property.nearbyLandmarks),
    idealFor: parseJsonArray(property.idealFor),
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
  };
}

export function getPropertyDb() {
  return getDb();
}
