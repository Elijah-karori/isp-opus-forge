/**
 * Client-side rate limiting utility for authentication endpoints.
 * 
 * SECURITY NOTE: This provides defense-in-depth UX protection against
 * rapid-fire requests. Server-side rate limiting is REQUIRED for actual security.
 * Client-side rate limiting can be bypassed by attackers.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute window
const BLOCK_DURATION_MS = 30 * 1000; // 30 second block after max attempts
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean old entries every 5 minutes

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the rate limit (e.g., 'login', 'forgot-password')
 * @returns Object with isLimited flag and remaining time if blocked
 */
export function checkRateLimit(key: string): { isLimited: boolean; remainingMs: number; attemptsLeft: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return { isLimited: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  // Check if currently blocked
  if (entry.blockedUntil > now) {
    return {
      isLimited: true,
      remainingMs: entry.blockedUntil - now,
      attemptsLeft: 0
    };
  }

  // Reset if window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitStore.delete(key);
    return { isLimited: false, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };
  }

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  return { isLimited: false, remainingMs: 0, attemptsLeft };
}

/**
 * Record an attempt for rate limiting
 * @param key - Unique identifier for the rate limit
 * @param success - Whether the attempt was successful (resets on success)
 */
export function recordAttempt(key: string, success: boolean = false): void {
  const now = Date.now();

  if (success) {
    // Clear rate limit on successful attempt
    rateLimitStore.delete(key);
    return;
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    // Start new window
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
      blockedUntil: 0
    });
    return;
  }

  // Increment attempts
  entry.attempts += 1;
  entry.lastAttempt = now;

  // Block if max attempts exceeded
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
  }

  rateLimitStore.set(key, entry);
}

/**
 * Get human-readable time remaining
 */
export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Clear rate limit for a specific key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// Periodic cleanup of expired entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.lastAttempt > WINDOW_MS && entry.blockedUntil < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}
