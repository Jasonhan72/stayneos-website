import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/d1';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrf } from '@/lib/security/csrf';
import { apiError } from '@/lib/api/response';
import type { WishlistGetResponse, WishlistPostResponse, WishlistProperty } from '@/types/api/wishlist';

export const dynamic = 'force-dynamic';

interface WishlistRow {
  propertyId: string;
  addedAt: string;
}

// GET /api/wishlist — return the user's saved properties with full property data.
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // 1. Get wishlist rows
    const { results } = await db
      .prepare(
        'SELECT propertyId, addedAt FROM Wishlist WHERE userId = ? ORDER BY addedAt DESC'
      )
      .bind(currentUser.userId)
      .all<WishlistRow>();

    const wishlist = (results ?? []).map((r) => ({ id: r.propertyId, addedAt: r.addedAt }));

    if (wishlist.length === 0) {
      return NextResponse.json({ properties: [], wishlist: [], } satisfies WishlistGetResponse);
    }

    // 2. Fetch all property data in one query using IN clause
    const propertyIds = wishlist.map((w) => w.id);
    const placeholders = propertyIds.map(() => '?').join(',');

    const { results: propertyRows } = await db
      .prepare(
        `SELECT * FROM Property WHERE id IN (${placeholders})`
      )
      .bind(...propertyIds)
      .all();

    // 3. Fetch images for those properties
    const { results: imageRows } = await db
      .prepare(
        `SELECT * FROM PropertyImage WHERE propertyId IN (${placeholders}) ORDER BY "order" ASC`
      )
      .bind(...propertyIds)
      .all();

    // Index images by propertyId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagesByProperty: Record<string, Array<{ url: string; isPrimary: boolean }>> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const img of (imageRows ?? []) as any[]) {
      if (!imagesByProperty[img.propertyId]) imagesByProperty[img.propertyId] = [];
      imagesByProperty[img.propertyId].push({
        url: img.url,
        isPrimary: img.isPrimary === 1,
      });
    }

    // 4. Aggregate review counts and average ratings from Review table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewAgg: Record<string, { reviewCount: number; averageRating: number }> = {};
    try {
      const { results: reviewRows } = await db
        .prepare(
          `SELECT propertyId, COUNT(*) as reviewCount, AVG(rating) as averageRating
           FROM Review
           WHERE propertyId IN (${placeholders})
           GROUP BY propertyId`
        )
        .bind(...propertyIds)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .all<{ propertyId: string; reviewCount: number; averageRating: number }>();

      for (const r of (reviewRows ?? [])) {
        reviewAgg[r.propertyId] = {
          reviewCount: Number(r.reviewCount) || 0,
          averageRating: Number(Number(r.averageRating).toFixed(1)) || 0,
        };
      }
    } catch {
      // Review table may not exist yet in some environments; fall back gracefully
      console.warn('wishlist:get - Review table unavailable, using defaults');
    }

    // 5. Map to public property shape (matches what the frontend expects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties = (propertyRows ?? []).map((row: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = row as Record<string, any>;
      const imgs = imagesByProperty[p.id as string] ?? [];
      const priceMonthly = (p.priceMonthly ?? p.basePrice ?? 0) as number;
      const currency = (p.currency ?? 'CAD') as string;

      const agg = reviewAgg[p.id as string] ?? { reviewCount: 0, averageRating: 0 };

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        address: p.address,
        city: p.city,
        neighborhood: p.neighborhood ?? '',
        priceMonthly,
        basePrice: (p.basePrice ?? 0) as number,
        currency,
        bedrooms: (p.bedrooms ?? 0) as number,
        bathrooms: (p.bathrooms ?? 0) as number,
        reviewCount: agg.reviewCount,
        averageRating: agg.averageRating,
        images: imgs.map((img) => ({
          url: (img.url as string).startsWith('http') || (img.url as string).startsWith('/')
            ? img.url
            : `/${img.url}`,
          isPrimary: img.isPrimary,
        })),
      } as WishlistProperty;
    });

    return NextResponse.json({ properties, wishlist, } satisfies WishlistGetResponse);
  } catch (err) {
    console.error('wishlist:get', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist — add, remove, or toggle a property in the wishlist.
export async function POST(request: NextRequest) {
  try {
    const rate = checkRateLimit(request, 'wishlist:update', { limit: 30, windowMs: 60_000 });
    if (!rate.allowed) return apiError('Too many wishlist updates', 429, 'RATE_LIMITED');

    if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');

    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      propertyId?: unknown;
      action?: unknown;
    };
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : '';
    const action =
      body.action === 'add' || body.action === 'remove' || body.action === 'toggle'
        ? body.action
        : 'toggle';

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }
    if (propertyId.length > 128) {
      return NextResponse.json({ error: 'Property ID is too long' }, { status: 400 });
    }

    const db = getDb();

    let resolvedAction: 'added' | 'removed';

    if (action === 'add') {
      await db
        .prepare(
          'INSERT OR IGNORE INTO Wishlist (userId, propertyId) VALUES (?, ?)'
        )
        .bind(currentUser.userId, propertyId)
        .run();
      resolvedAction = 'added';
    } else if (action === 'remove') {
      await db
        .prepare('DELETE FROM Wishlist WHERE userId = ? AND propertyId = ?')
        .bind(currentUser.userId, propertyId)
        .run();
      resolvedAction = 'removed';
    } else {
      // toggle: one round-trip check, then mutate
      const existing = await db
        .prepare('SELECT 1 AS present FROM Wishlist WHERE userId = ? AND propertyId = ? LIMIT 1')
        .bind(currentUser.userId, propertyId)
        .first<{ present: number }>();

      if (existing) {
        await db
          .prepare('DELETE FROM Wishlist WHERE userId = ? AND propertyId = ?')
          .bind(currentUser.userId, propertyId)
          .run();
        resolvedAction = 'removed';
      } else {
        await db
          .prepare(
            'INSERT OR IGNORE INTO Wishlist (userId, propertyId) VALUES (?, ?)'
          )
          .bind(currentUser.userId, propertyId)
          .run();
        resolvedAction = 'added';
      }
    }

    return NextResponse.json({
      success: true,
      action: resolvedAction,
      propertyId,
    } satisfies WishlistPostResponse);
  } catch (err) {
    console.error('wishlist:update', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
