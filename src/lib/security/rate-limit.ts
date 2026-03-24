const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

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
