/**
 * Agent system types
 */

export type AgentCategory = "Data" | "Analyse" | "Marché" | "Intel" | "Live"

export interface AgentHistoricalAccuracy {
  overallAccuracy: number // 0-100 (overall prediction accuracy)
  recentForm: number // 0-100 (last 30 days accuracy)
  predictionBreakdown: {
    result: number // Match outcome accuracy
    goals: number // Goals market accuracy
    corners: number // Corners market accuracy
    cards: number // Cards market accuracy
  }
  totalPredictions: number // Total predictions made
}

export interface AgentMetadata {
  id: string // kebab-case: "data-scout"
  name: string // Display name: "Data Scout"
  description: string // Brief purpose
  color: string // Hex color for UI theming
  emoji: string // Emoji icon
  category: AgentCategory
  soulPath: string // Path to SOUL.md file
  isEnabled: boolean
  order: number // Display order within category
  expertise?: string[] // Areas of expertise
  examples?: string[] // Example queries
  historicalAccuracy?: AgentHistoricalAccuracy // Historical prediction accuracy
}

export interface AgentCapability {
  name: string
  description: string
}

export interface AgentResponse {
  agentId: string
  content: string
  sources?: AgentSource[]
  confidence?: number // 0-100
  processingTime?: number // ms
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
