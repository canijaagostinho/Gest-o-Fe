/**
 * In-Memory Rate Limiter - Camada 4 (OWASP A04: Insecure Design / A05: Security Misconfiguration)
 * Protects sensitive API endpoints from abuse, brute-force, and automated scraping attacks.
 * Uses a sliding window counter strategy per identifier (IP or user ID).
 *
 * For production deployments at scale, replace the in-memory store with Redis (ioredis).
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory store (replace with Redis in production for multi-instance deployments)
const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstRequest > 60_000) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

interface RateLimitOptions {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds (default: 60 seconds) */
  windowMs?: number;
  /** Human-readable error message */
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}

/**
 * Check if a given identifier has exceeded the rate limit.
 * @param identifier - A unique key (IP address, user ID, etc.)
 * @param options - Rate limiting configuration
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.firstRequest > windowMs) {
    // First request or window expired — start a new window
    store.set(identifier, { count: 1, firstRequest: now });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    const resetAt = entry.firstRequest + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      error:
        options.message ??
        `Demasiadas tentativas. Tente novamente em ${Math.ceil((resetAt - now) / 1000)} segundos.`,
    };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.firstRequest + windowMs,
  };
}

/**
 * Predefined rate limits for the GestãoFlex endpoints.
 */
export const RateLimits = {
  /** Auth endpoints: max 10 attempts per minute per IP */
  AUTH_LOGIN: { maxRequests: 10, windowMs: 60_000, message: "Muitas tentativas de login. Aguarde 1 minuto." },
  /** Password reset: max 5 per hour */
  PASSWORD_RESET: { maxRequests: 5, windowMs: 3_600_000, message: "Limite de redefinição de senha atingido." },
  /** Critical financial actions: max 30 per minute per user */
  FINANCIAL_ACTION: { maxRequests: 30, windowMs: 60_000, message: "Muitas operações financeiras em pouco tempo." },
  /** General API: max 100 per minute */
  GENERAL_API: { maxRequests: 100, windowMs: 60_000, message: "Limite de requisições atingido." },
} as const;
