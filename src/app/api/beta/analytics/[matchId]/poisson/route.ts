import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { betaFetch, getBetaApiKey } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/analytics/[matchId]/poisson?home_team=...&away_team=... */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const { matchId } = await params
  const { searchParams } = req.nextUrl
  const qs = new URLSearchParams()
  if (searchParams.get("home_team")) qs.set("home_team", searchParams.get("home_team")!)
  if (searchParams.get("away_team")) qs.set("away_team", searchParams.get("away_team")!)
  if (searchParams.get("competition")) qs.set("competition", searchParams.get("competition")!)

  const res = await betaFetch(
    `/api/analytics/match/${matchId}/poisson?${qs.toString()}`,
    apiKey
  )
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
