const buckets = new Map<string, { count: number; resetAt: number }>();

// D1-backed rate limit for Cloudflare Workers (survives multi-isolate)
// Uses INSERT OR REPLACE with atomic conditional check

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Memory-based rate limit (per-isolate, fast). Good as a first line of defense.
 */
export function checkRateLimit(request: Request, keyPrefix: string, options: RateLimitOptions) {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientIp(request)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1 };
  }

  if (existing.count >= options.limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000), remaining: 0 };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: Math.max(0, options.limit - existing.count) };
}

/**
 * D1-backed rate limit (survives multi-isolate Cloudflare Workers).
 * Uses SQLite UPSERT with atomic conditional increment.
 */
export async function checkD1RateLimit(
  db: D1Database,
  request: Request,
  keyPrefix: string,
  options: RateLimitOptions
) {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientIp(request)}`;
  const resetAt = now + options.windowMs;

  try {
    // Atomic: only increment if window hasn't expired, otherwise reset to 1
    const result = await db
      .prepare(
        `INSERT INTO rate_limits (key, count, reset_at)
         VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET
           count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
           reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END
         RETURNING count, reset_at`
      )
      .bind(key, resetAt, now, now, resetAt)
      .first<{ count: number; reset_at: number }>();

    if (!result) return { allowed: true, remaining: options.limit - 1 };

    const actualReset = result.reset_at;
    if (result.count > options.limit) {
      return { allowed: false, retryAfter: Math.ceil((actualReset - now) / 1000), remaining: 0 };
    }

    return { allowed: true, remaining: Math.max(0, options.limit - result.count) };
  } catch {
    // D1 failure → fail open, let the memory check cover it
    return { allowed: true, remaining: 1 };
  }
}
