import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getPropertyDb();
    const row = await db.prepare("SELECT * FROM Property WHERE (slug=? OR id=?) AND status='PUBLISHED'").bind(params.slug, params.slug).first();
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ property: toPublicProperty(row as never) });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}
