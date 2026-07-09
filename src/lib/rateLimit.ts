interface TokenBucket {
  tokens: number;
  lastRefillTime: number;
}

const store = new Map<string, TokenBucket>();

interface RateLimitConfig {
  maxRequests: number; // Max capacity
  refillRate: number; // Tokens added per second
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10,
  refillRate: 1, // 1 request per second
};

export function rateLimit(identifier: string, config: RateLimitConfig = defaultConfig): boolean {
  const now = Date.now();
  const bucket = store.get(identifier);

  if (!bucket) {
    store.set(identifier, {
      tokens: config.maxRequests - 1,
      lastRefillTime: now,
    });
    return true; // Allowed
  }

  const timePassedSecs = (now - bucket.lastRefillTime) / 1000;
  const newTokens = Math.floor(timePassedSecs * config.refillRate);
  
  if (newTokens > 0) {
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + newTokens);
    bucket.lastRefillTime = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // Allowed
  }

  return false; // Rate limited
}
