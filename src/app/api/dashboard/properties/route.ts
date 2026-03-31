import { NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';
import { parseImages } from '@/lib/property-db';

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
    console.error('Failed to fetch dashboard properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
