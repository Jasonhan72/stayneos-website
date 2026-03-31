import axios from 'axios';
import * as cheerio from 'cheerio';

const ALLOWED_DOMAINS = [
  'toronto.ca', 'blogto.com', 'cbc.ca', 'ctvnews.ca',
  'thestar.com', 'rentals.ca', 'zumper.com', 'padmapper.com',
];

const USER_AGENT = 'NEOS-Bot/1.0 (+https://neos.rentals)';
const REQUEST_TIMEOUT = 10000;

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

export function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export async function scrapeURL(url: string): Promise<SearchResult> {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  const $ = cheerio.load(response.data);
  let title = $('title').text() || $('h1').first().text() || '';
  title = title.trim().substring(0, 200);

  let content = '';
  const selectors = ['article', 'main', '.content', '.article-content', '[role="main"]', 'body'];
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length > 0) {
      el.find('script, style, nav, footer, header, aside').remove();
      content = el.text();
      if (content.trim().length > 100) break;
    }
  }
  content = content.replace(/\s+/g, ' ').trim().substring(0, 2000);

  return { title, content, url, source: extractSource(url) };
}

export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    });

    const $ = cheerio.load(response.data);
    const urls: string[] = [];

    $('.result').each((_, element) => {
      if (urls.length >= maxResults) return false;
      const href = $(element).find('.result__title a').attr('href');
      if (href && !href.includes('duckduckgo.com')) {
        const match = href.match(/uddg=([^&]+)/);
        if (match) {
          try {
            urls.push(decodeURIComponent(match[1]));
          } catch { /* skip */ }
        }
      }
    });

    // Only scrape allowed domains
    const allowedUrls = urls.filter(isAllowedDomain);
    const results = await Promise.allSettled(allowedUrls.slice(0, 3).map(scrapeURL));
    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult> => r.status === 'fulfilled')
      .map(r => r.value);
  } catch {
    return [];
  }
}

/**
 * High-level search: run a query and return formatted results for AI context.
 */
export async function performWebSearch(query: string, maxResults = 3): Promise<string> {
  const results = await searchDuckDuckGo(query, maxResults);
  if (results.length === 0) return 'No relevant web search results found.';

  let formatted = 'Web search results:\n\n';
  results.forEach((r, i) => {
    formatted += `${i + 1}. **${r.title}** (Source: ${r.source})\n`;
    formatted += `   URL: ${r.url}\n`;
    formatted += `   Content: ${r.content.substring(0, 300)}${r.content.length > 300 ? '...' : ''}\n\n`;
  });
  return formatted;
}
