import axios from 'axios';
import * as cheerio from 'cheerio';

// No domain whitelist — Aria can access any public website
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
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

/**
 * Scrape a single URL and extract readable content.
 * Special handling for realtor.ca and other real estate sites.
 */
export async function scrapeURL(url: string): Promise<SearchResult> {
  const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      Referer: 'https://www.google.com/',
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);
  let title = $('title').text() || $('h1').first().text() || '';
  title = title.trim().substring(0, 200);

  // Try JSON-LD structured data first (realtor.ca, many real estate sites use this)
  let content = '';
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      if (json['@type'] === 'RealEstateListing' || json['@type'] === 'Product' || json['@type'] === 'Residence') {
        content += `Listing: ${json.name || ''} | Price: ${json.offers?.price || json.price || 'N/A'} | `;
        content += `Address: ${json.address?.streetAddress || ''}, ${json.address?.addressLocality || ''} | `;
        content += `Description: ${(json.description || '').substring(0, 500)} `;
      }
    } catch { /* skip invalid JSON-LD */ }
  });

  // Fall back to DOM extraction
  if (content.length < 100) {
    // realtor.ca specific selectors
    const hostname = extractSource(url);
    const siteSelectors: Record<string, string[]> = {
      'realtor.ca': ['.propertyDetailsSummary', '.listingDetailsPrice', '.propertyDetails', '#listingDetailInfo', '.listingDetailFeatures', 'main'],
      'zolo.ca': ['.listing-summary', '.listing-details', 'main'],
      'condos.ca': ['.listing-detail', '.property-details', 'main'],
      'housesigma.com': ['.listing-info', '.price-section', 'main'],
    };

    const selectors = siteSelectors[hostname] || ['article', 'main', '.content', '.article-content', '[role="main"]', 'body'];
    
    for (const sel of selectors) {
      const el = $(sel);
      if (el.length > 0) {
        el.find('script, style, nav, footer, header, aside, .ad, .advertisement, [class*="cookie"], [class*="popup"]').remove();
        content = el.text();
        if (content.trim().length > 100) break;
      }
    }
  }

  content = content.replace(/\s+/g, ' ').trim().substring(0, 3000);

  return { title, content, url, source: extractSource(url) };
}

/**
 * Search via DuckDuckGo HTML (no API key needed).
 * No domain filtering — returns results from any site.
 */
export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<SearchResult[]> {
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

    // Scrape top results (no domain filtering)
    const results = await Promise.allSettled(urls.slice(0, maxResults).map(scrapeURL));
    return results
      .filter((r): r is PromiseFulfilledResult<SearchResult> => r.status === 'fulfilled')
      .map(r => r.value);
  } catch {
    return [];
  }
}

/**
 * Direct URL scrape — when user provides a specific URL or we know the target.
 */
export async function scrapeDirectURL(url: string): Promise<string> {
  try {
    const result = await scrapeURL(url);
    return `Source: ${result.source}\nTitle: ${result.title}\nContent: ${result.content}`;
  } catch (err) {
    return `Failed to access ${url}: ${err instanceof Error ? err.message : 'unknown error'}`;
  }
}

/**
 * Search realtor.ca specifically for Toronto rental/sale listings.
 */
export async function searchRealtorCA(query: string): Promise<string> {
  try {
    // Use DuckDuckGo to find realtor.ca pages
    const siteQuery = `site:realtor.ca ${query}`;
    const results = await searchDuckDuckGo(siteQuery, 3);
    
    if (results.length > 0) {
      let formatted = 'Realtor.ca results:\n\n';
      results.forEach((r, i) => {
        formatted += `${i + 1}. ${r.title}\n`;
        formatted += `   URL: ${r.url}\n`;
        formatted += `   ${r.content.substring(0, 400)}${r.content.length > 400 ? '...' : ''}\n\n`;
      });
      return formatted;
    }

    // Fallback: try scraping realtor.ca search directly
    const searchUrl = `https://www.realtor.ca/map#ZoomLevel=11&Center=43.6532,-79.3832&LatitudeMax=43.8&LongitudeMax=-79.2&LatitudeMin=43.5&LongitudeMin=-79.6&Sort=6-D&PropertyTypeGroupID=1&TransactionTypeId=2&Currency=CAD`;
    return `For the latest Toronto listings, visit: ${searchUrl}\n(Realtor.ca uses heavy JavaScript rendering; for detailed listing data, try specific property URLs.)`;
  } catch {
    return 'Unable to search realtor.ca at this time.';
  }
}

/**
 * High-level search: run a query and return formatted results for AI context.
 * Enhanced: supports realtor.ca, any domain, and direct URL scraping.
 */
export async function performWebSearch(query: string, maxResults = 3): Promise<string> {
  const lowerQuery = query.toLowerCase();

  // If query mentions realtor.ca or looks like a real estate search
  const isRealEstateQuery = /realtor\.ca|mls|listing|房源|挂牌/.test(lowerQuery);
  
  // If query contains a URL, scrape it directly
  const urlMatch = query.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    return scrapeDirectURL(urlMatch[0]);
  }

  let results: SearchResult[] = [];

  if (isRealEstateQuery) {
    // Search realtor.ca first, then general
    const realtorResults = await searchDuckDuckGo(`site:realtor.ca toronto ${query}`, 2);
    const generalResults = await searchDuckDuckGo(`toronto ${query}`, maxResults - realtorResults.length);
    results = [...realtorResults, ...generalResults].slice(0, maxResults);
  } else {
    // Append "Toronto" if query doesn't already include a location
    const hasLocation = /toronto|gta|ontario|canada|多伦多/.test(lowerQuery);
    const searchQuery = hasLocation ? query : `Toronto ${query}`;
    results = await searchDuckDuckGo(searchQuery, maxResults);
  }

  if (results.length === 0) return 'No relevant web search results found.';

  let formatted = 'Web search results:\n\n';
  results.forEach((r, i) => {
    formatted += `${i + 1}. **${r.title}** (Source: ${r.source})\n`;
    formatted += `   URL: ${r.url}\n`;
    formatted += `   Content: ${r.content.substring(0, 500)}${r.content.length > 500 ? '...' : ''}\n\n`;
  });
  return formatted;
}
