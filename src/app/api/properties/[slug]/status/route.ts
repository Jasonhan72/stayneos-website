import { NextResponse } from 'next/server';
import { getPropertyDb } from '@/lib/property-db';
import { verifyRequestAuth } from '@/lib/auth/admin-api';
import { validateCsrf } from '@/lib/security/csrf';

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });

    // Require authenticated user (HOST, ADMIN, or SUPER_ADMIN)
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Only allow toggling between PUBLISHED and PAUSED
    if (!['PUBLISHED', 'PAUSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PUBLISHED or PAUSED.' },
        { status: 400 }
      );
    }

    const db = getPropertyDb();

    // Check property exists
    const { slug } = await params;
    const existing = await db
      .prepare('SELECT id, status FROM Property WHERE slug = ? OR id = ?')
      .bind(slug, slug)
      .first();

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Verify ownership (ADMIN/SUPER_ADMIN can toggle any property)
    const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
    if (!adminRoles.includes(user.role)) {
      const existingRecord = existing as Record<string, unknown>;
      if (existingRecord.createdBy !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Update status
    await db
      .prepare('UPDATE Property SET status = ?, updatedAt = ? WHERE slug = ? OR id = ?')
      .bind(status, new Date().toISOString(), slug, slug)
      .run();

    const res = NextResponse.json({
      success: true,
      id: (existing as Record<string, unknown>).id,
      status,
    });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  } catch (error) {
    console.error('Failed to update property status:', error);
    return NextResponse.json(
      { error: 'Failed to update property status' },
      { status: 500 }
    );
  }
}
