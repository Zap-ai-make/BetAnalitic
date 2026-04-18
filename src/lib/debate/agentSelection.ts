/**
 * Agent Selection for DebateArena
 * Story 8.2: Auto-select optimal debating agents
 */

export interface AgentProfile {
  id: string
  name: string
  color: string
  category: string
  expertise: string[]
  opposingCategories: string[]
}

export const DEBATE_AGENTS: AgentProfile[] = [
  {
    id: "scout",
    name: "Scout",
    color: "#00D9FF",
    category: "data",
    expertise: ["statistics", "trends", "form", "xG"],
    opposingCategories: ["intelligence", "tactics"],
  },
  {
    id: "insider",
    name: "Insider",
    color: "#9D4EDD",
    category: "intelligence",
    expertise: ["insider-info", "lineups", "morale", "injuries"],
    opposingCategories: ["data", "offense"],
  },
  {
    id: "goalmaster",
    name: "GoalMaster",
    color: "#FF006E",
    category: "offense",
    expertise: ["goals", "strikers", "attacking-stats", "over-markets"],
    opposingCategories: ["defense", "tactics"],
  },
  {
    id: "wallmaster",
    name: "WallMaster",
    color: "#06FFA5",
    category: "defense",
    expertise: ["clean-sheets", "defensive-stats", "under-markets", "goalkeepers"],
    opposingCategories: ["offense", "data"],
  },
  {
    id: "cornerking",
    name: "CornerKing",
    color: "#FFD60A",
    category: "specialist",
    expertise: ["corners", "set-pieces", "aerial-duels"],
    opposingCategories: ["data", "intelligence"],
  },
  {
    id: "oddstracker",
    name: "OddsTracker",
    color: "#FF9500",
    category: "markets",
    expertise: ["odds-movement", "value-betting", "market-analysis"],
    opposingCategories: ["intelligence", "specialist"],
  },
]

export interface DebateContext {
  matchId: string
  topic?: string
  marketType?: "goals" | "corners" | "cards" | "general"
  userPreference?: {
    agent1Id?: string
    agent2Id?: string
  }
}

/**
 * Select two optimal agents for a debate
 * Prioritizes opposing viewpoints and relevant expertise
 */
export function selectDebateAgents(context: DebateContext): {
  agent1: AgentProfile
  agent2: AgentProfile
  reason: string
} {
  // If user specified agents (Expert tier - Story 8.6)
  if (context.userPreference?.agent1Id && context.userPreference?.agent2Id) {
    const pref = context.userPreference
    const agent1 = DEBATE_AGENTS.find((a) => a.id === pref.agent1Id)
    const agent2 = DEBATE_AGENTS.find((a) => a.id === pref.agent2Id)

    if (agent1 && agent2) {
      return {
        agent1,
        agent2,
        reason: "Scénario personnalisé (Expert)",
      }
    }
  }

  // Market-specific selection
  if (context.marketType) {
    switch (context.marketType) {
      case "goals":
        return {
          agent1: DEBATE_AGENTS.find((a) => a.id === "goalmaster")!,
          agent2: DEBATE_AGENTS.find((a) => a.id === "wallmaster")!,
          reason: "Débat offense vs défense sur le marché des buts",
        }
      case "corners":
        return {
          agent1: DEBATE_AGENTS.find((a) => a.id === "cornerking")!,
          agent2: DEBATE_AGENTS.find((a) => a.id === "scout")!,
          reason: "Spécialiste corners vs analyse statistique",
        }
      default:
        break
    }
  }

  // Default: Scout vs Insider (data vs intelligence)
  return {
    agent1: DEBATE_AGENTS.find((a) => a.id === "scout")!,
    agent2: DEBATE_AGENTS.find((a) => a.id === "insider")!,
    reason: "Débat classique : données statistiques vs informations privilégiées",
  }
}

/**
 * Calculate disagreement rate between two agents
 * Used for selecting agents with historically opposing views
 */
export function calculateDisagreementRate(
  agent1Id: string,
  agent2Id: string
): number {
  // Placeholder: In real implementation, this would query historical data
  const opposingPairs = [
    ["scout", "insider"],
    ["goalmaster", "wallmaster"],
    ["cornerking", "scout"],
    ["oddstracker", "insider"],
  ]

  const isOpposingPair = opposingPairs.some(
    (pair) =>
      (pair[0] === agent1Id && pair[1] === agent2Id) ||
      (pair[1] === agent1Id && pair[0] === agent2Id)
  )

  return isOpposingPair ? 0.75 : 0.4 // 75% disagreement for opposing pairs, 40% otherwise
}
