import { agentRegistry } from "./registry"
import { betanalyticAgentClient } from "./betanalyticClient"
import { ollamaClient } from "./llm/ollamaClient"
import { soulLoader } from "./soulLoader"
import { matchDataService } from "../services/matchDataService"

interface QueryContext {
  userId: string
  userToken?: string      // BetAnalytic api_key — required when matchId is provided
  matchId?: string
  homeTeam?: string       // Required by BetAnalytic when matchId is set
  awayTeam?: string
  competition?: string
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
  source: "betanalytic" | "ollama-local" | "fallback"
  confidence?: number
  keyInsights?: string[]
  warnings?: string | null
  dataCompleteness?: number
}

export class AgentOrchestrator {
  /**
   * Route a single-agent query.
   * Priority: BetAnalytic (if matchId + userToken) → local Ollama → error
   */
  async routeQuery(
    agentId: string,
    userQuery: string,
    context: QueryContext
  ): Promise<OrchestrationResult> {
    const startTime = Date.now()

    const agent = agentRegistry.getById(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    if (!agent.isEnabled) throw new Error(`Agent ${agentId} is currently disabled`)

    // ── BetAnalytic path ────────────────────────────────────────────────────
    const canUseBetAnalytic =
      context.matchId &&
      context.userToken &&
      context.homeTeam &&
      context.awayTeam &&
      betanalyticAgentClient.getHealthStatus()

    if (canUseBetAnalytic) {
      try {
        const result = await betanalyticAgentClient.invoke(context.userToken!, {
          matchId: context.matchId!,
          homeTeam: context.homeTeam!,
          awayTeam: context.awayTeam!,
          agentType: agent.betanalyticType,
          question: userQuery,
          competition: context.competition,
        })

        const latency = Date.now() - startTime
        console.log(`✅ Agent ${agentId} (BetAnalytic/${agent.betanalyticType}) in ${latency}ms`)

        return {
          agentId,
          response: result.content,
          latency,
          source: "betanalytic",
          confidence: result.confidence,
          keyInsights: result.keyInsights,
          warnings: result.warnings,
          dataCompleteness: result.dataCompleteness,
        }
      } catch (error) {
        console.error(`❌ BetAnalytic failed for ${agentId}, falling back to Ollama:`, error)
      }
    }

    // ── Ollama fallback ─────────────────────────────────────────────────────
    const soul = soulLoader.loadSoul(agentId)
    const systemPrompt = soulLoader.buildSystemPrompt(soul, context)

    let enrichedQuery = userQuery
    if (context.matchId) {
      const matchData = await matchDataService.getMatchData(context.matchId)
      if (matchData.data) {
        enrichedQuery += `\n\n[Context]\nHome: ${matchData.match.homeTeam.name}\nAway: ${matchData.match.awayTeam.name}\nCompetition: ${matchData.match.competition.name}`
      }
    }

    if (!ollamaClient.getHealthStatus()) {
      throw new Error("LLM service is currently unavailable (BetAnalytic + Ollama both failed)")
    }

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...(context.conversationHistory ?? []),
      { role: "user", content: enrichedQuery },
    ]

    const response = await ollamaClient.chat({
      model: "llama2",
      messages,
      options: { temperature: 0.7, top_p: 0.9, num_predict: 1000 },
    })

    const latency = Date.now() - startTime
    console.log(`✅ Agent ${agentId} (Ollama fallback) in ${latency}ms`)

    return { agentId, response, latency, source: "ollama-local" }
  }

  /**
   * Stream version — BetAnalytic doesn't support SSE yet so we simulate
   * streaming by yielding words progressively (see adapter-cote-vps.md §1).
   */
  async *routeQueryStream(
    agentId: string,
    userQuery: string,
    context: QueryContext
  ): AsyncGenerator<string, void, unknown> {
    const agent = agentRegistry.getById(agentId)
    if (!agent) throw new Error(`Agent ${agentId} not found`)
    if (!agent.isEnabled) throw new Error(`Agent ${agentId} is currently disabled`)

    const canUseBetAnalytic =
      context.matchId &&
      context.userToken &&
      context.homeTeam &&
      context.awayTeam &&
      betanalyticAgentClient.getHealthStatus()

    if (canUseBetAnalytic) {
      try {
        for await (const chunk of betanalyticAgentClient.invokeStream(context.userToken!, {
          matchId: context.matchId!,
          homeTeam: context.homeTeam!,
          awayTeam: context.awayTeam!,
          agentType: agent.betanalyticType,
          question: userQuery,
          competition: context.competition,
        })) {
          yield chunk
        }
        return
      } catch (error) {
        console.error(`❌ BetAnalytic stream failed for ${agentId}, falling back to Ollama:`, error)
      }
    }

    // Ollama streaming fallback
    const soul = soulLoader.loadSoul(agentId)
    const systemPrompt = soulLoader.buildSystemPrompt(soul, context)

    let enrichedQuery = userQuery
    if (context.matchId) {
      const matchData = await matchDataService.getMatchData(context.matchId)
      if (matchData.data) {
        enrichedQuery += `\n\n[Context]\nHome: ${matchData.match.homeTeam.name}\nAway: ${matchData.match.awayTeam.name}`
      }
    }

    if (!ollamaClient.getHealthStatus()) {
      throw new Error("LLM service unavailable")
    }

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...(context.conversationHistory ?? []),
      { role: "user", content: enrichedQuery },
    ]

    for await (const chunk of ollamaClient.chatStream({
      model: "llama2",
      messages,
      options: { temperature: 0.7, top_p: 0.9, num_predict: 1000 },
    })) {
      yield chunk
    }
  }

  async listAvailableModels(): Promise<Array<{ name: string; size: number }>> {
    return ollamaClient.listModels()
  }
}

export const agentOrchestrator = new AgentOrchestrator()
