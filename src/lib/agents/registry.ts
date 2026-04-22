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

let _registry: AgentRegistry | null = null

export function getAgentRegistry(): AgentRegistry {
  if (!_registry) {
    _registry = new AgentRegistry()
    // Agents are registered via index.ts from config.ts
  }
  return _registry
}

// Export singleton instance for easier imports
export const agentRegistry = getAgentRegistry()
