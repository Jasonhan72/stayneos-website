import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';
import { mockProperties } from '@/lib/data';

function mockToPublic(p: typeof mockProperties[0]) {
  return {
    id: p.id,
    title: p.title,
    titleZh: p.titleZh || null,
    titleFr: p.titleFr || null,
    slug: p.id,
    address: p.location,
    neighborhood: '',
    city: 'Toronto',
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    sqft: p.area,
    description: p.description,
    descriptionZh: p.descriptionZh || null,
    descriptionFr: p.descriptionFr || null,
    priceMonthly: p.priceUnit === 'night' ? Math.floor(p.price * 30 * 0.8 / 100) * 100 : p.price,
    priceQuarterly: null,
    priceAnnual: null,
    currency: 'CAD',
    images: p.images,
    includedAmenities: p.amenities?.join(', ') || '',
    buildingAmenities: '',
    minStayDays: p.minNights || 30,
    maxGuests: p.maxGuests,
    featured: p.featured,
    status: 'PUBLISHED',
  };
}

export async function GET() {
  const headers = { 'Cache-Control': 'public, s-maxage=300' };

  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();
    const properties = (result.results || []).map((item) => toPublicProperty(item as never));
    return NextResponse.json({ properties }, { headers });
  } catch (error) {
    // D1 unavailable (build-time or local dev) → fall back to mock data
    const isD1Missing = error instanceof Error
      && error.message.includes("D1 database binding 'DB' not found");

    if (!isD1Missing) {
      throw error;
    }

    return NextResponse.json(
      { properties: mockProperties.map(mockToPublic) },
      { headers }
    );
  }
}
