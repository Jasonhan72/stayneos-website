import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = getDb();
    const result = await db.prepare('SELECT id, name, email, role, createdAt FROM User ORDER BY createdAt DESC').all();
    return NextResponse.json({ users: result.results || [] });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
