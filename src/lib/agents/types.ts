/**
 * Agent system types
 */

export type AgentCategory = "Data" | "Analyse" | "Marché" | "Intel" | "Synthèse"

export type AgentTier = "FREE" | "PREMIUM" | "EXPERT"

export interface AgentHistoricalAccuracy {
  overallAccuracy: number
  recentForm: number
  predictionBreakdown: {
    result: number
    goals: number
    corners: number
    cards: number
  }
  totalPredictions: number
}

export interface AgentMetadata {
  id: string               // kebab-case: "form-analyst"
  name: string             // Display name
  description: string
  color: string            // Hex
  emoji: string
  category: AgentCategory
  soulPath: string
  isEnabled: boolean
  order: number
  tier: AgentTier          // Minimum subscription tier required
  betanalyticType: string  // BetAnalytic API agent_type: FORM, H2H, PREDICT, etc.
  expertise?: string[]
  examples?: string[]
  historicalAccuracy?: AgentHistoricalAccuracy
}

export interface AgentCapability {
  name: string
  description: string
}

export interface AgentResponse {
  agentId: string
  content: string
  sources?: AgentSource[]
  confidence?: number       // 0-100
  keyInsights?: string[]
  warnings?: string | null
  dataCompleteness?: number // 0-100
  processingTime?: number   // ms
  metadata?: Record<string, unknown>
}

export interface AgentSource {
  type: "stat" | "news" | "odds" | "weather" | "social" | "historical"
  title: string
  url?: string
  timestamp?: Date
  confidence?: number
}

export interface AgentInvocation {
  id: string
  agentId: string
  userId: string
  matchId?: string
  query: string
  response: AgentResponse
  createdAt: Date
}
