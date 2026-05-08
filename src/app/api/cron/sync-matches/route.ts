import { type NextRequest, NextResponse } from "next/server"
import { betaAdminFetch, type BetaMatch } from "~/lib/betanalytic"
import { db } from "~/server/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type VpsMatchStatus = "SCHEDULED" | "LIVE" | "HALFTIME" | "FINISHED" | "POSTPONED" | "CANCELLED"

const STATUS_MAP: Record<VpsMatchStatus, "SCHEDULED" | "LIVE" | "HALFTIME" | "FINISHED" | "POSTPONED" | "CANCELLED"> = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  HALFTIME: "HALFTIME",
  FINISHED: "FINISHED",
  POSTPONED: "POSTPONED",
  CANCELLED: "CANCELLED",
}

async function syncMatches(days = 3): Promise<{ upserted: number; errors: number }> {
  const res = await betaAdminFetch(`/api/matches?days=${days}&flat=true`)
  if (!res.ok) throw new Error(`VPS /api/matches failed: ${res.status}`)

  const data = (await res.json()) as { total: number; matches: BetaMatch[] }
  const matches = data.matches ?? []

  let upserted = 0
  let errors = 0

  for (const m of matches) {
    try {
      // 1. Upsert Competition
      const competition = await db.competition.upsert({
        where: { externalId: m.competition },
        create: {
          externalId: m.competition,
          name: m.competition,
          country: m.country,
          tier: 1,
        },
        update: { name: m.competition, country: m.country },
      })

      // 2. Upsert home Team
      const homeTeam = await db.team.upsert({
        where: { externalId: m.home_team_id },
        create: {
          externalId: m.home_team_id,
          name: m.home_team,
          shortName: m.home_team.slice(0, 3).toUpperCase(),
          country: m.country,
        },
        update: { name: m.home_team },
      })

      // 3. Upsert away Team
      const awayTeam = await db.team.upsert({
        where: { externalId: m.away_team_id },
        create: {
          externalId: m.away_team_id,
          name: m.away_team,
          shortName: m.away_team.slice(0, 3).toUpperCase(),
          country: m.country,
        },
        update: { name: m.away_team },
      })

      // 4. Upsert Match
      await db.match.upsert({
        where: { externalId: m.match_id },
        create: {
          externalId: m.match_id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          competitionId: competition.id,
          kickoffTime: new Date(m.date_iso),
          status: STATUS_MAP[m.status as VpsMatchStatus] ?? "SCHEDULED",
          venue: m.venue ?? null,
          odds: m.odds ?? null,
        },
        update: {
          status: STATUS_MAP[m.status as VpsMatchStatus] ?? "SCHEDULED",
          kickoffTime: new Date(m.date_iso),
          venue: m.venue ?? null,
          odds: m.odds ?? null,
        },
      })

      upserted++
    } catch (err) {
      console.error(`❌ Failed to sync match ${m.match_id}:`, err)
      errors++
    }
  }

  return { upserted, errors }
}

/** GET — appelé par Vercel Cron (Bearer CRON_SECRET) */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncMatches(3)
    console.log(`✅ Sync matchs: ${result.upserted} upserted, ${result.errors} errors`)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("❌ sync-matches cron failed:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/** POST — déclenchement manuel (Bearer API_SECRET) */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const apiSecret = process.env.API_SECRET

  if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as { days?: number }
  const days = body.days ?? 3

  try {
    const result = await syncMatches(days)
    return NextResponse.json({ success: true, days, ...result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
