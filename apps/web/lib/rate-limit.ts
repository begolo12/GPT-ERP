/**
 * Simple in-memory rate limiter
 * Production: pakai Upstash Ratelimit atau Vercel KV
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  limit: number; // max requests
  windowMs: number; // window in milliseconds
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.limit - 1, resetIn: config.windowMs };
  }

  if (bucket.count >= config.limit) {
    return { allowed: false, remaining: 0, resetIn: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: config.limit - bucket.count, resetIn: bucket.resetAt - now };
}

// Cleanup old buckets periodically (best-effort)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 60_000).unref?.();
}