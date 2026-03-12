import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';
import { getDb } from '@/lib/d1';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = getDb();

    const [totalRes, publishedRes, draftRes, monthInquiriesRes, usersRes, recentInquiries] = await Promise.all([
      db.prepare(`SELECT COUNT(*) as count FROM Property`).first<{ count: number }>(),
      db.prepare(`SELECT COUNT(*) as count FROM Property WHERE status='PUBLISHED'`).first<{ count: number }>(),
      db.prepare(`SELECT COUNT(*) as count FROM Property WHERE status='DRAFT'`).first<{ count: number }>(),
      db.prepare(`SELECT COUNT(*) as count FROM Inquiry WHERE createdAt >= datetime('now', 'start of month')`).first<{ count: number }>(),
      db.prepare(`SELECT COUNT(*) as count FROM User`).first<{ count: number }>(),
      db.prepare(`SELECT id,name,email,type,status,createdAt FROM Inquiry ORDER BY createdAt DESC LIMIT 5`).all(),
    ]);

    return NextResponse.json({
      totalProperties: totalRes?.count || 0,
      publishedProperties: publishedRes?.count || 0,
      draftProperties: draftRes?.count || 0,
      monthlyInquiries: monthInquiriesRes?.count || 0,
      totalUsers: usersRes?.count || 0,
      recentInquiries: recentInquiries.results || [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
