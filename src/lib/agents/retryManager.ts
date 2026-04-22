/**
 * Retry & Fallback Mechanism
 * Story 4.12: Handles failed agent invocations with retry and fallback
 */

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}

// Errors that are considered transient (worth retrying)
const TRANSIENT_ERROR_CODES = [
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "NETWORK_ERROR",
  "TIMEOUT",
  "SERVICE_UNAVAILABLE",
  "TOO_MANY_REQUESTS",
]

export interface RetryState {
  attempt: number
  maxAttempts: number
  isRetrying: boolean
  lastError?: string
  fallbackAgent?: string
}

export interface InvocationResult<T> {
  success: boolean
  data?: T
  error?: string
  retryState: RetryState
  usedFallback: boolean
  fallbackAgentId?: string
}

/**
 * Check if an error is transient and worth retrying
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorCode = (error as Error & { code?: string }).code
    if (errorCode && TRANSIENT_ERROR_CODES.includes(errorCode)) {
      return true
    }

    const message = error.message.toLowerCase()
    return (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("unavailable") ||
      message.includes("rate limit")
    )
  }
  return false
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  )
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.round(delay + jitter)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Agent fallback mapping (BetAnalytic agent IDs)
 */
const AGENT_FALLBACKS: Record<string, string[]> = {
  scout: ["analyst"],
  analyst: ["scout", "stats"],
  historian: ["momentum"],
  momentum: ["historian"],
  motivation: ["momentum"],
  referee: [],
  stats: ["analyst"],
  odds: ["risk"],
  risk: ["odds"],
  social: ["motivation"],
  weather: [],
  lineup: ["scout"],
  predictor: ["advisor"],
  advisor: ["predictor"],
}

/**
 * Get fallback agents for a given agent
 */
export function getFallbackAgents(agentId: string): string[] {
  return AGENT_FALLBACKS[agentId] ?? []
}

/**
 * Execute with retry and fallback
 */
export async function executeWithRetry<T>(
  fn: (agentId: string) => Promise<T>,
  agentId: string,
  config: Partial<RetryConfig> = {},
  onRetry?: (state: RetryState) => void
): Promise<InvocationResult<T>> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  let lastError: string | undefined

  // Try primary agent with retries
  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1, fullConfig)
        onRetry?.({
          attempt,
          maxAttempts: fullConfig.maxRetries + 1,
          isRetrying: true,
          lastError,
        })
        await sleep(delay)
      }

      const data = await fn(agentId)
      return {
        success: true,
        data,
        retryState: {
          attempt,
          maxAttempts: fullConfig.maxRetries + 1,
          isRetrying: false,
        },
        usedFallback: false,
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error"

      // Only retry transient errors
      if (!isTransientError(error) || attempt === fullConfig.maxRetries) {
        break
      }
    }
  }

  // Try fallback agents
  const fallbacks = getFallbackAgents(agentId)
  for (const fallbackId of fallbacks) {
    try {
      const data = await fn(fallbackId)
      return {
        success: true,
        data,
        retryState: {
          attempt: fullConfig.maxRetries + 1,
          maxAttempts: fullConfig.maxRetries + 1,
          isRetrying: false,
        },
        usedFallback: true,
        fallbackAgentId: fallbackId,
      }
    } catch {
      // Continue to next fallback
    }
  }

  // All attempts failed
  return {
    success: false,
    error: lastError ?? "All agents failed",
    retryState: {
      attempt: fullConfig.maxRetries + 1,
      maxAttempts: fullConfig.maxRetries + 1,
      isRetrying: false,
      lastError,
    },
    usedFallback: false,
  }
}

/**
 * Create a retry handler hook state
 */
export interface UseRetryState {
  isRetrying: boolean
  retryCount: number
  lastError: string | null
  canRetry: boolean
}

export function createInitialRetryState(): UseRetryState {
  return {
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true,
  }
}
