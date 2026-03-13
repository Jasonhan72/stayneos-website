export const PROPERTY_STATUS_OPTIONS = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'PAUSED',
  'ARCHIVED',
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  'APARTMENT',
  'CONDO',
  'TOWNHOUSE',
  'HOUSE',
  'LOFT',
  'STUDIO',
  'PENTHOUSE',
] as const;

export type PropertyStatusOption = (typeof PROPERTY_STATUS_OPTIONS)[number];
export type PropertyTypeOption = (typeof PROPERTY_TYPE_OPTIONS)[number];

export interface PropertyImageInput {
  url: string;
  alt: string;
  order: number;
}

export interface PropertyFormState {
  title: string;
  titleZh: string;
  titleFr: string;
  slug: string;
  status: PropertyStatusOption;
  address: string;
  neighborhood: string;
  city: string;
  latitude: string;
  longitude: string;
  propertyType: PropertyTypeOption;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  floor: string;
  facing: string;
  balconySqft: string;
  buildingYear: string;
  developer: string;
  description: string;
  descriptionZh: string;
  descriptionFr: string;
  priceMonthly: string;
  priceQuarterly: string;
  priceAnnual: string;
  currency: string;
  includedAmenitiesText: string;
  buildingAmenitiesText: string;
  nearestSubway: string;
  subwayWalkMinutes: string;
  nearbyLandmarksText: string;
  minStayDays: string;
  checkInTime: string;
  checkOutTime: string;
  selfCheckIn: boolean;
  imagesText: string;
  heroImage: string;
  idealForText: string;
  metaTitle: string;
  metaDescription: string;
}

export interface PropertyMutationInput {
  title: string;
  titleZh: string | null;
  titleFr: string | null;
  slug: string;
  status: PropertyStatusOption;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: PropertyTypeOption;
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
  currency: string;
  includedAmenities: string[];
  buildingAmenities: string[];
  nearestSubway: string | null;
  subwayWalkMinutes: number | null;
  nearbyLandmarks: string[];
  minStayDays: number;
  checkInTime: string;
  checkOutTime: string;
  selfCheckIn: boolean;
  images: PropertyImageInput[];
  heroImage: string | null;
  idealFor: string[];
  metaTitle: string | null;
  metaDescription: string | null;
}

type GenericRecord = Record<string, unknown>;

export const DEFAULT_PROPERTY_FORM: PropertyFormState = {
  title: '',
  titleZh: '',
  titleFr: '',
  slug: '',
  status: 'DRAFT',
  address: '',
  neighborhood: '',
  city: 'Toronto',
  latitude: '',
  longitude: '',
  propertyType: 'APARTMENT',
  bedrooms: '1',
  bathrooms: '1',
  sqft: '',
  floor: '',
  facing: '',
  balconySqft: '',
  buildingYear: '',
  developer: '',
  description: '',
  descriptionZh: '',
  descriptionFr: '',
  priceMonthly: '',
  priceQuarterly: '',
  priceAnnual: '',
  currency: 'CAD',
  includedAmenitiesText: '',
  buildingAmenitiesText: '',
  nearestSubway: '',
  subwayWalkMinutes: '',
  nearbyLandmarksText: '',
  minStayDays: '30',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  selfCheckIn: true,
  imagesText: '',
  heroImage: '',
  idealForText: '',
  metaTitle: '',
  metaDescription: '',
};

function stringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}`;
  return '';
}

function toNullableString(value: unknown): string | null {
  const normalized = stringValue(value).trim();
  return normalized || null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'n'].includes(normalized)) return false;
  }
  return fallback;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
          return item.name.trim();
        }
        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parseStringArray(parsed);
      }
    } catch {
      return trimmed
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseImageArray(value: unknown): PropertyImageInput[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === 'string') {
          const url = item.trim();
          return url ? { url, alt: '', order: index } : null;
        }
        if (item && typeof item === 'object') {
          const record = item as GenericRecord;
          const url = stringValue(record.url).trim();
          if (!url) return null;
          return {
            url,
            alt: stringValue(record.alt).trim(),
            order: toNumberOrNull(record.order) ?? index,
          };
        }
        return null;
      })
      .filter((item): item is PropertyImageInput => Boolean(item));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parseImageArray(parsed);
    } catch {
      return trimmed
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((url, index) => ({ url, alt: '', order: index }));
    }
  }

  return [];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildTextareaValue(items: string[]): string {
  return items.join(', ');
}

export function buildImagesTextarea(images: PropertyImageInput[]): string {
  return images.map((image) => image.url).join(', ');
}

export function normalizePropertyInput(input: GenericRecord): PropertyMutationInput {
  const images = parseImageArray(input.images ?? input.imagesText);
  const heroImage = toNullableString(input.heroImage) || images[0]?.url || null;

  return {
    title: stringValue(input.title).trim(),
    titleZh: toNullableString(input.titleZh),
    titleFr: toNullableString(input.titleFr),
    slug: stringValue(input.slug).trim(),
    status: PROPERTY_STATUS_OPTIONS.includes(stringValue(input.status) as PropertyStatusOption)
      ? (stringValue(input.status) as PropertyStatusOption)
      : 'DRAFT',
    address: stringValue(input.address).trim(),
    neighborhood: stringValue(input.neighborhood).trim(),
    city: stringValue(input.city).trim() || 'Toronto',
    latitude: toNumberOrNull(input.latitude),
    longitude: toNumberOrNull(input.longitude),
    propertyType: PROPERTY_TYPE_OPTIONS.includes(stringValue(input.propertyType) as PropertyTypeOption)
      ? (stringValue(input.propertyType) as PropertyTypeOption)
      : 'APARTMENT',
    bedrooms: toNumberOrNull(input.bedrooms) ?? 1,
    bathrooms: toNumberOrNull(input.bathrooms) ?? 1,
    sqft: toNumberOrNull(input.sqft),
    floor: toNumberOrNull(input.floor),
    facing: toNullableString(input.facing),
    balconySqft: toNumberOrNull(input.balconySqft),
    buildingYear: toNumberOrNull(input.buildingYear),
    developer: toNullableString(input.developer),
    description: toNullableString(input.description),
    descriptionZh: toNullableString(input.descriptionZh),
    descriptionFr: toNullableString(input.descriptionFr),
    priceMonthly: toNumberOrNull(input.priceMonthly),
    priceQuarterly: toNumberOrNull(input.priceQuarterly),
    priceAnnual: toNumberOrNull(input.priceAnnual),
    currency: stringValue(input.currency).trim() || 'CAD',
    includedAmenities: parseStringArray(input.includedAmenities ?? input.includedAmenitiesText),
    buildingAmenities: parseStringArray(input.buildingAmenities ?? input.buildingAmenitiesText),
    nearestSubway: toNullableString(input.nearestSubway),
    subwayWalkMinutes: toNumberOrNull(input.subwayWalkMinutes),
    nearbyLandmarks: parseStringArray(input.nearbyLandmarks ?? input.nearbyLandmarksText),
    minStayDays: toNumberOrNull(input.minStayDays) ?? 30,
    checkInTime: stringValue(input.checkInTime).trim() || '15:00',
    checkOutTime: stringValue(input.checkOutTime).trim() || '11:00',
    selfCheckIn: toBoolean(input.selfCheckIn, true),
    images,
    heroImage,
    idealFor: parseStringArray(input.idealFor ?? input.idealForText),
    metaTitle: toNullableString(input.metaTitle),
    metaDescription: toNullableString(input.metaDescription),
  };
}

export function toPropertyFormState(input?: GenericRecord | null): PropertyFormState {
  if (!input) return { ...DEFAULT_PROPERTY_FORM };

  const normalized = normalizePropertyInput(input);

  return {
    title: normalized.title,
    titleZh: normalized.titleZh || '',
    titleFr: normalized.titleFr || '',
    slug: normalized.slug,
    status: normalized.status,
    address: normalized.address,
    neighborhood: normalized.neighborhood,
    city: normalized.city,
    latitude: normalized.latitude === null ? '' : `${normalized.latitude}`,
    longitude: normalized.longitude === null ? '' : `${normalized.longitude}`,
    propertyType: normalized.propertyType,
    bedrooms: `${normalized.bedrooms}`,
    bathrooms: `${normalized.bathrooms}`,
    sqft: normalized.sqft === null ? '' : `${normalized.sqft}`,
    floor: normalized.floor === null ? '' : `${normalized.floor}`,
    facing: normalized.facing || '',
    balconySqft: normalized.balconySqft === null ? '' : `${normalized.balconySqft}`,
    buildingYear: normalized.buildingYear === null ? '' : `${normalized.buildingYear}`,
    developer: normalized.developer || '',
    description: normalized.description || '',
    descriptionZh: normalized.descriptionZh || '',
    descriptionFr: normalized.descriptionFr || '',
    priceMonthly: normalized.priceMonthly === null ? '' : `${normalized.priceMonthly}`,
    priceQuarterly: normalized.priceQuarterly === null ? '' : `${normalized.priceQuarterly}`,
    priceAnnual: normalized.priceAnnual === null ? '' : `${normalized.priceAnnual}`,
    currency: normalized.currency,
    includedAmenitiesText: buildTextareaValue(normalized.includedAmenities),
    buildingAmenitiesText: buildTextareaValue(normalized.buildingAmenities),
    nearestSubway: normalized.nearestSubway || '',
    subwayWalkMinutes: normalized.subwayWalkMinutes === null ? '' : `${normalized.subwayWalkMinutes}`,
    nearbyLandmarksText: buildTextareaValue(normalized.nearbyLandmarks),
    minStayDays: `${normalized.minStayDays}`,
    checkInTime: normalized.checkInTime,
    checkOutTime: normalized.checkOutTime,
    selfCheckIn: normalized.selfCheckIn,
    imagesText: buildImagesTextarea(normalized.images),
    heroImage: normalized.heroImage || '',
    idealForText: buildTextareaValue(normalized.idealFor),
    metaTitle: normalized.metaTitle || '',
    metaDescription: normalized.metaDescription || '',
  };
}
