import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface InvokeRequest {
  agentId: string
  query: string
  matchId?: string
  homeTeam?: string
  awayTeam?: string
  competition?: string
  conversationHistory?: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
}

/**
 * POST /api/agents/invoke
 * Routes to BetAnalytic API (primary) or Ollama (fallback).
 */
export async function POST(req: NextRequest) {
  try {
    const { getServerAuthSession } = await import("~/server/auth")
    const { agentOrchestrator } = await import("~/lib/agents/orchestrator")
    const { db } = await import("~/server/db")

    const session = await getServerAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as InvokeRequest
    if (!body.agentId || !body.query) {
      return NextResponse.json({ error: "Missing agentId or query" }, { status: 400 })
    }

    // Fetch BetAnalytic api_key stored at signup
    const userRecord = await db.user.findUnique({
      where: { id: session.user.id },
      select: { betanalyticApiKey: true },
    })

    const result = await agentOrchestrator.routeQuery(body.agentId, body.query, {
      userId: session.user.id,
      userToken: userRecord?.betanalyticApiKey ?? undefined,
      matchId: body.matchId,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      competition: body.competition,
      conversationHistory: body.conversationHistory,
    })

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      response: result.response,
      model: result.model,
      latency: result.latency,
      source: result.source,
      confidence: result.confidence,
      keyInsights: result.keyInsights,
      warnings: result.warnings,
      dataCompleteness: result.dataCompleteness,
    })
  } catch (error) {
    console.error("❌ Invoke endpoint error:", error)
    return NextResponse.json(
      {
        error: "Failed to invoke agent",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
