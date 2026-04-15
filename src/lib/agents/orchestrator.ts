import { agentRegistry } from "./registry"
import { openclawClient } from "./openclawClient"
import { ollamaClient } from "./llm/ollamaClient"
import { soulLoader } from "./soulLoader"
import { matchDataService } from "../services/matchDataService"

interface QueryContext {
  userId: string
  matchId?: string
  conversationHistory?: Array<{ role: "system" | "user" | "assistant"; content: string }>
  userPreferences?: {
    mode?: "analytical" | "supporter"
    expertiseLevel?: "beginner" | "intermediate" | "expert"
  }
}

interface OrchestrationResult {
  agentId: string
  response: string
  model?: string
  latency: number
  source: "openclaw" | "ollama-local" | "fallback"
}

export class AgentOrchestrator {
  private useOpenClaw = true // Toggle between OpenClaw (VPS) and local Ollama
  private defaultModel = "llama2"
  private modelMap: Record<string, string> = {
    // Data agents - fast responses
    scout: "llama2",
    analyst: "llama2",
    insider: "llama2",

    // Analysis agents - more sophisticated
    tactic: "mistral",
    context: "mistral",
    momentum: "mistral",

    // Market agents - precision
    wall: "llama2",
    goal: "llama2",
    corner: "llama2",
    card: "llama2",

    // Intel & Live - fast
    crowd: "llama2",
    live: "llama2",
    debate: "mistral",
    debrief: "mistral",
  }

  /**
   * Route query to specific agent
   */
  async routeQuery(
    agentId: string,
    userQuery: string,
    context: QueryContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now()

    // Validate agent exists
    const agent = agentRegistry.getById(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    if (!agent.isEnabled) {
      throw new Error(`Agent ${agentId} is currently disabled`)
    }

    // Try OpenClaw first if enabled
    if (this.useOpenClaw && openclawClient.getHealthStatus()) {
      try {
        const response = await openclawClient.invoke({
          agentId,
          query: userQuery,
          context: {
            userId: context.userId,
            matchId: context.matchId,
            conversationHistory: context.conversationHistory,
            userPreferences: context.userPreferences,
          },
        })

        const latency = Date.now() - startTime
        console.log(`✅ Agent ${agentId} (OpenClaw) responded in ${latency}ms`)

        return {
          agentId,
          response,
          latency,
          source: "openclaw",
        }
      } catch (error) {
        console.error(`❌ OpenClaw failed, falling back to local:`, error)
        // Fall through to local Ollama
      }
    }

    // Fallback to local Ollama

    // Load SOUL configuration
    const soul = soulLoader.loadSoul(agentId)

    // Build system prompt
    const systemPrompt = soulLoader.buildSystemPrompt(soul, context)

    // Enrich context with match data if matchId provided
    let enrichedQuery = userQuery
    if (context?.matchId) {
      const matchData = await matchDataService.getMatchData(context.matchId)
      if (matchData.data) {
        enrichedQuery = `${userQuery}\n\n[Context - Match Data Available]\n`
        enrichedQuery += `Home: ${matchData.match.homeTeam.name}\n`
        enrichedQuery += `Away: ${matchData.match.awayTeam.name}\n`
        enrichedQuery += `Competition: ${matchData.match.competition.name}\n`
      }
    }

    // Select model
    const model = this.modelMap[agentId] ?? this.defaultModel

    // Check Ollama health
    if (!ollamaClient.getHealthStatus()) {
      throw new Error("LLM service is currently unavailable")
    }

    try {
      // Build messages
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ]

      // Add conversation history if provided
      if (context?.conversationHistory) {
        messages.push(...context.conversationHistory)
      }

      // Add user query
      messages.push({ role: "user", content: enrichedQuery })

      // Generate response
      const response = await ollamaClient.chat({
        model,
        messages,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1000,
        },
      })

      const latency = Date.now() - startTime

      console.log(`✅ Agent ${agentId} (local Ollama) responded in ${latency}ms`)

      return {
        agentId,
        response,
        model,
        latency,
        source: "ollama-local",
      }
    } catch (error) {
      const latency = Date.now() - startTime
      console.error(`❌ Agent ${agentId} failed after ${latency}ms:`, error)
      throw error
    }
  }

  /**
   * Route query with streaming response
   */
  async *routeQueryStream(
    agentId: string,
    userQuery: string,
    context: QueryContext
  ): AsyncGenerator<string, void, unknown> {
    // Validate agent exists
    const agent = agentRegistry.getById(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    if (!agent.isEnabled) {
      throw new Error(`Agent ${agentId} is currently disabled`)
    }

    // Try OpenClaw first if enabled
    if (this.useOpenClaw && openclawClient.getHealthStatus()) {
      try {
        for await (const chunk of openclawClient.invokeStream({
          agentId,
          query: userQuery,
          context: {
            userId: context.userId,
            matchId: context.matchId,
            conversationHistory: context.conversationHistory,
            userPreferences: context.userPreferences,
          },
        })) {
          if (chunk.type === "token" && chunk.content) {
            yield chunk.content
          } else if (chunk.type === "error") {
            throw new Error(chunk.message ?? "OpenClaw streaming error")
          }
        }
        return
      } catch (error) {
        console.error(`❌ OpenClaw stream failed, falling back to local:`, error)
        // Fall through to local Ollama
      }
    }

    // Fallback to local Ollama streaming

    // Load SOUL configuration
    const soul = soulLoader.loadSoul(agentId)

    // Build system prompt
    const systemPrompt = soulLoader.buildSystemPrompt(soul, context)

    // Enrich context with match data if matchId provided
    let enrichedQuery = userQuery
    if (context?.matchId) {
      const matchData = await matchDataService.getMatchData(context.matchId)
      if (matchData.data) {
        enrichedQuery = `${userQuery}\n\n[Context - Match Data Available]\n`
        enrichedQuery += `Home: ${matchData.match.homeTeam.name}\n`
        enrichedQuery += `Away: ${matchData.match.awayTeam.name}\n`
        enrichedQuery += `Competition: ${matchData.match.competition.name}\n`
      }
    }

    // Select model
    const model = this.modelMap[agentId] ?? this.defaultModel

    // Check Ollama health
    if (!ollamaClient.getHealthStatus()) {
      throw new Error("LLM service is currently unavailable")
    }

    // Build messages
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ]

    // Add conversation history if provided
    if (context?.conversationHistory) {
      messages.push(...context.conversationHistory)
    }

    // Add user query
    messages.push({ role: "user", content: enrichedQuery })

    // Stream response
    for await (const chunk of ollamaClient.chatStream({
      model,
      messages,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1000,
      },
    })) {
      yield chunk
    }
  }

  /**
   * Get recommended model for agent
   */
  getModelForAgent(agentId: string): string {
    return this.modelMap[agentId] ?? this.defaultModel
  }

  /**
   * List available models
   */
  async listAvailableModels(): Promise<Array<{ name: string; size: number }>> {
    return ollamaClient.listModels()
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator()
