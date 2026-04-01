import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Aria Web Search — Multi-engine search & scraping
 * 
 * Engines:
 * 1. Jina Reader (r.jina.ai) — reads any URL as clean markdown
 * 2. DuckDuckGo HTML — search engine, no API key
 * 3. Direct scrape with Cheerio — fallback for sites Jina can't read
 * 4. Google search via scraping — backup search engine
 * 
 * No domain restrictions — Aria can access the entire public internet.
 */

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const REQUEST_TIMEOUT = 15000;

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
// Converts any URL to clean markdown. Free, no API key, 20 RPM.
// Great for articles, blogs, docs. Won't work on heavy SPAs (realtor.ca).

async function jinaRead(url: string): Promise<string> {
  try {
    const res = await axios.get(`https://r.jina.ai/${url}`, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        Accept: 'text/plain',
        'X-Timeout': '12',
        'X-Return-Format': 'text',
      },
    });
    const text = typeof res.data === 'string' ? res.data : '';
    // Check if Jina actually got content
    if (text.length < 50 || text.includes('maybe not yet fully loaded')) {
      return '';
    }
    return text.substring(0, 4000);
  } catch {
    return '';
  }
}

// ─── Direct Cheerio Scrape ─────────────────────────────────────
// Falls back to raw HTTP + Cheerio for sites Jina can't handle.
// Special selectors for real estate sites.

const SITE_SELECTORS: Record<string, string[]> = {
  'realtor.ca': ['.propertyDetailsSummary', '.listingDetailsPrice', '.propertyDetails', '#listingDetailInfo', 'main'],
  'zolo.ca': ['.listing-summary', '.listing-details', 'main'],
  'condos.ca': ['.listing-detail', '.property-details', 'main'],
  'housesigma.com': ['.listing-info', '.price-section', 'main'],
  'rentals.ca': ['.listing-header', '.listing-body', 'main'],
  'blogto.com': ['article', '.article-content', 'main'],
  'thestar.com': ['article', '.article-content', 'main'],
};

async function cheerioScrape(url: string): Promise<SearchResult> {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      Referer: 'https://www.google.com/',
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);
  let title = $('title').text() || $('h1').first().text() || '';
  title = title.trim().substring(0, 200);

  // Try JSON-LD structured data first
  let content = '';
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      const types = ['RealEstateListing', 'Product', 'Residence', 'Apartment', 'House'];
      if (types.includes(json['@type'])) {
        content += `Listing: ${json.name || ''} | Price: ${json.offers?.price || json.price || 'N/A'} | `;
        content += `Address: ${json.address?.streetAddress || ''}, ${json.address?.addressLocality || ''} | `;
        content += `Description: ${(json.description || '').substring(0, 500)} `;
      }
      if (json['@type'] === 'Article' || json['@type'] === 'NewsArticle') {
        content += `${json.headline || ''}\n${(json.articleBody || json.description || '').substring(0, 1000)} `;
      }
    } catch { /* skip */ }
  });

  // DOM extraction with site-specific selectors
  if (content.length < 100) {
    const hostname = extractSource(url);
    const selectors = SITE_SELECTORS[hostname] || ['article', 'main', '.content', '.article-content', '[role="main"]', 'body'];
    for (const sel of selectors) {
      const el = $(sel);
      if (el.length > 0) {
        el.find('script, style, nav, footer, header, aside, .ad, .advertisement, [class*="cookie"], [class*="popup"]').remove();
        content = el.text();
        if (content.trim().length > 100) break;
      }
    }
  }

  // Meta description fallback
  if (content.trim().length < 50) {
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    content = metaDesc;
  }

  content = content.replace(/\s+/g, ' ').trim().substring(0, 3000);
  return { title, content, url, source: extractSource(url) };
}

// ─── Smart URL Reader ──────────────────────────────────────────
// Tries Jina first, falls back to Cheerio scrape.

async function readURL(url: string): Promise<SearchResult> {
  // SPAs that Jina can't handle — go straight to Cheerio
  const spaHosts = ['realtor.ca', 'housesigma.com', 'condos.ca', 'zolo.ca'];
  const hostname = extractSource(url);
  const isSPA = spaHosts.some(h => hostname.includes(h));

  if (!isSPA) {
    const jinaContent = await jinaRead(url);
    if (jinaContent.length > 100) {
      // Extract title from first line
      const firstLine = jinaContent.split('\n')[0].replace(/^#\s*/, '').trim();
      return {
        title: firstLine.substring(0, 200),
        content: jinaContent,
        url,
        source: hostname,
      };
    }
  }

  // Fallback to direct scrape
  return cheerioScrape(url);
}

// ─── DuckDuckGo Search ─────────────────────────────────────────

async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const results: { url: string; snippet: string; title: string }[] = [];

    $('.result').each((_, element) => {
      if (results.length >= maxResults) return false;
      const titleEl = $(element).find('.result__title a');
      const href = titleEl.attr('href');
      const title = titleEl.text().trim();
      const snippet = $(element).find('.result__snippet').text().trim();

      if (href && !href.includes('duckduckgo.com')) {
        const match = href.match(/uddg=([^&]+)/);
        if (match) {
          try {
            results.push({
              url: decodeURIComponent(match[1]),
              title,
              snippet,
            });
          } catch { /* skip */ }
        }
      }
    });

    // For top results, try to get richer content via Jina/scrape
    const enriched = await Promise.allSettled(
      results.slice(0, maxResults).map(async (r) => {
        try {
          const full = await readURL(r.url);
          return full;
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

    return enriched
      .filter((r): r is PromiseFulfilledResult<SearchResult> => r.status === 'fulfilled')
      .map(r => r.value);
  } catch {
    return [];
  }
}

// ─── Google Scrape Search (backup) ─────────────────────────────

async function searchGoogle(query: string, maxResults = 3): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${maxResults}&hl=en`;
    const response = await axios.get(searchUrl, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const results: SearchResult[] = [];

    $('div.g').each((_, element) => {
      if (results.length >= maxResults) return false;
      const titleEl = $(element).find('h3').first();
      const linkEl = $(element).find('a').first();
      const snippetEl = $(element).find('[data-sncf], .VwiC3b, .IsZvec').first();

      const title = titleEl.text().trim();
      const url = linkEl.attr('href') || '';
      const snippet = snippetEl.text().trim();

      if (title && url.startsWith('http')) {
        results.push({
          title,
          content: snippet,
          url,
          source: extractSource(url),
        });
      }
    });

    return results;
  } catch {
    return [];
  }
}

// ─── Realtor.ca Specific Search ────────────────────────────────

async function searchRealtorCA(query: string): Promise<string> {
  try {
    const results = await searchDuckDuckGo(`site:realtor.ca ${query}`, 3);
    if (results.length > 0) {
      let formatted = 'Realtor.ca results:\n\n';
      results.forEach((r, i) => {
        formatted += `${i + 1}. ${r.title}\n`;
        formatted += `   URL: ${r.url}\n`;
        formatted += `   ${r.content.substring(0, 500)}${r.content.length > 500 ? '...' : ''}\n\n`;
      });
      return formatted;
    }
    return `No realtor.ca results found. Try browsing: https://www.realtor.ca/map#ZoomLevel=11&Center=43.6532,-79.3832&LatitudeMax=43.8&LongitudeMax=-79.2&LatitudeMin=43.5&LongitudeMin=-79.6&Sort=6-D&TransactionTypeId=2`;
  } catch {
    return 'Unable to search realtor.ca at this time.';
  }
}

// ─── Public API: performWebSearch ──────────────────────────────

export async function performWebSearch(query: string, maxResults = 3): Promise<string> {
  const lowerQuery = query.toLowerCase();

  // Direct URL — read it
  const urlMatch = query.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    try {
      const result = await readURL(urlMatch[0]);
      return `Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}`;
    } catch (err) {
      return `Failed to access ${urlMatch[0]}: ${err instanceof Error ? err.message : 'unknown error'}`;
    }
  }

  // Realtor.ca specific
  if (/realtor\.ca|mls\s*(#|number|listing)/i.test(lowerQuery)) {
    return searchRealtorCA(query);
  }

  // General search — DuckDuckGo primary, Google backup
  const hasLocation = /toronto|gta|ontario|canada|多伦多|vancouver|montreal/.test(lowerQuery);
  const searchQuery = hasLocation ? query : `Toronto ${query}`;

  let results = await searchDuckDuckGo(searchQuery, maxResults);

  // If DuckDuckGo fails, try Google
  if (results.length === 0) {
    results = await searchGoogle(searchQuery, maxResults);
  }

  if (results.length === 0) return 'No relevant web search results found.';

  let formatted = 'Web search results:\n\n';
  results.forEach((r, i) => {
    formatted += `${i + 1}. **${r.title}** (${r.source})\n`;
    formatted += `   URL: ${r.url}\n`;
    formatted += `   ${r.content.substring(0, 600)}${r.content.length > 600 ? '...' : ''}\n\n`;
  });
  return formatted;
}

// Re-export for backwards compatibility
export { searchDuckDuckGo, readURL as scrapeURL, jinaRead, searchGoogle, searchRealtorCA };
export function isAllowedDomain(): boolean { return true; } // No restrictions
