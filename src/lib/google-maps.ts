export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function hasUsableGoogleMapsKey(key = GOOGLE_MAPS_API_KEY) {
  const normalized = key.trim();

  return Boolean(
    normalized &&
      normalized.length >= 20 &&
      !/^your[-_]/i.test(normalized) &&
      !normalized.toLowerCase().includes('placeholder') &&
      normalized.toLowerCase() !== 'undefined' &&
      normalized.toLowerCase() !== 'null'
  );
}

export function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
