import { NextResponse } from 'next/server';
import { getPropertyDb } from '@/lib/property-db';

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  try {
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
    const existing = await db
      .prepare('SELECT id, status FROM Property WHERE slug = ? OR id = ?')
      .bind(params.slug, params.slug)
      .first();

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update status
    await db
      .prepare('UPDATE Property SET status = ?, updatedAt = ? WHERE slug = ? OR id = ?')
      .bind(status, new Date().toISOString(), params.slug, params.slug)
      .run();

    return NextResponse.json({
      success: true,
      id: (existing as Record<string, unknown>).id,
      status,
    });
  } catch (error) {
    console.error('Failed to update property status:', error);
    return NextResponse.json(
      { error: 'Failed to update property status' },
      { status: 500 }
    );
  }
}
