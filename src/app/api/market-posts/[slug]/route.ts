import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/d1';

// GET /api/market-posts/[slug] — get single post
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    const post = await db
      .prepare("SELECT * FROM MarketPost WHERE slug = ? AND status = 'PUBLISHED'")
      .bind(slug)
      .first();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count (fire and forget)
    db.prepare("UPDATE MarketPost SET viewCount = viewCount + 1 WHERE slug = ?")
      .bind(slug)
      .run()
      .catch(() => {});

    return NextResponse.json(post, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' }
    });
  } catch (error) {
    console.error('Get market post error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
