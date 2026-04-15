/**
 * Agent Conversation Context
 * Story 4.16: Maintains context across agent interactions
 */

export interface ContextMessage {
  role: "user" | "agent"
  content: string
  agentId?: string
  timestamp: Date
}

export interface MatchContext {
  matchId: string
  homeTeam: string
  awayTeam: string
  competition: string
  date: Date
  status: "upcoming" | "live" | "finished"
}

export interface ConversationContext {
  id: string
  matchContext?: MatchContext
  messages: ContextMessage[]
  activeAgents: string[]
  createdAt: Date
  updatedAt: Date
}

// Maximum context messages to keep
const MAX_CONTEXT_MESSAGES = 10

// Maximum context age before reset (30 minutes)
const MAX_CONTEXT_AGE_MS = 30 * 60 * 1000

/**
 * Conversation Context Manager
 */
export class ConversationContextManager {
  private contexts = new Map<string, ConversationContext>()

  /**
   * Get or create context for a session
   */
  getContext(sessionId: string): ConversationContext {
    let context = this.contexts.get(sessionId)

    // Check if context is stale
    if (context) {
      const age = Date.now() - context.updatedAt.getTime()
      if (age > MAX_CONTEXT_AGE_MS) {
        this.contexts.delete(sessionId)
        context = undefined
      }
    }

    if (!context) {
      context = {
        id: sessionId,
        messages: [],
        activeAgents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.contexts.set(sessionId, context)
    }

    return context
  }

  /**
   * Set match context for a session
   */
  setMatchContext(sessionId: string, matchContext: MatchContext): void {
    const context = this.getContext(sessionId)
    context.matchContext = matchContext
    context.updatedAt = new Date()
  }

  /**
   * Add a message to context
   */
  addMessage(
    sessionId: string,
    role: "user" | "agent",
    content: string,
    agentId?: string
  ): void {
    const context = this.getContext(sessionId)

    context.messages.push({
      role,
      content,
      agentId,
      timestamp: new Date(),
    })

    // Keep only recent messages
    if (context.messages.length > MAX_CONTEXT_MESSAGES) {
      context.messages = context.messages.slice(-MAX_CONTEXT_MESSAGES)
    }

    // Track active agents
    if (agentId && !context.activeAgents.includes(agentId)) {
      context.activeAgents.push(agentId)
    }

    context.updatedAt = new Date()
  }

  /**
   * Get context summary for agent prompt
   */
  getContextSummary(sessionId: string): string {
    const context = this.getContext(sessionId)
    const parts: string[] = []

    // Add match context
    if (context.matchContext) {
      parts.push(
        `Match: ${context.matchContext.homeTeam} vs ${context.matchContext.awayTeam} (${context.matchContext.competition})`
      )
    }

    // Add recent conversation
    if (context.messages.length > 0) {
      parts.push("Conversation récente:")
      const recentMessages = context.messages.slice(-5)
      for (const msg of recentMessages) {
        const prefix = msg.role === "user" ? "User" : msg.agentId ?? "Agent"
        parts.push(`- ${prefix}: ${msg.content.slice(0, 100)}...`)
      }
    }

    return parts.join("\n")
  }

  /**
   * Clear context for a session
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId)
  }

  /**
   * Check if context has relevant history
   */
  hasHistory(sessionId: string): boolean {
    const context = this.contexts.get(sessionId)
    return !!context && context.messages.length > 0
  }
}

// Singleton instance
let _manager: ConversationContextManager | null = null

export function getContextManager(): ConversationContextManager {
  if (!_manager) {
    _manager = new ConversationContextManager()
  }
  return _manager
}
