import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/d1';

// GET /api/market-posts — list posts with pagination
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12')));
    const category = url.searchParams.get('category');
    const offset = (page - 1) * limit;

    let query = "SELECT id, title, titleZh, titleFr, slug, summary, summaryZh, summaryFr, category, tags, source, coverImage, authorName, viewCount, publishedAt, createdAt FROM MarketPost WHERE status = 'PUBLISHED'";
    const params: string[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY publishedAt DESC LIMIT ? OFFSET ?";
    params.push(String(limit), String(offset));

    const result = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM MarketPost WHERE status = 'PUBLISHED'";
    const countParams: string[] = [];
    if (category) {
      countQuery += " AND category = ?";
      countParams.push(category);
    }
    const countResult = await db.prepare(countQuery).bind(...countParams).first<{ total: number }>();
    const total = countResult?.total || 0;

    return NextResponse.json({
      posts: result.results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    });
  } catch (error) {
    console.error('Market posts list error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/market-posts — create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    // Simple admin auth via API key
    const authHeader = request.headers.get('x-admin-key');
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, titleZh, titleFr, summary, summaryZh, summaryFr, content, contentZh, contentFr, category, tags, source, sourceUrl, coverImage, authorName, publishedAt } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const id = `mp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const slug = (title as string)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)
      + '-' + id.substring(3, 10);

    const db = getDb();
    await db.prepare(`
      INSERT INTO MarketPost (id, title, titleZh, titleFr, slug, summary, summaryZh, summaryFr, content, contentZh, contentFr, category, tags, source, sourceUrl, coverImage, authorName, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      title,
      titleZh || null,
      titleFr || null,
      slug,
      summary || null,
      summaryZh || null,
      summaryFr || null,
      content,
      contentZh || null,
      contentFr || null,
      category || 'market-report',
      tags ? JSON.stringify(tags) : null,
      source || null,
      sourceUrl || null,
      coverImage || null,
      authorName || 'NEOS Research',
      publishedAt || new Date().toISOString()
    ).run();

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error('Create market post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
