/**
 * Story 6.11: Chat Rate Limiting
 * Client-side rate limiting for chat messages
 */

interface RateLimitConfig {
  maxMessages: number
  windowMs: number
  burstLimit: number
  burstWindowMs: number
}

const TIER_CONFIGS: Record<string, RateLimitConfig> = {
  free: {
    maxMessages: 20,
    windowMs: 60_000, // 1 minute
    burstLimit: 5,
    burstWindowMs: 10_000, // 10 seconds
  },
  premium: {
    maxMessages: 60,
    windowMs: 60_000,
    burstLimit: 15,
    burstWindowMs: 10_000,
  },
  pro: {
    maxMessages: 120,
    windowMs: 60_000,
    burstLimit: 30,
    burstWindowMs: 10_000,
  },
}

interface MessageTimestamp {
  timestamp: number
}

function getTierConfig(tier: string): RateLimitConfig {
  return TIER_CONFIGS[tier] ?? TIER_CONFIGS.free!
}

class ChatRateLimiter {
  private messages: MessageTimestamp[] = []
  private config: RateLimitConfig

  constructor(tier = "free") {
    this.config = getTierConfig(tier)
  }

  /**
   * Update tier configuration
   */
  setTier(tier: string): void {
    this.config = getTierConfig(tier)
  }

  /**
   * Check if a message can be sent
   */
  canSend(): { allowed: boolean; retryAfter?: number; reason?: string } {
    const now = Date.now()
    this.cleanup(now)

    // Check burst limit
    const burstStart = now - this.config.burstWindowMs
    const burstMessages = this.messages.filter((m) => m.timestamp > burstStart)

    if (burstMessages.length >= this.config.burstLimit) {
      const oldestBurst = burstMessages[0]
      const retryAfter = oldestBurst
        ? oldestBurst.timestamp + this.config.burstWindowMs - now
        : 1000

      return {
        allowed: false,
        retryAfter,
        reason: "Trop de messages envoyés rapidement. Attendez quelques secondes.",
      }
    }

    // Check window limit
    const windowStart = now - this.config.windowMs
    const windowMessages = this.messages.filter((m) => m.timestamp > windowStart)

    if (windowMessages.length >= this.config.maxMessages) {
      const oldestWindow = windowMessages[0]
      const retryAfter = oldestWindow
        ? oldestWindow.timestamp + this.config.windowMs - now
        : 1000

      return {
        allowed: false,
        retryAfter,
        reason: "Limite de messages atteinte. Réessayez dans une minute.",
      }
    }

    return { allowed: true }
  }

  /**
   * Record a sent message
   */
  recordMessage(): void {
    this.messages.push({ timestamp: Date.now() })
  }

  /**
   * Get remaining messages in current window
   */
  getRemainingMessages(): number {
    const now = Date.now()
    this.cleanup(now)

    const windowStart = now - this.config.windowMs
    const windowMessages = this.messages.filter((m) => m.timestamp > windowStart)

    return Math.max(0, this.config.maxMessages - windowMessages.length)
  }

  /**
   * Get time until rate limit resets
   */
  getResetTime(): number {
    if (this.messages.length === 0) return 0

    const oldest = this.messages[0]
    if (!oldest) return 0

    const resetAt = oldest.timestamp + this.config.windowMs
    return Math.max(0, resetAt - Date.now())
  }

  /**
   * Clean up old messages
   */
  private cleanup(now: number): void {
    const cutoff = now - this.config.windowMs
    this.messages = this.messages.filter((m) => m.timestamp > cutoff)
  }

  /**
   * Reset all limits
   */
  reset(): void {
    this.messages = []
  }
}

// Per-room rate limiters
const roomLimiters = new Map<string, ChatRateLimiter>()

export function getChatRateLimiter(
  roomId: string,
  tier = "free"
): ChatRateLimiter {
  let limiter = roomLimiters.get(roomId)

  if (!limiter) {
    limiter = new ChatRateLimiter(tier)
    roomLimiters.set(roomId, limiter)
  } else {
    limiter.setTier(tier)
  }

  return limiter
}

export function clearRoomLimiter(roomId: string): void {
  roomLimiters.delete(roomId)
}

export { ChatRateLimiter }
