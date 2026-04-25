import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { betaFetch, getBetaApiKey } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/matches?days=3&competition=Premier+League */
export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const { searchParams } = req.nextUrl
  const params = new URLSearchParams()
  if (searchParams.get("days")) params.set("days", searchParams.get("days")!)
  if (searchParams.get("competition")) params.set("competition", searchParams.get("competition")!)

  const res = await betaFetch(`/api/matches?${params.toString()}`, apiKey)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
