import type { Locale } from "@/lib/i18n";

export const LISTING_TYPE_KEYS: Record<string, string> = {
  apartment: "host.listingWizard.types.apartment",
  studio: "host.listingWizard.types.studio",
  penthouse: "host.listingWizard.types.penthouse",
  condo: "host.listingWizard.types.condo",
  house: "host.listingWizard.types.house",
  townhouse: "host.listingWizard.types.townhouse",
};

export const AMENITY_TRANSLATION_KEYS: Record<string, string> = {
  "air conditioning": "host.listingWizard.amenities.airConditioning",
  balcony: "host.listingWizard.amenities.balcony",
  "bike room": "host.listingWizard.amenities.bikeRoom",
  concierge: "host.listingWizard.amenities.concierge",
  "children's playroom": "host.listingWizard.amenities.childrensPlayroom",
  dishwasher: "host.listingWizard.amenities.dishwasher",
  doorman: "host.listingWizard.amenities.doorman",
  dryer: "host.listingWizard.amenities.dryer",
  elevator: "host.listingWizard.amenities.elevator",
  gym: "host.listingWizard.amenities.gym",
  heating: "host.listingWizard.amenities.heating",
  kitchen: "host.listingWizard.amenities.kitchen",
  "laundry in building": "host.listingWizard.amenities.laundryInBuilding",
  "live-in super": "host.listingWizard.amenities.liveInSuper",
  "media room": "host.listingWizard.amenities.mediaRoom",
  "package room": "host.listingWizard.amenities.packageRoom",
  parking: "host.listingWizard.amenities.parking",
  "pet friendly": "host.listingWizard.amenities.petFriendly",
  pool: "host.listingWizard.amenities.pool",
  "roof deck": "host.listingWizard.amenities.roofDeck",
  "storage space": "host.listingWizard.amenities.storageSpace",
  "swimming pool": "host.listingWizard.amenities.swimmingPool",
  tv: "host.listingWizard.amenities.tv",
  washer: "host.listingWizard.amenities.washer",
  "washer/dryer": "host.listingWizard.amenities.washerDryer",
  "washer dryer": "host.listingWizard.amenities.washerDryer",
  wifi: "host.listingWizard.amenities.wifi",
};

export function normalizeAmenityName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function amenityTranslationKey(value: string) {
  return AMENITY_TRANSLATION_KEYS[normalizeAmenityName(value)];
}

export function listingStepTranslationKey(slug: string) {
  return `host.listingWizard.steps.${slug || "start"}`;
}

export function formatCountByLocale(
  locale: Locale,
  count: number,
  unit: "bedroom" | "bathroom" | "guest" | "day" | "month" | "year",
) {
  const n = Number.isFinite(count) ? count : 0;
  if (locale === "zh") {
    const zhUnits = {
      bedroom: "间卧室",
      bathroom: "间卫生间",
      guest: "位房客",
      day: "天",
      month: "个月",
      year: "年",
    };
    return `${n} ${zhUnits[unit]}`;
  }

  if (locale === "fr") {
    const frUnits = {
      bedroom: n > 1 ? "chambres" : "chambre",
      bathroom: n > 1 ? "salles de bain" : "salle de bain",
      guest: n > 1 ? "invités" : "invité",
      day: n > 1 ? "jours" : "jour",
      month: "mois",
      year: n > 1 ? "ans" : "an",
    };
    return `${n} ${frUnits[unit]}`;
  }

  const enUnits = {
    bedroom: n === 1 ? "bedroom" : "bedrooms",
    bathroom: n === 1 ? "bathroom" : "bathrooms",
    guest: n === 1 ? "guest" : "guests",
    day: n === 1 ? "day" : "days",
    month: n === 1 ? "month" : "months",
    year: n === 1 ? "year" : "years",
  };
  return `${n} ${enUnits[unit]}`;
}
