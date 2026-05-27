import { NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security/csrf';
import { performWebSearch } from '@/lib/web-search';

export async function POST(request: Request) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const body = (await request.json()) as { query?: string };
    const query = body?.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const text = await performWebSearch(query, 5);

    return NextResponse.json({ text, mode: 'live' });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
