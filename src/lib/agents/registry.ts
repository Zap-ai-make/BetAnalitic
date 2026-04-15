import type { AgentMetadata, AgentCategory } from "./types"

/**
 * Agent Registry - Centralized store for all agent configurations
 */
export class AgentRegistry {
  private agents = new Map<string, AgentMetadata>()

  /**
   * Register an agent
   */
  register(agent: AgentMetadata): void {
    this.validateAgent(agent)
    this.agents.set(agent.id, agent)
  }

  /**
   * Register multiple agents
   */
  registerMany(agents: AgentMetadata[]): void {
    agents.forEach((agent) => this.register(agent))
  }

  /**
   * Get all agents
   */
  getAll(): AgentMetadata[] {
    return Array.from(this.agents.values()).sort((a, b) => a.order - b.order)
  }

  /**
   * Get agent by ID
   */
  getById(id: string): AgentMetadata | null {
    return this.agents.get(id) ?? null
  }

  /**
   * Get agents by category
   */
  getByCategory(category: AgentCategory): AgentMetadata[] {
    return this.getAll().filter((agent) => agent.category === category)
  }

  /**
   * Get enabled agents only
   */
  getEnabled(): AgentMetadata[] {
    return this.getAll().filter((agent) => agent.isEnabled)
  }

  /**
   * Check if agent exists
   */
  has(id: string): boolean {
    return this.agents.has(id)
  }

  /**
   * Get agent count
   */
  count(): number {
    return this.agents.size
  }

  /**
   * Validate agent configuration
   */
  private validateAgent(agent: AgentMetadata): void {
    if (!agent.id) {
      throw new Error("Agent ID is required")
    }

    if (!agent.name) {
      throw new Error(`Agent ${agent.id}: name is required`)
    }

    if (!agent.category) {
      throw new Error(`Agent ${agent.id}: category is required`)
    }

    // Check kebab-case format
    if (!/^[a-z0-9-]+$/.test(agent.id)) {
      throw new Error(
        `Agent ${agent.id}: ID must be kebab-case (lowercase letters, numbers, and hyphens only)`
      )
    }

    // Check color format
    if (agent.color && !/^#[0-9A-Fa-f]{6}$/.test(agent.color)) {
      console.warn(
        `Agent ${agent.id}: color should be hex format (#RRGGBB), got ${agent.color}`
      )
    }
  }

  /**
   * Clear all agents (for testing)
   */
  clear(): void {
    this.agents.clear()
  }
}

/**
 * Default agents configuration
 */
const DEFAULT_AGENTS: AgentMetadata[] = [
  // Data Category
  {
    id: "data-scout",
    name: "Data Scout",
    description: "Statistiques et données des matchs",
    color: "#00D4FF",
    emoji: "📊",
    category: "Data",
    soulPath: "/agents/data-scout/SOUL.md",
    isEnabled: true,
    order: 1,
    expertise: ["Stats équipes", "Historique H2H", "Forme récente"],
    examples: ["Stats de PSG vs Marseille", "Buts marqués par Lyon à domicile"],
  },
  {
    id: "terrain-tracker",
    name: "Terrain Tracker",
    description: "Conditions terrain, météo, stade",
    color: "#10B981",
    emoji: "📍",
    category: "Data",
    soulPath: "/agents/terrain-tracker/SOUL.md",
    isEnabled: true,
    order: 2,
    expertise: ["Météo match", "État pelouse", "Capacité stade"],
    examples: ["Météo pour le match de demain", "État du terrain au Parc des Princes"],
  },

  // Analyse Category
  {
    id: "value-hunter",
    name: "Value Hunter",
    description: "Détection de value bets",
    color: "#F59E0B",
    emoji: "💰",
    category: "Analyse",
    soulPath: "/agents/value-hunter/SOUL.md",
    isEnabled: true,
    order: 3,
    expertise: ["Value bets", "Cotes sous-évaluées", "Edge betting"],
    examples: ["Y a-t-il une value sur ce match?", "Analyse value PSG @1.50"],
  },
  {
    id: "pattern-analyst",
    name: "Pattern Analyst",
    description: "Analyse des patterns récurrents",
    color: "#8B5CF6",
    emoji: "🎯",
    category: "Analyse",
    soulPath: "/agents/pattern-analyst/SOUL.md",
    isEnabled: true,
    order: 4,
    expertise: ["Patterns récurrents", "Tendances saisonnières", "Séquences"],
    examples: ["Patterns de Monaco cette saison", "Tendances buts en 2ème MT"],
  },

  // Marché Category
  {
    id: "odds-oracle",
    name: "Odds Oracle",
    description: "Suivi des cotes et mouvements",
    color: "#EC4899",
    emoji: "📈",
    category: "Marché",
    soulPath: "/agents/odds-oracle/SOUL.md",
    isEnabled: true,
    order: 5,
    expertise: ["Cotes actuelles", "Mouvements de ligne", "Comparaison bookmakers"],
    examples: ["Cotes PSG vs OM", "Mouvement de la cote Lille"],
  },
  {
    id: "market-pulse",
    name: "Market Pulse",
    description: "Tendances du marché",
    color: "#14B8A6",
    emoji: "💹",
    category: "Marché",
    soulPath: "/agents/market-pulse/SOUL.md",
    isEnabled: true,
    order: 6,
    expertise: ["Volume de paris", "Tendances marché", "Consensus public"],
    examples: ["Où mise le public?", "Volume de paris sur ce match"],
  },

  // Intel Category
  {
    id: "insider-intel",
    name: "Insider Intel",
    description: "News et informations d'équipe",
    color: "#F97316",
    emoji: "🔍",
    category: "Intel",
    soulPath: "/agents/insider-intel/SOUL.md",
    isEnabled: true,
    order: 7,
    expertise: ["Blessures", "Suspensions", "Compos probables"],
    examples: ["Absents pour PSG?", "Compo probable de Lyon"],
  },
  {
    id: "social-sentinel",
    name: "Social Sentinel",
    description: "Veille réseaux sociaux",
    color: "#6366F1",
    emoji: "📱",
    category: "Intel",
    soulPath: "/agents/social-sentinel/SOUL.md",
    isEnabled: true,
    order: 8,
    expertise: ["Réseaux sociaux", "Sentiment fans", "Rumeurs"],
    examples: ["Ambiance vestiaire Monaco?", "Sentiment sur Twitter"],
  },

  // Live Category
  {
    id: "live-pulse",
    name: "Live Pulse",
    description: "Analyse en temps réel",
    color: "#EF4444",
    emoji: "⚡",
    category: "Live",
    soulPath: "/agents/live-pulse/SOUL.md",
    isEnabled: true,
    order: 9,
    expertise: ["Stats live", "xG temps réel", "Possession"],
    examples: ["Stats live du match", "xG actuel?"],
  },
  {
    id: "momentum-meter",
    name: "Momentum Meter",
    description: "Suivi du momentum",
    color: "#84CC16",
    emoji: "🔥",
    category: "Live",
    soulPath: "/agents/momentum-meter/SOUL.md",
    isEnabled: true,
    order: 10,
    expertise: ["Momentum équipe", "Dynamique de jeu", "Pression"],
    examples: ["Qui domine actuellement?", "Momentum en 2ème période"],
  },
]

/**
 * Singleton instance
 */
let _registry: AgentRegistry | null = null

export function getAgentRegistry(): AgentRegistry {
  if (!_registry) {
    _registry = new AgentRegistry()
    _registry.registerMany(DEFAULT_AGENTS)
  }
  return _registry
}

// Export singleton instance for easier imports
export const agentRegistry = getAgentRegistry()
