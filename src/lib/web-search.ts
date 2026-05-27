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

  // General search — detect any city, don't default to Toronto
  const hasLocation = /toronto|gta|ontario|canada|多伦多|vancouver|montreal|ottawa|calgary|edmonton|quebec|halifax|winnipeg|seattle|portland|san\s*francisco|los\s*angeles|new\s*york|boston|chicago|austin|miami|houston|dallas|denver|phoenix|san\s*diego|london|paris|berlin|tokyo|sydney|dubai|singapore|hong\s*kong|shanghai|beijing/i.test(lowerQuery);
  const searchQuery = hasLocation ? query : query; // Don't force Toronto — search as-is

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

// ─── External Property Extraction ─────────────────────────────
// Extract structured property fields (price, beds, location, image) from
// search results so the chat UI can render them as cards like internal listings.

export interface ExternalProperty {
  title: string;
  url: string;
  source: string;        // hostname (currently realtor.ca for external listing search)
  price?: number;        // monthly CAD
  priceText?: string;    // raw price string for display when number can't be parsed
  bedrooms?: number;
  bathrooms?: number;
  location?: string;     // address / neighborhood
  image?: string;        // first image URL if found
  snippet?: string;      // short description
}

// Try to pull a price like "$3,250/mo", "$3250 monthly", "CAD 3,500 / month" out of text.
function parsePrice(text: string): { num?: number; raw?: string } {
  if (!text) return {};
  const re = /(?:CAD\s*|C?\$\s*)([0-9][0-9,]{2,7}(?:\.[0-9]{1,2})?)\s*(?:\/\s*(?:mo|month|monthly|m)\b|per\s*month|monthly|\/m)?/i;
  const m = text.match(re);
  if (!m) return {};
  const num = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(num) || num < 700 || num > 50000) return { raw: m[0] };
  return { num: Math.round(num), raw: m[0] };
}

function parseBedrooms(text: string): number | undefined {
  if (!text) return undefined;
  // Prefer numeric matches first; only fall back to Studio when it's a clearly
  // standalone label (otherwise listing aggregator pages with the word
  // "studio" sprinkled around get misclassified as 0-bed cards).
  const m = text.match(/(\d+)\s*(?:-?\s*)?(?:bed|bedroom|br\b)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 10) return n;
  }
  if (/\b(studio|bachelor)\s+(?:apartment|condo|suite|unit|for\s*rent)/i.test(text)) return 0;
  return undefined;
}

function parseBathrooms(text: string): number | undefined {
  if (!text) return undefined;
  const m = text.match(/(\d+(?:\.\d)?)\s*(?:-?\s*)?(?:bath|bathroom|ba\b)/i);
  if (m) {
    const n = parseFloat(m[1]);
    if (n > 0 && n <= 10) return n;
  }
  return undefined;
}

// Reject obviously-garbage location strings that slipped through (e.g. JSON
// fragments, JS expressions, HTML attributes from the source page).
function looksLikeCleanLocation(s: string): boolean {
  if (!s) return false;
  if (s.length < 2 || s.length > 120) return false;
  // No raw JSON / JS / HTML noise
  if (/[{}<>;]|@type|PostalAddress|pathname|href|className/.test(s)) return false;
  // Must contain at least one letter
  if (!/[A-Za-z\u4e00-\u9fff]/.test(s)) return false;
  // Reject if mostly punctuation/symbols
  const letters = (s.match(/[A-Za-z\u4e00-\u9fff]/g) || []).length;
  if (letters / s.length < 0.4) return false;
  return true;
}

function parseLocation(text: string, fallbackTitle: string): string | undefined {
  // Common formats: "Address: 123 King St, Toronto" or just a Toronto-area street
  const addrLabel = text.match(/(?:Address|Location|Located\s+at)\s*[:\-]?\s*([^\n,]+(?:,\s*[A-Za-z .'-]+){0,2})/i);
  if (addrLabel && looksLikeCleanLocation(addrLabel[1].trim())) return addrLabel[1].trim().slice(0, 120);
  const streetMatch = text.match(/\b(\d{1,5}\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Cres|Crescent|Way|Ct|Court|Pl|Place|Ln|Lane)\.?(?:\s+[NSEW]\.?)?(?:,\s*[A-Za-z .'-]+){0,2})/);
  if (streetMatch && looksLikeCleanLocation(streetMatch[1].trim())) return streetMatch[1].trim().slice(0, 120);
  // Toronto neighborhoods
  const hood = text.match(/\b(Downtown|North York|Scarborough|Etobicoke|Yorkville|Liberty Village|King West|Distillery District|Annex|Forest Hill|Rosedale|Leslieville|Riverdale|Cabbagetown|Mississauga|Markham|Vaughan|Richmond Hill)\b/i);
  if (hood) return hood[1];
  // Fallback: try to slice city out of title ("... Toronto, ON")
  const cityInTitle = fallbackTitle.match(/(Toronto|Mississauga|Markham|Vaughan|Richmond Hill|North York|Scarborough|Etobicoke)(?:[,\s]+ON)?/i);
  if (cityInTitle) return cityInTitle[0];
  return undefined;
}

function extractFirstImage(html: string, baseUrl: string): string | undefined {
  // og:image first
  const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
    || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  let url = og?.[1];
  if (!url) {
    // NextJS-style images (from _next/image?url=...)
    const nextImg = html.match(/<img[^>]+src=["']([^"']*_next\/image[^"']+)["']/i);
    url = nextImg?.[1];
  }
  if (!url) {
    // data-src or lazy-loaded src
    const dataSrc = html.match(/<img[^>]+(?:data-src|data-lazy-src|data-original)=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/i);
    url = dataSrc?.[1];
  }
  if (!url) {
    // Any <img> with a decent looking src (jpg/png/webp)
    const img = html.match(/<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp)[^"']*)["']/i);
    url = img?.[1];
  }
  if (!url) {
    // Broader: any img src with common image dimensions/hints
    const anyImg = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    url = anyImg?.[1];
    // Skip tiny icons / logos / tracking pixels
    if (url && /(?:icon|logo|avatar|pixel|tracker|badge|favicon|1x1|spacer)/i.test(url)) {
      url = undefined;
    }
  }
  if (!url) return undefined;
  try {
    const resolved = new URL(url, baseUrl).toString();
    // Skip data URIs (too small to be property images)
    if (resolved.startsWith('data:')) return undefined;
    return resolved;
  } catch {
    return undefined;
  }
}

// External listing search is intentionally scoped to realtor.ca.
const PROPERTY_HOSTS = [
  'realtor.ca',
];

function looksLikePropertyHost(hostname: string): boolean {
  return PROPERTY_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return '';
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return '';
    }
    return await res.text();
  } catch {
    return '';
  }
}

// Try to extract structured property data from a single URL via JSON-LD + meta + content text.
async function extractPropertyFromURL(url: string, fallback: { title?: string; snippet?: string }): Promise<ExternalProperty | null> {
  const hostname = extractSource(url);
  if (!looksLikePropertyHost(hostname)) {
    // Still try, but be more conservative
  }

  // 1. Try Jina markdown first (often defeats SPAs)
  const jina = await jinaRead(url);
  let title = fallback.title || '';
  let snippet = fallback.snippet || '';
  let priceNum: number | undefined;
  let priceRaw: string | undefined;
  let beds: number | undefined;
  let baths: number | undefined;
  let location: string | undefined;
  let image: string | undefined;

  if (jina && jina.length > 100) {
    const firstLine = jina.split('\n')[0].replace(/^#\s*/, '').trim();
    if (firstLine && firstLine.length > 5) title = firstLine.substring(0, 200);
    snippet = jina.substring(0, 800);
    const pp = parsePrice(jina);
    priceNum = pp.num; priceRaw = pp.raw;
    beds = parseBedrooms(jina);
    baths = parseBathrooms(jina);
    location = parseLocation(jina, title);
  }

  // 2. Fetch raw HTML for image + JSON-LD if Jina didn't give us enough
  if (!image || !priceNum || beds === undefined) {
    const html = await fetchHtml(url);
    if (html) {
      if (!image) image = extractFirstImage(html, url);
      // JSON-LD
      const jsonLdRegex = /<script type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let ldMatch;
      while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
        try {
          const json = JSON.parse(ldMatch[1]);
          const candidates = Array.isArray(json) ? json : [json];
          for (const c of candidates) {
            const t = c['@type'];
            const tStr = Array.isArray(t) ? t.join(' ') : (t || '');
            if (/RealEstateListing|Apartment|House|Product|Residence/i.test(tStr)) {
              if (!title && (c.name || c.headline)) title = String(c.name || c.headline).substring(0, 200);
              if (!priceNum) {
                const p = c.offers?.price ?? c.price;
                if (typeof p === 'number' && p > 500 && p < 50000) priceNum = Math.round(p);
                else if (typeof p === 'string') {
                  const pp = parsePrice(p);
                  if (pp.num) priceNum = pp.num;
                  if (pp.raw && !priceRaw) priceRaw = pp.raw;
                }
              }
              if (beds === undefined && c.numberOfBedrooms !== undefined) {
                const n = parseInt(String(c.numberOfBedrooms), 10);
                if (Number.isFinite(n)) beds = n;
              }
              if (baths === undefined && c.numberOfBathroomsTotal !== undefined) {
                const n = parseFloat(String(c.numberOfBathroomsTotal));
                if (Number.isFinite(n)) baths = n;
              }
              if (!location && c.address) {
                const a = c.address;
                location = [a.streetAddress, a.addressLocality, a.addressRegion].filter(Boolean).join(', ').slice(0, 120);
              }
              if (!image && c.image) {
                const img = Array.isArray(c.image) ? c.image[0] : c.image;
                if (typeof img === 'string') image = img;
                else if (img?.url) image = img.url;
              }
            }
          }
        } catch { /* skip */ }
      }
      if (!priceNum || !priceRaw) {
        const pp = parsePrice(html);
        if (pp.num && !priceNum) priceNum = pp.num;
        if (pp.raw && !priceRaw) priceRaw = pp.raw;
      }
      if (beds === undefined) beds = parseBedrooms(html);
      if (baths === undefined) baths = parseBathrooms(html);
      if (!location) location = parseLocation(html, title);
    }
  }

  // If we don't even have a title, give up
  if (!title || title.length < 5) return null;

  // Final cleanup: drop location if it doesn't look like a clean address/place
  if (location && !looksLikeCleanLocation(location)) location = undefined;

  // Need at least one of: price, beds, location, image — otherwise it's not really a property card
  if (priceNum === undefined && beds === undefined && !location && !image) {
    return null;
  }

  return {
    title,
    url,
    source: hostname,
    price: priceNum,
    priceText: priceRaw,
    bedrooms: beds,
    bathrooms: baths,
    location,
    image,
    snippet: snippet ? snippet.substring(0, 240) : undefined,
  };
}

/**
 * Search the web for rental listings matching the user's query and return
 * structured property cards (max 4). Used by the chat API so the UI can
 * render external listings the same way as internal ones.
 */
export async function searchExternalProperties(query: string, maxResults = 3): Promise<ExternalProperty[]> {
  const lowerQuery = query.toLowerCase();

  // 1. Direct URL — just read it
  const urlMatch = query.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    const url = urlMatch[0];
    const card = await extractPropertyFromURL(url, {});
    return card ? [card] : [];
  }

  // 2. Detect ANY city/location in the query to avoid defaulting to Toronto
  // Common city names (US + Canada + major international)
  const cityPattern = /(?:in|near|around|for|at)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})(?:\b|[,?.!])/;
  const cityMatch = query.match(cityPattern);
  
  // Broader location detection: any major city mention
  const hasLocation = /toronto|gta|ontario|canada|多伦多|vancouver|montreal|ottawa|calgary|edmonton|quebec|halifax|winnipeg|seattle|portland|san\s*francisco|los\s*angeles|new\s*york|boston|chicago|austin|miami|houston|dallas|denver|phoenix|san\s*diego|london|paris|berlin|tokyo|sydney|dubai|singapore|hong\s*kong|shanghai|beijing/i.test(lowerQuery);
  
  const normalizedTerms: string[] = [];
  if (/多大|uoft|u\s*of\s*t|university\s+of\s+toronto/i.test(query)) {
    normalizedTerms.push('University of Toronto');
  }
  const budget = query.match(/(?:预算|budget|under|below|less than|以内|以下|max|maximum)\s*\$?\s*([1-9][0-9,]{3,5})/i)
    || query.match(/\$?\s*([1-9][0-9,]{3,5})\s*(?:以内|以下|under|below|budget)/i);
  if (budget?.[1]) {
    normalizedTerms.push(`under ${budget[1].replace(/,/g, '')}`);
  }
  if (/一居|1室|一室|一卧/.test(query)) normalizedTerms.push('1 bedroom');
  if (/两居|二居|2室|两室|二室|两卧|二卧/.test(query)) normalizedTerms.push('2 bedroom');
  if (/三居|3室|三室|三卧/.test(query)) normalizedTerms.push('3 bedroom');

  // Extract location if present, otherwise use empty (don't default to Toronto)
  let locationPrefix = '';
  if (hasLocation) {
    locationPrefix = query;
  } else if (cityMatch) {
    locationPrefix = `${cityMatch[1]} ${query}`;
  } else {
    // No location detected — search as-is but add "rent" context
    locationPrefix = query;
  }
  const searchTerms = [locationPrefix, ...normalizedTerms, hasLocation ? '' : 'Toronto']
    .filter(Boolean)
    .join(' ');
  
  const siteFilter = 'site:realtor.ca';
  const searchQuery = `${searchTerms} rent ${siteFilter}`;

  const ddg = await searchDuckDuckGo(searchQuery, maxResults + 4);
  if (ddg.length === 0) return [];

  // 3. Try to enrich top results in parallel
  const enriched = await Promise.allSettled(
    ddg.slice(0, maxResults + 2).map(r =>
      extractPropertyFromURL(r.url, { title: r.title, snippet: r.snippet })
    )
  );

  const cards: ExternalProperty[] = [];
  for (const r of enriched) {
    if (r.status === 'fulfilled' && r.value) {
      // Dedupe by URL
      if (!cards.find(c => c.url === r.value!.url)) {
        cards.push(r.value);
        if (cards.length >= maxResults) break;
      }
    }
  }

  // Some marketplace pages are heavy SPAs and do not expose enough HTML for
  // structured extraction. Keep the external-search behavior useful by falling
  // back to clickable source cards from the search results, clearly marked as
  // external and without invented prices.
  if (cards.length < maxResults) {
    for (const result of ddg) {
      const source = extractSource(result.url);
      if (!looksLikePropertyHost(source)) continue;
      if (cards.some(c => c.url === result.url)) continue;
      const title = (result.title || '').replace(/\s+/g, ' ').trim();
      const snippet = (result.snippet || '').replace(/\s+/g, ' ').trim();
      if (title.length < 5 && snippet.length < 20) continue;
      const price = parsePrice(`${title} ${snippet}`);
      cards.push({
        title: title || `${source} listing`,
        url: result.url,
        source,
        price: price.num,
        priceText: price.raw,
        bedrooms: parseBedrooms(`${title} ${snippet}`),
        bathrooms: parseBathrooms(`${title} ${snippet}`),
        location: parseLocation(`${title}\n${snippet}`, title),
        snippet: snippet ? snippet.substring(0, 240) : undefined,
      });
      if (cards.length >= maxResults) break;
    }
  }

  return cards;
}
