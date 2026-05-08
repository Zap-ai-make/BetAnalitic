import { type NextRequest, NextResponse } from "next/server"
import { db } from "~/server/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

interface MatchResultPayload {
  match_id: string
  home_score: number
  away_score: number
  status: "FINISHED" | "POSTPONED" | "CANCELLED"
  result: "home" | "draw" | "away"
  btts: boolean
  total_goals: number
  correct_agent_types: string[]
}

/**
 * POST /api/webhooks/match-result
 * Called by VPS when a match ends (auto-detected from ESPN).
 * Updates match scores, settles AIPick.isCorrect.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret")
  if (!secret || secret !== process.env.BETANALYTIC_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: MatchResultPayload
  try {
    payload = (await req.json()) as MatchResultPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const match = await db.match.findUnique({
    where: { externalId: payload.match_id },
    include: { aiPicks: true },
  })

  if (!match) {
    console.warn(`⚠️  match-result for unknown match ${payload.match_id}`)
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  // Update match result
  await db.match.update({
    where: { id: match.id },
    data: {
      status: payload.status,
      homeScore: payload.home_score,
      awayScore: payload.away_score,
    },
  })

  // Settle each AIPick
  const picks = match.aiPicks
  if (picks.length > 0) {
    await Promise.all(
      picks.map((pick) => {
        const correct =
          pick.signalType === "RESULT"
            ? pick.prediction === payload.result
            : pick.signalType === "BTTS"
            ? (pick.prediction === "yes") === payload.btts
            : null

        return db.aIPick.update({
          where: { id: pick.id },
          data: { isCorrect: correct },
        })
      })
    )
  }

  console.log(`✅ Match result ${payload.match_id}: ${payload.home_score}-${payload.away_score}, settled ${picks.length} picks`)
  return NextResponse.json({ success: true, matchId: match.id, settledPicks: picks.length })
}
