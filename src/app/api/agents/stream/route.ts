import { type NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface StreamRequest {
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
 * POST /api/agents/stream
 * Streams agent responses as SSE.
 * BetAnalytic doesn't support streaming yet — the orchestrator simulates it
 * by yielding words progressively (see adapter-cote-vps.md §1).
 */
export async function POST(req: NextRequest) {
  try {
    const { getServerAuthSession } = await import("~/server/auth")
    const { agentOrchestrator } = await import("~/lib/agents/orchestrator")
    const { db } = await import("~/server/db")

    const session = await getServerAuthSession()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = (await req.json()) as StreamRequest
    if (!body.agentId || !body.query) {
      return new Response("Missing agentId or query", { status: 400 })
    }

    const userRecord = await db.user.findUnique({
      where: { id: session.user.id },
      select: { betanalyticApiKey: true },
    })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`))

          for await (const chunk of agentOrchestrator.routeQueryStream(body.agentId, body.query, {
            userId: session.user.id,
            userToken: userRecord?.betanalyticApiKey ?? undefined,
            matchId: body.matchId,
            homeTeam: body.homeTeam,
            awayTeam: body.awayTeam,
            competition: body.competition,
            conversationHistory: body.conversationHistory,
          })) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`)
            )
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`))
          controller.close()
        } catch (error) {
          console.error("❌ Stream error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : String(error) })}\n\n`
            )
          )
          controller.close()
        }
      },
      cancel() {
        console.log("🔌 Client disconnected from stream")
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    console.error("❌ Stream endpoint error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
