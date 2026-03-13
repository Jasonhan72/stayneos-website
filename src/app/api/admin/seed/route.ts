import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';
import { mockProperties } from '@/lib/data';
import { slugify } from '@/lib/admin/property';

const INCLUDED_AMENITIES = new Set([
  'WiFi',
  'Utilities included',
  'Bi-weekly housekeeping',
  'Smart lock self check-in',
]);

function extractNeighborhood(title: string): string {
  const match = title.match(/\(([^)]+)\)/);
  return match?.[1]?.trim() || 'Downtown';
}

function splitAmenities(amenities: string[]) {
  const includedAmenities = amenities.filter((item) => INCLUDED_AMENITIES.has(item));
  const buildingAmenities = amenities.filter((item) => !INCLUDED_AMENITIES.has(item));
  return { includedAmenities, buildingAmenities };
}

function buildMetaDescription(description?: string): string | null {
  if (!description) return null;
  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin(request);
    const db = getDb();

    for (const property of mockProperties) {
      const { includedAmenities, buildingAmenities } = splitAmenities(property.amenities || []);
      const address = property.location;
      const neighborhood = extractNeighborhood(property.title);
      const heroImage = property.images[0] || null;
      const images = property.images.map((url, index) => ({ url, alt: property.title, order: index }));
      const metaTitle = `${property.title} | StayNeos`;
      const metaDescription = buildMetaDescription(property.description);

      await db.prepare(`
        INSERT INTO Property (
          id, title, titleZh, titleFr, slug, status, address, neighborhood, city, latitude, longitude,
          propertyType, bedrooms, bathrooms, sqft, floor, facing, balconySqft, buildingYear, developer,
          description, descriptionZh, descriptionFr, priceMonthly, priceQuarterly, priceAnnual, currency,
          includedAmenities, buildingAmenities, nearestSubway, subwayWalkMinutes, nearbyLandmarks,
          minStayDays, checkInTime, checkOutTime, selfCheckIn, images, heroImage, idealFor,
          metaTitle, metaDescription, createdAt, updatedAt, createdBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title,
          titleZh=excluded.titleZh,
          titleFr=excluded.titleFr,
          slug=excluded.slug,
          status=excluded.status,
          address=excluded.address,
          neighborhood=excluded.neighborhood,
          city=excluded.city,
          propertyType=excluded.propertyType,
          bedrooms=excluded.bedrooms,
          bathrooms=excluded.bathrooms,
          sqft=excluded.sqft,
          description=excluded.description,
          descriptionZh=excluded.descriptionZh,
          descriptionFr=excluded.descriptionFr,
          priceMonthly=excluded.priceMonthly,
          currency=excluded.currency,
          includedAmenities=excluded.includedAmenities,
          buildingAmenities=excluded.buildingAmenities,
          minStayDays=excluded.minStayDays,
          selfCheckIn=excluded.selfCheckIn,
          images=excluded.images,
          heroImage=excluded.heroImage,
          metaTitle=excluded.metaTitle,
          metaDescription=excluded.metaDescription,
          updatedAt=datetime('now')
      `).bind(
        property.id,
        property.title,
        property.titleZh || null,
        property.titleFr || null,
        slugify(property.title),
        'PUBLISHED',
        address,
        neighborhood,
        'Toronto',
        null,
        null,
        'APARTMENT',
        property.bedrooms,
        property.bathrooms,
        property.area || null,
        null,
        null,
        null,
        null,
        null,
        property.description || null,
        property.descriptionZh || null,
        property.descriptionFr || null,
        property.price || null,
        null,
        null,
        'CAD',
        JSON.stringify(includedAmenities),
        JSON.stringify(buildingAmenities),
        null,
        null,
        JSON.stringify([]),
        property.minNights || 30,
        '15:00',
        '11:00',
        1,
        JSON.stringify(images),
        heroImage,
        JSON.stringify([]),
        metaTitle,
        metaDescription,
        user.userId,
      ).run();
    }

    return NextResponse.json({ success: true, count: mockProperties.length });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Seed 失败' }, { status: 500 });
  }
}
