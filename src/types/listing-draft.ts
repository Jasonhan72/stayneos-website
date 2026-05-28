export interface ListingDraftLocation {
  address: string;
  city: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
}

export interface ListingDraftBasics {
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  maxGuests?: number;
  floor?: number;
}

export interface ListingDraftPricing {
  priceMonthly: number;
  priceQuarterly?: number;
  priceAnnual?: number;
  minStayDays: number;
}

export interface ListingDraftAvailability {
  availableFrom?: string;
}

export interface ListingDraft {
  draftId?: string;
  step: number; // 当前完成到第几步
  type?: string; // 房源类型 (apartment / studio / penthouse / condo / house / townhouse)
  location?: ListingDraftLocation;
  basics?: ListingDraftBasics;
  amenities?: string[];
  photos?: string[]; // 已上传图片 URL
  importedImages?: string[]; // 从导入源拿到的参考图（不直接使用）
  title?: string;
  titleZh?: string;
  description?: string;
  descriptionZh?: string;
  descriptionFr?: string;
  pricing?: ListingDraftPricing;
  availability?: ListingDraftAvailability;
  importSource?: 'url' | 'pdf' | 'manual';
  importUrl?: string;
}

export const EMPTY_DRAFT: ListingDraft = { step: 0 };

export const DRAFT_STORAGE_KEY = 'stayneos_listing_draft';

export const WIZARD_STEPS: { slug: string; label: string }[] = [
  { slug: '', label: 'Start' },
  { slug: 'type', label: 'Type' },
  { slug: 'location', label: 'Location' },
  { slug: 'basics', label: 'Basics' },
  { slug: 'amenities', label: 'Amenities' },
  { slug: 'photos', label: 'Photos' },
  { slug: 'details', label: 'Title & Description' },
  { slug: 'pricing', label: 'Pricing' },
  { slug: 'review', label: 'Review & Publish' },
];

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length - 1; // exclude step 0 (start) from progress count
