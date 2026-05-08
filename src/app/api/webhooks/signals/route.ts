import { type NextRequest, NextResponse } from "next/server"
import { db } from "~/server/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface IncomingSignal {
  match_id: string
  home_team: string
  away_team: string
  competition: string
  prediction: string
  odds: number
  confidence: number
  reasoning: string
  agent_types: string[]
  expires_at: string
}

interface SignalsPayload {
  signals: IncomingSignal[]
}

/**
 * POST /api/webhooks/signals
 * Called by VPS every day at 08:00 UTC to push AI picks.
 * Validated via X-Internal-Secret header.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret")
  if (!secret || secret !== process.env.BETANALYTIC_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: SignalsPayload
  try {
    payload = (await req.json()) as SignalsPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const signals = payload.signals ?? []
  let created = 0
  let skipped = 0
  let errors = 0

  for (const sig of signals) {
    try {
      const match = await db.match.findUnique({
        where: { externalId: sig.match_id },
        select: { id: true },
      })

      if (!match) {
        console.warn(`⚠️  Signal for unknown match ${sig.match_id} — skipping`)
        skipped++
        continue
      }

      // Determine signalType from prediction
      const signalType =
        sig.prediction === "home" || sig.prediction === "draw" || sig.prediction === "away"
          ? "RESULT"
          : sig.prediction.startsWith("btts") || sig.prediction.includes("goals")
          ? "BTTS"
          : sig.prediction.includes("corner")
          ? "CORNERS"
          : sig.prediction.includes("card")
          ? "CARDS"
          : "RESULT"

      const pick = await db.aIPick.create({
        data: {
          matchId: match.id,
          signalType,
          agentType: sig.agent_types[0] ?? "FORM",
          prediction: sig.prediction,
          confidence: sig.confidence,
          reasoning: sig.reasoning,
          odds: sig.odds,
          expiresAt: new Date(sig.expires_at),
        },
      })

      // Create one AgentReport per agent_type
      if (sig.agent_types.length > 0) {
        await db.agentReport.createMany({
          data: sig.agent_types.map((type) => ({
            pickId: pick.id,
            agentType: type,
            analysis: sig.reasoning,
            confidence: sig.confidence,
            supports: true,
          })),
        })
      }

      created++
    } catch (err) {
      console.error(`❌ Failed to save signal for match ${sig.match_id}:`, err)
      errors++
    }
  }

  console.log(`📊 Signals webhook: ${created} created, ${skipped} skipped, ${errors} errors`)
  return NextResponse.json({ success: true, created, skipped, errors })
}
