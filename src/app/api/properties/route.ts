import { NextResponse } from 'next/server';
import { getPropertyDb, toPublicProperty } from '@/lib/property-db';

export async function GET() {
  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();
    const properties = (result.results || []).map((item) => toPublicProperty(item as never));
    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
