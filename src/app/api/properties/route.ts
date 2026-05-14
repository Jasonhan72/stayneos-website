import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';
import { mockProperties } from '@/lib/data';
import type { PropertyListResponse } from '@/types/api/property';

function mockToPublic(p: typeof mockProperties[0]) {
  const price = p.priceUnit === 'night' ? Math.floor(p.price * 30 * 0.8 / 100) * 100 : p.price;
  return {
    id: p.id,
    title: p.title,
    titleZh: p.titleZh || undefined,
    titleFr: p.titleFr || undefined,
    slug: p.id,
    location: p.location,
    neighborhood: '',
    city: 'Toronto',
    price,
    priceUnit: 'month',
    rating: 0,
    reviewCount: 0,
    images: p.images,
    maxGuests: p.maxGuests,
    area: p.area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    amenities: p.amenities || [],
    featured: p.featured || false,
    description: p.description || '',
    descriptionZh: p.descriptionZh || undefined,
    descriptionFr: p.descriptionFr || undefined,
    minNights: p.minNights || 30,
    monthlyDiscount: 0,
    currency: 'CAD',
    priceMonthly: price,
    priceQuarterly: null,
    priceAnnual: null,
    status: 'PUBLISHED',
    address: p.location,
  };
}

export async function GET() {
  const headers = { 'Cache-Control': 'public, s-maxage=300' };

  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();
    const properties = (result.results || []).map((item) => toPublicProperty(item as never));
    return NextResponse.json({ properties } satisfies PropertyListResponse, { headers });
  } catch (error) {
    // D1 unavailable (build-time or local dev) → fall back to mock data
    const isD1Missing = error instanceof Error
      && error.message.includes("D1 database binding 'DB' not found");

    if (!isD1Missing) {
      throw error;
    }

    return NextResponse.json(
      { properties: mockProperties.map(mockToPublic) } satisfies PropertyListResponse,
      { headers }
    );
  }
}
