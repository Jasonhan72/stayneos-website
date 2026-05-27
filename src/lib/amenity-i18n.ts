/**
 * Amenity i18n normalization.
 *
 * DB stores raw amenity names (e.g. "WiFi", "24h concierge"), but the t()
 * lookup is case-sensitive. This utility provides a case-insensitive
 * fallback chain so amenities always resolve to translated labels.
 */

// Map of known DB amenity name → canonical translation key
const NORMALIZE_MAP: Record<string, string> = {
  // DB name → exact key in messages
  wifi: "WiFi",
  "utilities included": "Utilities included",
  "bi-weekly housekeeping": "Bi-weekly housekeeping",
  "smart lock self check-in": "Smart lock self check-in",
  pool: "Pool",
  gym: "Gym",
  "24h concierge": "24h concierge",
  "24-hour concierge": "24-hour concierge",
  "party room": "Party room",
  "lobby concierge": "Lobby concierge",
  "mail room": "Mail room",
  "full kitchen": "Full kitchen",
  "air conditioning": "Air conditioning",
  dishwasher: "Dishwasher",
  elevator: "Elevator",
  balcony: "Balcony",
  "bbq area": "BBQ area",
  "rooftop terrace": "Rooftop terrace",
  "storage locker": "Storage locker",
  "storage space": "Storage locker",
  "fitness center": "Fitness center",
  parking: "Parking",
  "pet friendly": "Pet friendly",
  tv: "TV",
  microwave: "Microwave",
  workspace: "Workspace",
  washer: "Washer",
  dryer: "Dryer",
  "in-suite laundry": "In-suite laundry",
  kitchen: "Kitchen",
  heating: "Heating",
  doorman: "Doorman",
  "bike room": "Bike room",
  "children's playroom": "Children's playroom",
  "laundry in building": "Laundry in building",
  "live-in super": "Live-in super",
  "media room": "Media room",
  "package room": "Package room",
  "roof deck": "Roof deck",
  "swimming pool": "Swimming pool",
  "washer/dryer": "Washer/Dryer",
  "washer dryer": "Washer/Dryer",
};

export function normalizeAmenityForI18n(raw: string): string {
  const normalized = raw.trim().toLowerCase().replace(/\\s+/g, " ");
  return NORMALIZE_MAP[normalized] || raw;
}

/**
 * Returns the translated amenity name.
 * Usage: t(`amenities.${normalizeAmenityForI18n(item)}`, item)
 */
export function amenityI18nKey(raw: string): string {
  return `amenities.${normalizeAmenityForI18n(raw)}`;
}
