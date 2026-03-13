import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';
import { normalizePropertyInput, slugify } from '@/lib/admin/property';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    const where: string[] = [];
    const binds: (string | number | null)[] = [];
    if (status && status !== 'ALL') {
      where.push('status = ?');
      binds.push(status);
    }
    if (q) {
      where.push('(title LIKE ? OR address LIKE ? OR neighborhood LIKE ?)');
      const like = `%${q}%`;
      binds.push(like, like, like);
    }

    const sql = `SELECT * FROM Property ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY createdAt DESC`;
    const result = await db.prepare(sql).bind(...binds).all();

    return NextResponse.json({ properties: result.results || [] });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request);
    const db = getDb();
    const body = normalizePropertyInput(await request.json());

    if (!body.title || !body.address || !body.neighborhood || !body.bedrooms || !body.bathrooms) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const slug = body.slug || slugify(body.title);

    await db.prepare(`
      INSERT INTO Property (
        id, title, titleZh, titleFr, slug, status, address, neighborhood, city, latitude, longitude,
        propertyType, bedrooms, bathrooms, sqft, floor, facing, balconySqft, buildingYear, developer,
        description, descriptionZh, descriptionFr, priceMonthly, priceQuarterly, priceAnnual, currency,
        includedAmenities, buildingAmenities, nearestSubway, subwayWalkMinutes, nearbyLandmarks,
        minStayDays, checkInTime, checkOutTime, selfCheckIn, images, heroImage, idealFor,
        metaTitle, metaDescription, createdAt, updatedAt, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `).bind(
      id, body.title, body.titleZh, body.titleFr, slug, body.status, body.address,
      body.neighborhood, body.city, body.latitude, body.longitude,
      body.propertyType, body.bedrooms, body.bathrooms, body.sqft,
      body.floor, body.facing, body.balconySqft, body.buildingYear,
      body.developer, body.description, body.descriptionZh, body.descriptionFr,
      body.priceMonthly, body.priceQuarterly, body.priceAnnual, body.currency,
      JSON.stringify(body.includedAmenities), JSON.stringify(body.buildingAmenities),
      body.nearestSubway, body.subwayWalkMinutes, JSON.stringify(body.nearbyLandmarks),
      body.minStayDays, body.checkInTime, body.checkOutTime,
      body.selfCheckIn ? 1 : 0, JSON.stringify(body.images), body.heroImage,
      JSON.stringify(body.idealFor), body.metaTitle, body.metaDescription, user.userId
    ).run();

    return NextResponse.json({ success: true, id, slug }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
