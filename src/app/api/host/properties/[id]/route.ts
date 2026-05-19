import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';
import { normalizePropertyInput, toPropertyFormState, slugify } from '@/lib/admin/property';
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { id } = await params;
    const property = await db
      .prepare('SELECT * FROM Property WHERE id = ?')
      .bind(id)
      .first();

    if (!property) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { id } = await params;
    const existing = await db.prepare('SELECT * FROM Property WHERE id = ?').bind(id).first<Record<string, unknown>>();
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const incoming = await request.json() as Record<string, unknown>;
    const mergedBody = {
      ...toPropertyFormState(existing),
      ...existing,
      ...incoming,
      slug: typeof incoming.slug === 'string' ? incoming.slug : (typeof existing.slug === 'string' ? existing.slug : ''),
    };
    const body = normalizePropertyInput(mergedBody);
    const slug = body.slug || slugify(body.title);

    await db.prepare(`
      UPDATE Property SET
        title=?, titleZh=?, titleFr=?, slug=?, status=?, address=?, neighborhood=?, city=?, latitude=?, longitude=?,
        propertyType=?, bedrooms=?, bathrooms=?, sqft=?, floor=?, facing=?, balconySqft=?, buildingYear=?, developer=?,
        description=?, descriptionZh=?, descriptionFr=?, priceMonthly=?, priceQuarterly=?, priceAnnual=?, currency=?,
        includedAmenities=?, buildingAmenities=?, nearestSubway=?, subwayWalkMinutes=?, nearbyLandmarks=?,
        minStayDays=?, checkInTime=?, checkOutTime=?, selfCheckIn=?, images=?, heroImage=?, idealFor=?,
        metaTitle=?, metaDescription=?, updatedAt=datetime('now')
      WHERE id=?
    `).bind(
      body.title, body.titleZh, body.titleFr, slug, body.status, body.address,
      body.neighborhood, body.city, body.latitude, body.longitude,
      body.propertyType, body.bedrooms, body.bathrooms, body.sqft,
      body.floor, body.facing, body.balconySqft, body.buildingYear,
      body.developer, body.description, body.descriptionZh, body.descriptionFr,
      body.priceMonthly, body.priceQuarterly, body.priceAnnual, body.currency,
      JSON.stringify(body.includedAmenities), JSON.stringify(body.buildingAmenities),
      body.nearestSubway, body.subwayWalkMinutes, JSON.stringify(body.nearbyLandmarks),
      body.minStayDays, body.checkInTime, body.checkOutTime, body.selfCheckIn ? 1 : 0,
      JSON.stringify(body.images), body.heroImage, JSON.stringify(body.idealFor),
      body.metaTitle, body.metaDescription, id
    ).run();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}
