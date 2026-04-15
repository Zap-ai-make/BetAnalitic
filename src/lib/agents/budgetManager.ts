/**
 * LLM Fallback Budget Manager
 * Story 4.20: Manages LLM usage costs and budget limits
 */

export type LLMProvider = "ollama" | "openai" | "anthropic" | "mistral"

interface ProviderConfig {
  name: string
  costPer1kTokens: number // in cents
  maxTokensPerRequest: number
  priority: number // lower = higher priority
  isLocal: boolean
}

const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  ollama: {
    name: "Ollama (Local)",
    costPer1kTokens: 0,
    maxTokensPerRequest: 4096,
    priority: 1,
    isLocal: true,
  },
  mistral: {
    name: "Mistral AI",
    costPer1kTokens: 0.2,
    maxTokensPerRequest: 8192,
    priority: 2,
    isLocal: false,
  },
  openai: {
    name: "OpenAI GPT-4",
    costPer1kTokens: 3,
    maxTokensPerRequest: 8192,
    priority: 3,
    isLocal: false,
  },
  anthropic: {
    name: "Anthropic Claude",
    costPer1kTokens: 1.5,
    maxTokensPerRequest: 100000,
    priority: 4,
    isLocal: false,
  },
}

interface UsageRecord {
  provider: LLMProvider
  tokensUsed: number
  costCents: number
  timestamp: Date
}

interface BudgetLimits {
  dailyBudgetCents: number
  monthlyBudgetCents: number
  maxCostPerRequestCents: number
}

const DEFAULT_LIMITS: BudgetLimits = {
  dailyBudgetCents: 500, // $5/day
  monthlyBudgetCents: 10000, // $100/month
  maxCostPerRequestCents: 50, // $0.50 max per request
}

/**
 * LLM Budget Manager
 */
export class LLMBudgetManager {
  private usageRecords: UsageRecord[] = []
  private limits: BudgetLimits

  constructor(limits: Partial<BudgetLimits> = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits }
  }

  /**
   * Get the best provider based on budget and availability
   */
  selectProvider(
    estimatedTokens: number,
    preferLocal = true
  ): LLMProvider | null {
    const availableProviders = this.getAvailableProviders()

    if (availableProviders.length === 0) {
      return null
    }

    // Sort by priority (prefer local/cheap)
    const sorted = availableProviders.sort((a, b) => {
      if (preferLocal) {
        if (PROVIDER_CONFIGS[a].isLocal && !PROVIDER_CONFIGS[b].isLocal) {
          return -1
        }
        if (!PROVIDER_CONFIGS[a].isLocal && PROVIDER_CONFIGS[b].isLocal) {
          return 1
        }
      }
      return PROVIDER_CONFIGS[a].priority - PROVIDER_CONFIGS[b].priority
    })

    // Find first provider within budget
    for (const provider of sorted) {
      const estimatedCost = this.estimateCost(provider, estimatedTokens)
      if (estimatedCost <= this.limits.maxCostPerRequestCents) {
        return provider
      }
    }

    // Return cheapest option if nothing fits
    return sorted[0] ?? null
  }

  /**
   * Get providers that are within budget
   */
  getAvailableProviders(): LLMProvider[] {
    const dailyUsage = this.getDailyUsage()
    const monthlyUsage = this.getMonthlyUsage()

    const available: LLMProvider[] = []

    for (const provider of Object.keys(PROVIDER_CONFIGS) as LLMProvider[]) {
      const config = PROVIDER_CONFIGS[provider]

      // Local providers are always available
      if (config.isLocal) {
        available.push(provider)
        continue
      }

      // Check budget constraints
      if (
        dailyUsage < this.limits.dailyBudgetCents &&
        monthlyUsage < this.limits.monthlyBudgetCents
      ) {
        available.push(provider)
      }
    }

    return available
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(provider: LLMProvider, tokens: number): number {
    const config = PROVIDER_CONFIGS[provider]
    return Math.ceil((tokens / 1000) * config.costPer1kTokens)
  }

  /**
   * Record usage after a request
   */
  recordUsage(provider: LLMProvider, tokensUsed: number): void {
    const costCents = this.estimateCost(provider, tokensUsed)

    this.usageRecords.push({
      provider,
      tokensUsed,
      costCents,
      timestamp: new Date(),
    })

    // Clean old records (keep last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    this.usageRecords = this.usageRecords.filter(
      (r) => r.timestamp >= thirtyDaysAgo
    )
  }

  /**
   * Get today's usage in cents
   */
  getDailyUsage(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.usageRecords
      .filter((r) => r.timestamp >= today)
      .reduce((sum, r) => sum + r.costCents, 0)
  }

  /**
   * Get this month's usage in cents
   */
  getMonthlyUsage(): number {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    return this.usageRecords
      .filter((r) => r.timestamp >= monthStart)
      .reduce((sum, r) => sum + r.costCents, 0)
  }

  /**
   * Get remaining budget info
   */
  getBudgetStatus(): {
    dailyRemaining: number
    monthlyRemaining: number
    isOverBudget: boolean
  } {
    const dailyUsage = this.getDailyUsage()
    const monthlyUsage = this.getMonthlyUsage()

    return {
      dailyRemaining: Math.max(0, this.limits.dailyBudgetCents - dailyUsage),
      monthlyRemaining: Math.max(
        0,
        this.limits.monthlyBudgetCents - monthlyUsage
      ),
      isOverBudget:
        dailyUsage >= this.limits.dailyBudgetCents ||
        monthlyUsage >= this.limits.monthlyBudgetCents,
    }
  }

  /**
   * Check if a request can be made
   */
  canMakeRequest(estimatedTokens: number): boolean {
    return this.selectProvider(estimatedTokens) !== null
  }
}

// Singleton instance
let _manager: LLMBudgetManager | null = null

export function getBudgetManager(): LLMBudgetManager {
  if (!_manager) {
    _manager = new LLMBudgetManager()
  }
  return _manager
}
