import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body?.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    // Safe fallback: return canonical links instead of scraping external sites in server runtime.
    const results = [
      {
        title: `Search: ${query}`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: 'Fallback search link (real crawler integration pending).',
      },
      {
        title: 'StayNeos Properties',
        url: 'https://neos.rentals/properties',
        snippet: 'Browse current furnished apartment inventory.',
      },
    ];

    return NextResponse.json({ results, total: results.length, mode: 'fallback' });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
