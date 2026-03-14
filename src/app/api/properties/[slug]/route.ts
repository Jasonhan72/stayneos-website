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
      slug: mock.id,
      title: mock.title,
      titleZh: mock.titleZh || undefined,
      titleFr: mock.titleFr || undefined,
      location: mock.location,
      neighborhood: '',
      city: 'Toronto',
      price: mock.priceUnit === 'night' ? Math.floor(mock.price * 30 * 0.8 / 100) * 100 : mock.price,
      priceUnit: 'month',
      rating: mock.reviewCount > 0 ? mock.rating : 0,
      reviewCount: mock.reviewCount || 0,
      images: mock.images,
      maxGuests: mock.maxGuests,
      area: mock.area,
      bedrooms: mock.bedrooms,
      bathrooms: mock.bathrooms,
      amenities: mock.amenities || [],
      featured: mock.featured,
      description: mock.description || '',
      descriptionZh: mock.descriptionZh || undefined,
      descriptionFr: mock.descriptionFr || undefined,
      minNights: mock.minNights || 30,
      monthlyDiscount: mock.monthlyDiscount || 0,
      currency: 'CAD',
    }});
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
