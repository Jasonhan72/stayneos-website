import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/d1';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrf } from '@/lib/security/csrf';
import { apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface WishlistRow {
  propertyId: string;
  addedAt: string;
}

// GET /api/wishlist — return the user's saved properties.
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { results } = await db
      .prepare(
        'SELECT propertyId, addedAt FROM Wishlist WHERE userId = ? ORDER BY addedAt DESC'
      )
      .bind(currentUser.userId)
      .all<WishlistRow>();

    return NextResponse.json({
      wishlist: (results ?? []).map((r) => ({ id: r.propertyId, addedAt: r.addedAt })),
    });
  } catch (err) {
    console.error('wishlist:get', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist — add, remove, or toggle a property in the wishlist.
// Body: { propertyId: string; action?: 'add' | 'remove' | 'toggle' }
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
    });
  } catch (err) {
    console.error('wishlist:update', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
