import { type NextRequest, NextResponse } from "next/server"
import { agentOrchestrator } from "~/lib/agents/orchestrator"
import { getServerAuthSession } from "~/server/auth"

interface InvokeRequest {
  agentId: string
  query: string
  matchId?: string
  conversationHistory?: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
}

/**
 * POST /api/agents/invoke
 * Invoke an agent (non-streaming)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = (await req.json()) as InvokeRequest

    if (!body.agentId || !body.query) {
      return NextResponse.json(
        { error: "Missing agentId or query" },
        { status: 400 }
      )
    }

    // TODO: Check rate limits based on user tier
    // For now, simple in-memory check could be added

    // Invoke agent
    const result = await agentOrchestrator.routeQuery(
      body.agentId,
      body.query,
      {
        userId: session.user.id,
        matchId: body.matchId,
        conversationHistory: body.conversationHistory,
      }
    )

    // TODO: Log invocation to database for history (Story 4.8)
    // await db.agentInvocation.create({
    //   data: {
    //     userId: session.user.id,
    //     agentId: body.agentId,
    //     query: body.query,
    //     response: result.response,
    //     matchId: body.matchId,
    //     latency: result.latency,
    //     model: result.model,
    //   },
    // })

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      response: result.response,
      model: result.model,
      latency: result.latency,
      source: result.source,
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
