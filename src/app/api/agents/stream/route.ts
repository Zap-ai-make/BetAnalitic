import { type NextRequest } from "next/server"
import { agentOrchestrator } from "~/lib/agents/orchestrator"
import { getServerAuthSession } from "~/server/auth"

interface StreamRequest {
  agentId: string
  query: string
  matchId?: string
  conversationHistory?: Array<{
    role: "system" | "user" | "assistant"
    content: string
  }>
}

/**
 * POST /api/agents/stream
 * Stream agent responses via Server-Sent Events
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerAuthSession()
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Parse request body
    const body = (await req.json()) as StreamRequest

    if (!body.agentId || !body.query) {
      return new Response("Missing agentId or query", { status: 400 })
    }

    // Create SSE stream
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`)
          )

          // Stream tokens from agent
          for await (const chunk of agentOrchestrator.routeQueryStream(
            body.agentId,
            body.query,
            {
              userId: session.user.id,
              matchId: body.matchId,
              conversationHistory: body.conversationHistory,
            }
          )) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`
              )
            )
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          )

          controller.close()
        } catch (error) {
          console.error("❌ Stream error:", error)

          // Send error event
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
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    })
  } catch (error) {
    console.error("❌ Stream endpoint error:", error)

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
