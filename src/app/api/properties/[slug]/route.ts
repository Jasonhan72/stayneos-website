import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';
import { getPropertyById } from '@/lib/data';
import { getDb } from '@/lib/d1';

interface BookedRange {
  start: string;
  end: string;
}

function toDateKey(value: string | number | Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mergeRanges(ranges: BookedRange[]) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  const merged: BookedRange[] = [];

  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...range });
      continue;
    }

    const previousEnd = new Date(`${previous.end}T00:00:00`);
    const currentStart = new Date(`${range.start}T00:00:00`);

    if (currentStart <= previousEnd) {
      if (range.end > previous.end) previous.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function mockBookedRanges(): BookedRange[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  return [{ start: toDateKey(start), end: toDateKey(end) }];
}

async function getBookedRanges(propertyIdOrSlug: string): Promise<BookedRange[]> {
  try {
    const db = getDb();
    const property = await db
      .prepare('SELECT id, slug FROM Property WHERE id = ? OR slug = ? LIMIT 1')
      .bind(propertyIdOrSlug, propertyIdOrSlug)
      .first<{ id: string; slug: string }>();

    if (!property) return mockBookedRanges();

    const result = await db
      .prepare(`
        SELECT checkIn, checkOut
        FROM Booking
        WHERE propertyId = ?
          AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        ORDER BY checkIn ASC
      `)
      .bind(property.id)
      .all<{ checkIn: string; checkOut: string }>();

    const bookedRanges = mergeRanges(
      (result.results || []).map((row) => ({
        start: toDateKey(row.checkIn),
        end: toDateKey(row.checkOut),
      }))
    );

    return bookedRanges.length > 0 ? bookedRanges : mockBookedRanges();
  } catch {
    return mockBookedRanges();
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bookedRanges = await getBookedRanges(slug);

  try {
    const db = getPropertyDb();
    const row = await db.prepare("SELECT * FROM Property WHERE (slug=? OR id=?) AND status='PUBLISHED'").bind(slug, slug).first();
    if (row) return NextResponse.json({ property: toPublicProperty(row as never), bookedRanges });
  } catch {
    // D1 not available, fall through
  }
  
  // Fallback to mock data
  const mock = getPropertyById(slug);
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
      priceUnit: mock.priceUnit === 'night' ? 'night' : 'month',
      defaultStayType: mock.priceUnit === 'night' ? 'NIGHTLY' : 'MONTHLY',
      nightlyRate: mock.priceUnit === 'night' ? mock.price : undefined,
      monthlyRate: mock.priceUnit === 'night' ? Math.floor(mock.price * 30 * 0.8 / 100) * 100 : mock.price,
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
    }, bookedRanges });
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
