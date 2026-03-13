import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';
import { getPropertyById } from '@/lib/data';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getPropertyDb();
    const row = await db.prepare("SELECT * FROM Property WHERE (slug=? OR id=?) AND status='PUBLISHED'").bind(params.slug, params.slug).first();
    if (row) return NextResponse.json({ property: toPublicProperty(row as never) });
  } catch {
    // D1 not available, fall through
  }
  
  // Fallback to mock data
  const mock = getPropertyById(params.slug);
  if (mock) {
    return NextResponse.json({ property: {
      id: mock.id,
      title: mock.title,
      titleZh: mock.titleZh || null,
      titleFr: mock.titleFr || null,
      slug: mock.id,
      address: mock.location,
      neighborhood: '',
      city: 'Toronto',
      bedrooms: mock.bedrooms,
      bathrooms: mock.bathrooms,
      sqft: mock.area,
      description: mock.description,
      descriptionZh: mock.descriptionZh || null,
      descriptionFr: mock.descriptionFr || null,
      priceMonthly: mock.priceUnit === 'night' ? Math.floor(mock.price * 30 * 0.8 / 100) * 100 : mock.price,
      currency: 'CAD',
      images: mock.images,
      includedAmenities: mock.amenities?.join(', ') || '',
      minStayDays: mock.minNights || 30,
      maxGuests: mock.maxGuests,
      featured: mock.featured,
      status: 'PUBLISHED',
    }});
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
