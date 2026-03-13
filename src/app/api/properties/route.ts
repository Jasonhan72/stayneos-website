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
  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();
    const properties = (result.results || []).map((item) => toPublicProperty(item as never));
    if (properties.length > 0) {
      return NextResponse.json({ properties });
    }
    // D1 empty, fall back to mock data
    return NextResponse.json({ properties: mockProperties.map(mockToPublic) });
  } catch {
    // D1 not available, fall back to mock data
    return NextResponse.json({ properties: mockProperties.map(mockToPublic) });
  }
}
