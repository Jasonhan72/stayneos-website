/**
 * Aria Web Search — Cloudflare Workers compatible
 * 
 * Uses ONLY fetch API (no axios, no cheerio, no Node.js modules).
 * 
 * Engines:
 * 1. Jina Reader (r.jina.ai) — reads any URL as clean markdown, free
 * 2. DuckDuckGo HTML — search engine, no API key
 * 3. Local scraper API (aria-scraper via Cloudflare Tunnel) — deep scrape fallback
 */

const REQUEST_TIMEOUT = 12000;

export interface SearchResult {
  title: string;
  content: string;
  url: string;
  source: string;
}

function extractSource(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// ─── Jina Reader ───────────────────────────────────────────────
// Free, no API key, converts any URL to clean markdown.
// Works on most sites. Won't work on heavy SPAs (realtor.ca).

async function jinaRead(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: 'text/plain',
        'X-Timeout': '10',
        'X-Return-Format': 'text',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await res.text();
    if (text.length < 50 || text.includes('maybe not yet fully loaded')) {
      return '';
    }
    return text.substring(0, 4000);
  } catch {
    return '';
  }
}

// ─── DuckDuckGo Search ─────────────────────────────────────────
// Parses HTML with regex (no cheerio needed in Workers).

async function searchDuckDuckGo(query: string, maxResults = 5): Promise<{ url: string; title: string; snippet: string }[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html',
        'Accept-Language': 'en-CA,en-US;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const html = await res.text();
    const results: { url: string; title: string; snippet: string }[] = [];

    // Extract URLs from DuckDuckGo result links (regex, no cheerio)
    let match;
    const urls: string[] = [];
    const titles: string[] = [];

    // Simpler regex: just get uddg URLs
    const uddgRegex = /uddg=([^&"]+)/g;
    while ((match = uddgRegex.exec(html)) !== null && urls.length < maxResults * 2) {
      try {
        const decoded = decodeURIComponent(match[1]);
        if (!decoded.includes('duckduckgo.com') && !urls.includes(decoded)) {
          urls.push(decoded);
        }
      } catch { /* skip */ }
    }

    // Extract snippets
    const snippets: string[] = [];
    const snipRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\//g;
    while ((match = snipRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    // Extract titles
    const titleRegex = /class="result__a"[^>]*>([\s\S]*?)<\//g;
    while ((match = titleRegex.exec(html)) !== null) {
      titles.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    for (let i = 0; i < Math.min(urls.length, maxResults); i++) {
      results.push({
        url: urls[i],
        title: titles[i] || '',
        snippet: snippets[i] || '',
      });
    }

    return results;
  } catch {
    return [];
  }
}

// ─── Smart URL Reader ──────────────────────────────────────────
// Tries Jina first. For SPA-heavy sites, falls back to local scraper if available.

async function readURL(url: string): Promise<SearchResult> {
  const hostname = extractSource(url);

  // Try Jina Reader first
  const jinaContent = await jinaRead(url);
  if (jinaContent.length > 100) {
    const firstLine = jinaContent.split('\n')[0].replace(/^#\s*/, '').trim();
    return {
      title: firstLine.substring(0, 200),
      content: jinaContent,
      url,
      source: hostname,
    };
  }

  // If Jina failed, try raw fetch + text extraction (basic but works in Workers)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract JSON-LD
    let content = '';
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let ldMatch;
    while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const json = JSON.parse(ldMatch[1]);
        const types = ['RealEstateListing', 'Product', 'Residence', 'Apartment', 'House', 'Article', 'NewsArticle'];
        if (types.includes(json['@type'])) {
          content += `${json.name || json.headline || ''}\n`;
          content += `${json.description || json.articleBody || ''}\n`;
          if (json.offers?.price) content += `Price: ${json.offers.price}\n`;
          if (json.address) content += `Address: ${json.address.streetAddress || ''}, ${json.address.addressLocality || ''}\n`;
        }
      } catch { /* skip */ }
    }

    // Extract meta description
    if (content.length < 100) {
      const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
        || html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i)
        || html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
      if (metaMatch) content = metaMatch[1];
    }

    // Strip HTML tags and extract text from body
    if (content.length < 100) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1]
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<nav[\s\S]*?<\/nav>/gi, '')
          .replace(/<footer[\s\S]*?<\/footer>/gi, '')
          .replace(/<header[\s\S]*?<\/header>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    return {
      title: title.substring(0, 200),
      content: content.substring(0, 3000),
      url,
      source: hostname,
    };
  } catch {
    return {
      title: '',
      content: '',
      url,
      source: hostname,
    };
  }
}

// ─── Realtor.ca Search ─────────────────────────────────────────

async function searchRealtorCA(query: string): Promise<string> {
  const results = await searchDuckDuckGo(`site:realtor.ca Toronto ${query}`, 3);
  if (results.length > 0) {
    // Try to read top results
    const enriched = await Promise.allSettled(
      results.slice(0, 2).map(r => readURL(r.url))
    );

    let formatted = 'Realtor.ca results:\n\n';
    enriched.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.content.length > 50) {
        formatted += `${i + 1}. ${r.value.title}\n`;
        formatted += `   URL: ${r.value.url}\n`;
        formatted += `   ${r.value.content.substring(0, 500)}${r.value.content.length > 500 ? '...' : ''}\n\n`;
      } else {
        formatted += `${i + 1}. ${results[i].title}\n`;
        formatted += `   URL: ${results[i].url}\n`;
        formatted += `   ${results[i].snippet}\n\n`;
      }
    });
    return formatted;
  }

  return `No realtor.ca results found. Browse directly: https://www.realtor.ca/map#ZoomLevel=11&Center=43.6532,-79.3832&LatitudeMax=43.8&LongitudeMax=-79.2&LatitudeMin=43.5&LongitudeMin=-79.6&Sort=6-D&TransactionTypeId=2`;
}

// ─── Public API ────────────────────────────────────────────────

export async function performWebSearch(query: string, maxResults = 3): Promise<string> {
  const lowerQuery = query.toLowerCase();

  // Direct URL — read it
  const urlMatch = query.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    try {
      const result = await readURL(urlMatch[0]);
      return `Source: ${result.source}\nTitle: ${result.title}\n\n${result.content}`;
    } catch (err) {
      return `Failed to access ${urlMatch[0]}: ${err instanceof Error ? err.message : 'unknown error'}`;
    }
  }

  // Realtor.ca specific
  if (/realtor\.ca|mls\s*(#|number|listing)/i.test(lowerQuery)) {
    return searchRealtorCA(query);
  }

  // General search
  const hasLocation = /toronto|gta|ontario|canada|多伦多|vancouver|montreal/.test(lowerQuery);
  const searchQuery = hasLocation ? query : `Toronto ${query}`;

  const ddgResults = await searchDuckDuckGo(searchQuery, maxResults + 2);

  if (ddgResults.length === 0) {
    return 'No relevant web search results found.';
  }

  // Enrich top results via Jina Reader
  const enriched = await Promise.allSettled(
    ddgResults.slice(0, maxResults).map(async (r) => {
      try {
        return await readURL(r.url);
      } catch {
        return {
          title: r.title,
          content: r.snippet,
          url: r.url,
          source: extractSource(r.url),
        };
      }
    })
  );

  const results = enriched
    .filter((r): r is PromiseFulfilledResult<SearchResult> => r.status === 'fulfilled')
    .map(r => r.value);

  if (results.length === 0) {
    // Fallback: just return DDG snippets
    let formatted = 'Web search results:\n\n';
    ddgResults.slice(0, maxResults).forEach((r, i) => {
      formatted += `${i + 1}. **${r.title}** (${extractSource(r.url)})\n`;
      formatted += `   URL: ${r.url}\n`;
      formatted += `   ${r.snippet}\n\n`;
    });
    return formatted;
  }

  let formatted = 'Web search results:\n\n';
  results.forEach((r, i) => {
    formatted += `${i + 1}. **${r.title}** (${r.source})\n`;
    formatted += `   URL: ${r.url}\n`;
    formatted += `   ${r.content.substring(0, 600)}${r.content.length > 600 ? '...' : ''}\n\n`;
  });
  return formatted;
}

// Backwards compatibility exports
export { searchDuckDuckGo, readURL as scrapeURL, jinaRead, searchRealtorCA };
export function isAllowedDomain(): boolean { return true; }
