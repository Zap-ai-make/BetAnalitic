/**
 * BetAnalytic Agent Client
 * Replaces OpenClaw — routes agent calls through BetAnalytic FastAPI.
 */

import {
  betaFetch,
  type BetaAnalyzeResponse,
  type BetaAnalyzeFullResponse,
} from "../betanalytic"

export interface BetaAgentRequest {
  matchId: string
  homeTeam: string
  awayTeam: string
  agentType: string        // BetAnalytic agent type: FORM, H2H, PREDICT, etc.
  question?: string
  competition?: string
}

export interface BetaAgentResult {
  content: string
  confidence: number
  keyInsights: string[]
  warnings: string | null
  processingTimeSeconds: number
  dataCompleteness: number
}

export interface BetaAgentFullResult {
  mainPrediction: string
  averageConfidence: number
  topInsights: string[]
  riskLevel: string
  valueFound: string | null
  agentsResults: Record<string, BetaAgentResult>
  dataCompleteness: number
}

export class BetAnalyticAgentClient {
  private isHealthy = false

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(
        `${process.env.BETANALYTIC_API_URL ?? ""}/health`,
        { signal: AbortSignal.timeout(5000) }
      )
      this.isHealthy = res.ok
      if (res.ok) console.log("✅ BetAnalytic API healthy")
      else console.error("❌ BetAnalytic health check failed:", res.statusText)
      return res.ok
    } catch (err) {
      this.isHealthy = false
      console.error("❌ BetAnalytic connection error:", err)
      return false
    }
  }

  getHealthStatus(): boolean {
    return this.isHealthy
  }

  /**
   * Invoke a single agent on a specific match.
   */
  async invoke(userToken: string, req: BetaAgentRequest): Promise<BetaAgentResult> {
    const params = new URLSearchParams({
      home_team: req.homeTeam,
      away_team: req.awayTeam,
      ...(req.competition ? { competition: req.competition } : {}),
    })

    const res = await betaFetch(
      `/api/matches/${req.matchId}/analyze?${params.toString()}`,
      userToken,
      {
        method: "POST",
        body: JSON.stringify({
          agent_type: req.agentType,
          question: req.question ?? "",
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`BetAnalytic agent invoke failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as BetaAnalyzeResponse
    return this.mapAnalyzeResponse(data)
  }

  /**
   * Invoke multiple agents (or all tier agents) on a match.
   */
  async invokeMulti(
    userToken: string,
    req: BetaAgentRequest,
    agents?: string[]
  ): Promise<BetaAgentFullResult> {
    const params = new URLSearchParams({
      home_team: req.homeTeam,
      away_team: req.awayTeam,
      ...(req.competition ? { competition: req.competition } : {}),
    })

    const res = await betaFetch(
      `/api/matches/${req.matchId}/analyze-full?${params.toString()}`,
      userToken,
      {
        method: "POST",
        body: JSON.stringify({
          question: req.question ?? "",
          agents: agents ?? null,
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`BetAnalytic analyze-full failed (${res.status}): ${body}`)
    }

    const data = (await res.json()) as BetaAnalyzeFullResponse
    return this.mapFullResponse(data)
  }

  /**
   * Invoke a single agent and simulate SSE streaming.
   * BetAnalytic doesn't support streaming yet — we fetch the full response
   * and yield it as a single chunk so the SSE contract is maintained.
   * Replace this with a real streaming call once VPS supports it.
   */
  async *invokeStream(
    userToken: string,
    req: BetaAgentRequest
  ): AsyncGenerator<string, void, unknown> {
    const result = await this.invoke(userToken, req)
    // Emit words progressively to preserve the typing effect until real SSE is available
    const words = result.content.split(" ")
    for (const word of words) {
      yield word + " "
    }
  }

  startHealthChecks(): void {
    void this.healthCheck()
    setInterval(() => void this.healthCheck(), 30_000)
  }

  private mapAnalyzeResponse(data: BetaAnalyzeResponse): BetaAgentResult {
    return {
      content: data.content,
      confidence: data.confidence,
      keyInsights: data.key_insights ?? [],
      warnings: data.warnings,
      processingTimeSeconds: data.processing_time_seconds,
      dataCompleteness: data.data_completeness_pct,
    }
  }

  private mapFullResponse(data: BetaAnalyzeFullResponse): BetaAgentFullResult {
    const agentsResults: Record<string, BetaAgentResult> = {}
    for (const [type, result] of Object.entries(data.agents_results)) {
      agentsResults[type] = this.mapAnalyzeResponse(result)
    }
    return {
      mainPrediction: data.consensus.main_prediction,
      averageConfidence: data.consensus.average_confidence,
      topInsights: data.consensus.top_insights,
      riskLevel: data.consensus.risk_level,
      valueFound: data.consensus.value_found,
      agentsResults,
      dataCompleteness: data.data_completeness_pct,
    }
  }
}

export const betanalyticAgentClient = new BetAnalyticAgentClient()
betanalyticAgentClient.startHealthChecks()
