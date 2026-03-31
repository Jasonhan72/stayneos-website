import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { verifyRequestAuth } from '@/lib/auth/admin-api';

// Allowed domains for scraping (Toronto/local sites)
const ALLOWED_DOMAINS = [
  'toronto.ca',
  'blogto.com', 
  'cbc.ca',
  'ctvnews.ca',
  'thestar.com',
  'rentals.ca',
  'zumper.com',
  'padmapper.com'
];

// Rate limiting store (in-memory for simplicity, consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: max 5 requests per minute per IP
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

// User agent for NEOS bot
const USER_AGENT = 'NEOS-Bot/1.0 (+https://neos.rentals)';

// Request timeout (10 seconds)
const REQUEST_TIMEOUT = 10000;

// Validate if a URL is in the allowed domains
function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if hostname matches any allowed domain or subdomain
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

// Extract domain from URL for source field
function extractSource(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// Rate limiting middleware
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || record.resetTime < now) {
    // New window or expired window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetTime: now + RATE_LIMIT.windowMs };
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(ip, record);
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count, resetTime: record.resetTime };
}

// Scrape a single URL
async function scrapeURL(url: string): Promise<{ title: string; content: string; url: string; source: string }> {
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    let title = $('title').text() || $('h1').first().text() || $('h2').first().text() || '';
    title = title.trim().substring(0, 200);
    
    // Extract main content - try common content selectors
    let content = '';
    
    // Try article, main, or content containers first
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.article-content',
      '.post-content',
      '.story-content',
      '#content',
      '.main-content',
      '[role="main"]',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove script and style tags
        element.find('script, style, nav, footer, header, aside').remove();
        content = element.text();
        if (content.trim().length > 100) break;
      }
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit content length
    
    const source = extractSource(url);
    
    return { title, content, url, source };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Search DuckDuckGo for results
async function searchDuckDuckGo(query: string, maxResults: number = 5): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const results: Array<{ title: string; url: string; snippet: string }> = [];
    
    // DuckDuckGo HTML result structure
    $('.result').each((index, element) => {
      if (results.length >= maxResults) return false;
      
      const titleElement = $(element).find('.result__title a');
      const snippetElement = $(element).find('.result__snippet');
      
      if (titleElement.length && snippetElement.length) {
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const snippet = snippetElement.text().trim();
        
        if (url && !url.includes('duckduckgo.com')) {
          // Decode DuckDuckGo redirect URL
          const match = url.match(/uddg=([^&]+)/);
          if (match) {
            try {
              const decodedUrl = decodeURIComponent(match[1]);
              results.push({
                title: title.substring(0, 200),
                url: decodedUrl,
                snippet: snippet.substring(0, 300)
              });
            } catch (_) {
              // Skip invalid URLs
            }
          }
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const user = await verifyRequestAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many requests. Please try again later.',
          remaining: rateLimit.remaining,
          resetTime: new Date(rateLimit.resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { query, url, maxResults = 3 } = body;
    
    if (!query && !url) {
      return NextResponse.json(
        { error: 'Either query or url is required' },
        { status: 400 }
      );
    }
    
    const results: Array<{ title: string; content: string; url: string; source: string }> = [];
    
    if (url) {
      // Single URL scraping mode
      if (!isAllowedDomain(url)) {
        return NextResponse.json(
          { 
            error: 'Domain not allowed',
            message: `The domain is not in the allowed list. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`
          },
          { status: 403 }
        );
      }
      
      try {
        const scraped = await scrapeURL(url);
        results.push(scraped);
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Scraping failed',
            message: error instanceof Error ? error.message : 'Failed to scrape the URL'
          },
          { status: 500 }
        );
      }
    } else if (query) {
      // Search mode
      try {
        // Search DuckDuckGo
        const searchResults = await searchDuckDuckGo(query, maxResults);
        
        // Filter to only allowed domains and scrape each
        const allowedResults = searchResults.filter(result => isAllowedDomain(result.url));
        
        // Scrape each allowed URL (with concurrency limit)
        const scrapePromises = allowedResults.slice(0, maxResults).map(async (result) => {
          try {
            const scraped = await scrapeURL(result.url);
            return scraped;
          } catch (_) {
            // If scraping fails, use the search snippet as content
            return {
              title: result.title,
              content: result.snippet || 'Content unavailable',
              url: result.url,
              source: extractSource(result.url)
            };
          }
        });
        
        const scrapedResults = await Promise.allSettled(scrapePromises);
        
        // Collect successful results
        scrapedResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          }
        });
        
        // If no results were successfully scraped, return search snippets
        if (results.length === 0 && allowedResults.length > 0) {
          allowedResults.slice(0, maxResults).forEach(result => {
            results.push({
              title: result.title,
              content: result.snippet || 'Content unavailable',
              url: result.url,
              source: extractSource(result.url)
            });
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
          { 
            error: 'Search failed',
            message: 'Failed to perform web search'
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      results,
      count: results.length,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: new Date(rateLimit.resetTime).toISOString()
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for API information
export async function GET() {
  return NextResponse.json({
    name: 'NEOS Web Search API',
    version: '1.0.0',
    description: 'Web scraping API for Toronto rental market data and local news',
    features: {
      urlScraping: 'Scrape specific URLs (domain restrictions apply)',
      webSearch: 'Search the web via DuckDuckGo',
      rateLimiting: `${RATE_LIMIT.maxRequests} requests per minute per IP`,
      timeout: `${REQUEST_TIMEOUT / 1000} seconds per request`,
    },
    allowedDomains: ALLOWED_DOMAINS,
    userAgent: USER_AGENT,
    endpoints: {
      POST: {
        path: '/api/web-search',
        body: {
          query: 'string (optional) - Search query',
          url: 'string (optional) - Specific URL to scrape',
          maxResults: 'number (optional, default: 3) - Maximum number of results'
        },
        response: {
          results: 'Array of { title, content, url, source }',
          count: 'Number of results',
          rateLimit: 'Rate limit information'
        }
      }
    }
  });
}