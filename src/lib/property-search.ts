import { mockProperties } from '@/lib/data';

export type PropertyRecommendation = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
};

const STOP_WORDS = new Set([
  'a',
  'about',
  'an',
  'and',
  'apartment',
  'apartments',
  'find',
  'for',
  'in',
  'looking',
  'me',
  'month',
  'months',
  'need',
  'place',
  'show',
  'something',
  'that',
  'the',
  'this',
  'to',
  'with',
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getQueryTokens(query: string) {
  return normalizeText(query)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token && !STOP_WORDS.has(token));
}

function mapRecommendation(property: (typeof mockProperties)[number]): PropertyRecommendation {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
  };
}

export function searchProperties(query = '', bedrooms?: number, maxBudget?: number): PropertyRecommendation[] {
  const normalizedQuery = normalizeText(query);
  const queryTokens = getQueryTokens(query);

  return mockProperties
    .filter((property) => (bedrooms == null ? true : property.bedrooms >= bedrooms))
    .filter((property) => (maxBudget == null ? true : property.price <= maxBudget))
    .map((property) => {
      const haystack = normalizeText(
        `${property.title} ${property.location} ${property.description || ''} ${property.amenities?.join(' ') || ''}`
      );

      let score = 0;
      if (normalizedQuery && haystack.includes(normalizedQuery)) {
        score += normalizedQuery.length + 5;
      }

      queryTokens.forEach((token) => {
        if (haystack.includes(token)) {
          score += token.length > 4 ? 3 : 2;
        }
      });

      return { property, score };
    })
    .filter(({ score }) => !normalizedQuery || score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.property.featured !== right.property.featured) {
        return Number(right.property.featured) - Number(left.property.featured);
      }
      return left.property.price - right.property.price;
    })
    .slice(0, 5)
    .map(({ property }) => mapRecommendation(property));
}
