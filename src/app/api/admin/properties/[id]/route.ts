import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const db = getDb();
    const property = await db.prepare('SELECT * FROM Property WHERE id = ?').bind(params.id).first();
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const db = getDb();
    const body = await request.json();

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
      body.title, body.titleZh || null, body.titleFr || null, body.slug, body.status || 'DRAFT', body.address,
      body.neighborhood, body.city || 'Toronto', body.latitude || null, body.longitude || null,
      body.propertyType || 'APARTMENT', Number(body.bedrooms), Number(body.bathrooms), body.sqft || null,
      body.floor || null, body.facing || null, body.balconySqft || null, body.buildingYear || null,
      body.developer || null, body.description || null, body.descriptionZh || null, body.descriptionFr || null,
      body.priceMonthly || null, body.priceQuarterly || null, body.priceAnnual || null, body.currency || 'CAD',
      JSON.stringify(body.includedAmenities || []), JSON.stringify(body.buildingAmenities || []),
      body.nearestSubway || null, body.subwayWalkMinutes || null, JSON.stringify(body.nearbyLandmarks || []),
      body.minStayDays || 30, body.checkInTime || '15:00', body.checkOutTime || '11:00', body.selfCheckIn ? 1 : 0,
      JSON.stringify(body.images || []), body.heroImage || null, JSON.stringify(body.idealFor || []),
      body.metaTitle || null, body.metaDescription || null, params.id
    ).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const db = getDb();
    await db.prepare('DELETE FROM Property WHERE id = ?').bind(params.id).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
