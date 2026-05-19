import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';
import { parseImages } from '@/lib/property-db';
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const result = await db
      .prepare('SELECT * FROM Property ORDER BY updatedAt DESC')
      .all();

    const properties = (result.results || []).map((r: unknown) => {
      const row = r as Record<string, unknown>;
      const images = parseImages(row.images as string | null);
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        address: row.address,
        city: row.city || 'Toronto',
        neighborhood: row.neighborhood,
        basePrice: row.priceMonthly || 0,
        currency: row.currency || 'CAD',
        bedrooms: row.bedrooms || 0,
        bathrooms: row.bathrooms || 0,
        maxGuests: Math.max(1, ((row.bedrooms as number) || 1) * 2),
        status: (row.status as string || 'DRAFT').toLowerCase(),
        imageUrl: images[0]?.url || null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Failed to fetch host properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;

    const db = getDb();
    const id = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Build slug from title
    const title = String(body.title || 'Untitled Property');
    const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${rawSlug}-${id.slice(-6)}`;

    // Amenities: merge includedAmenities + buildingAmenities from amenities array
    const amenities: string[] = Array.isArray(body.amenities) ? body.amenities as string[] : [];
    const buildingAmenities = ['Gym', 'Pool', 'Concierge', 'Elevator', 'Parking'];
    const included = amenities.filter((a) => !buildingAmenities.includes(a));
    const building = amenities.filter((a) => buildingAmenities.includes(a));

    // Images: strip base64 data URIs (too large for DB); store URLs only
    const photos: string[] = Array.isArray(body.photos) ? body.photos as string[] : [];
    const imageUrls = photos.filter((p) => p.startsWith('http'));
    const imagesJson = JSON.stringify(imageUrls.map((url) => ({ url, alt: title })));

    const location = (body.location || {}) as Record<string, unknown>;
    const basics = (body.basics || {}) as Record<string, unknown>;
    const pricing = (body.pricing || {}) as Record<string, unknown>;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO Property
        (id, title, slug, status, address, neighborhood, city, propertyType,
         bedrooms, bathrooms, sqft, description, priceMonthly, priceQuarterly,
         priceAnnual, currency, includedAmenities, buildingAmenities,
         minStayDays, images, heroImage, checkInTime, checkOutTime,
         selfCheckIn, createdAt, updatedAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      id, title, slug, 'DRAFT',
      String(location.address || ''),
      String(location.neighborhood || ''),
      String(location.city || 'Toronto'),
      String(body.type || 'apartment'),
      Number(basics.bedrooms) || 0,
      Number(basics.bathrooms) || 0,
      Number(basics.sqft) || null,
      String(body.description || ''),
      Number(pricing.priceMonthly) || 0,
      Number(pricing.priceQuarterly) || null,
      Number(pricing.priceAnnual) || null,
      'CAD',
      JSON.stringify(included),
      JSON.stringify(building),
      Number(pricing.minStayDays) || 30,
      imagesJson,
      imageUrls[0] || null,
      '15:00', '11:00', 1,
      now, now,
    ).run();

    return NextResponse.json({ id, slug, status: 'draft' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
