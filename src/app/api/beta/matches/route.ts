import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"
import { betaFetch } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/matches?days=3&competition=Premier+League */
export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { betanalyticApiKey: true },
  })
  if (!user?.betanalyticApiKey) {
    return NextResponse.json({ error: "BetAnalytic account not linked" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const params = new URLSearchParams()
  if (searchParams.get("days")) params.set("days", searchParams.get("days")!)
  if (searchParams.get("competition")) params.set("competition", searchParams.get("competition")!)

  const res = await betaFetch(`/api/matches?${params.toString()}`, user.betanalyticApiKey)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
