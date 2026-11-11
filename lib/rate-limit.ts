const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitWindow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: Math.max(0, current.resetAt - now) };
  }

  current.count += 1;
  buckets.set(key, current);
  return { allowed: true, remaining: limit - current.count, resetMs: Math.max(0, current.resetAt - now) };
}
