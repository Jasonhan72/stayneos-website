# Web Search API Implementation for Aria

## Overview
Implemented a web scraping API endpoint that Aria can use to fetch information from external websites for Toronto rental market data, local news, and competitor pricing.

## Files Created/Modified

### 1. `/src/app/api/web-search/route.ts` (NEW)
- **POST endpoint** for web scraping and search
- **GET endpoint** for API information
- **Features**:
  - Scrape specific URLs (with domain allowlist)
  - Perform web searches via DuckDuckGo HTML scraping
  - Rate limiting: 5 requests per minute per IP
  - Timeout: 10 seconds per request
  - User-agent: NEOS-Bot/1.0

### 2. `/src/app/api/chat/route.ts` (MODIFIED)
- **Updated system prompt** to include web search capability instructions
- **Added web search detection logic** (keywords: "market", "trend", "competitor", "compare", "news", "Toronto rental", etc.)
- **Integrated web search API calls** when external info is needed
- **Enhanced response format** to include `usedWebSearch` flag

## Domain Allowlist
The API only allows scraping from these Toronto/local sites:
- `toronto.ca`
- `blogto.com`
- `cbc.ca`
- `ctvnews.ca`
- `thestar.com`
- `rentals.ca`
- `zumper.com`
- `padmapper.com`

## Dependencies Added
- `axios@^1.6.0` - HTTP client for making requests
- `cheerio@^1.0.0-rc.12` - HTML parsing and scraping

## API Usage Examples

### 1. Web Search API
```bash
# Search for Toronto rental market info
curl -X POST http://localhost:3000/api/web-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Toronto rental market trends 2026", "maxResults": 3}'

# Scrape specific URL
curl -X POST http://localhost:3000/api/web-search \
  -H "Content-Type: application/json" \
  -d '{"url": "https://toronto.ca/news"}'

# Get API info
curl http://localhost:3000/api/web-search
```

### 2. Chat API with Web Search Integration
```bash
# Chat query that triggers web search
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are current Toronto rental market trends?", "sessionId": "test-123"}'
```

## Response Format

### Web Search API Response
```json
{
  "results": [
    {
      "title": "Article Title",
      "content": "Extracted content...",
      "url": "https://source.com/article",
      "source": "source.com"
    }
  ],
  "count": 1,
  "rateLimit": {
    "remaining": 4,
    "resetTime": "2026-03-26T05:10:37.424Z"
  }
}
```

### Chat API Response (with web search)
```json
{
  "text": "AI response incorporating web search results...",
  "sessionId": "website_123456789_abc123",
  "source": "cloudflare-ai",
  "language": "EN",
  "usedWebSearch": true,
  "webSearchQuery": "What are current Toronto rental market trends?"
}
```

## Error Handling
- **Rate limit exceeded**: Returns 429 with reset time
- **Domain not allowed**: Returns 403 with list of allowed domains
- **Scraping failed**: Returns 500 with error message
- **Invalid JSON**: Returns 400
- **Missing query/url**: Returns 400

## Testing
Run the test script:
```bash
node test-web-search.js
```

Or test manually:
```bash
# Test web search
curl -X POST http://localhost:3000/api/web-search -d '{"query": "test"}'

# Test chat with web search trigger
curl -X POST http://localhost:3000/api/chat -d '{"message": "Toronto market trends"}'
```

## Security Considerations
1. **Domain restrictions**: Only allowed domains can be scraped
2. **Rate limiting**: Prevents abuse
3. **Timeout**: 10-second timeout per request
4. **User-agent**: Identifies as NEOS bot
5. **Content length limits**: Titles limited to 200 chars, content to 2000 chars

## Future Improvements
1. Add caching for search results
2. Implement more robust search providers
3. Add support for more content types (JSON, RSS feeds)
4. Implement retry logic for failed requests
5. Add monitoring and logging
6. Consider using a headless browser (Puppeteer/Playwright) for JavaScript-heavy sites

## Integration with Aria
Aria will automatically use web search when queries contain keywords related to:
- Market trends and analysis
- Competitor pricing and comparisons
- Toronto rental market data
- Local news affecting housing
- Real estate statistics and reports

The web search results are provided as context to Aria, who can then incorporate this up-to-date information into responses while citing sources when appropriate.