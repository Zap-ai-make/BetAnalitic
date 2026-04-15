/**
 * Rate Limiting & Anti-Bot Detection
 * Story 4.11: Protects platform from abuse
 */

export type UserTier = "free" | "premium" | "unlimited"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  softLimit?: number
}

const TIER_LIMITS: Record<UserTier, RateLimitConfig> = {
  free: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  premium: {
    maxRequests: 200,
    softLimit: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  unlimited: {
    maxRequests: Infinity,
    windowMs: 24 * 60 * 60 * 1000,
  },
}

// In-memory store (use Redis in production)
const requestStore = new Map<
  string,
  { count: number; windowStart: number; lastRequest: number }
>()

// Bot detection thresholds
const BOT_DETECTION = {
  minRequestInterval: 500, // ms - faster than human
  burstThreshold: 5, // requests in burst window
  burstWindowMs: 2000, // 2 seconds
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  isWarning: boolean
  isBotSuspected: boolean
  shouldShowCaptcha: boolean
  message?: string
}

/**
 * Check if request pattern suggests bot behavior
 */
function detectBotBehavior(
  userId: string,
  currentTime: number
): { isSuspicious: boolean; reason?: string } {
  const userData = requestStore.get(userId)
  if (!userData) return { isSuspicious: false }

  const timeSinceLastRequest = currentTime - userData.lastRequest

  // Check for impossibly fast requests
  if (timeSinceLastRequest < BOT_DETECTION.minRequestInterval) {
    return { isSuspicious: true, reason: "rapid_requests" }
  }

  return { isSuspicious: false }
}

/**
 * Check rate limit for a user
 */
export function checkRateLimit(
  userId: string,
  tier: UserTier = "free"
): RateLimitResult {
  const config = TIER_LIMITS[tier]
  const now = Date.now()

  // Get or initialize user data
  let userData = requestStore.get(userId)
  if (!userData || now - userData.windowStart >= config.windowMs) {
    userData = { count: 0, windowStart: now, lastRequest: 0 }
    requestStore.set(userId, userData)
  }

  // Check for bot behavior
  const botCheck = detectBotBehavior(userId, now)

  // Calculate reset time
  const resetAt = new Date(userData.windowStart + config.windowMs)

  // Check if over limit
  if (userData.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      isWarning: false,
      isBotSuspected: botCheck.isSuspicious,
      shouldShowCaptcha: botCheck.isSuspicious,
      message:
        tier === "free"
          ? "Limite quotidienne atteinte. Passez Premium pour plus d'analyses."
          : "Limite quotidienne atteinte. Réessayez demain.",
    }
  }

  // Increment counter
  userData.count++
  userData.lastRequest = now
  requestStore.set(userId, userData)

  const remaining = config.maxRequests - userData.count

  // Check for soft limit warning
  const isWarning =
    config.softLimit !== undefined && userData.count >= config.softLimit

  return {
    allowed: true,
    remaining,
    resetAt,
    isWarning,
    isBotSuspected: botCheck.isSuspicious,
    shouldShowCaptcha: botCheck.isSuspicious,
    message: isWarning
      ? `Attention: ${remaining} analyses restantes aujourd'hui.`
      : undefined,
  }
}

/**
 * Get current usage stats for a user
 */
export function getUsageStats(
  userId: string,
  tier: UserTier = "free"
): {
  used: number
  limit: number
  remaining: number
  resetAt: Date
} {
  const config = TIER_LIMITS[tier]
  const userData = requestStore.get(userId)

  if (!userData) {
    return {
      used: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    }
  }

  const remaining = Math.max(0, config.maxRequests - userData.count)

  return {
    used: userData.count,
    limit: config.maxRequests,
    remaining,
    resetAt: new Date(userData.windowStart + config.windowMs),
  }
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(userId: string): void {
  requestStore.delete(userId)
}

/**
 * Log bot detection incident
 */
export function logBotIncident(
  userId: string,
  reason: string,
  metadata?: Record<string, unknown>
): void {
  console.warn("[BOT_DETECTION]", {
    userId,
    reason,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}
