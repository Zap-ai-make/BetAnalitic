import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { betaFetch, getBetaApiKey } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/rooms?type=public&page=1&per_page=20 */
export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const { searchParams } = req.nextUrl
  const qs = new URLSearchParams()
  if (searchParams.get("type")) qs.set("type", searchParams.get("type")!)
  if (searchParams.get("page")) qs.set("page", searchParams.get("page")!)
  if (searchParams.get("per_page")) qs.set("per_page", searchParams.get("per_page")!)

  const res = await betaFetch(`/api/rooms?${qs.toString()}`, apiKey)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

/** POST /api/beta/rooms — créer une salle */
export async function POST(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const body = await req.json()
  const res = await betaFetch("/api/rooms", apiKey, {
    method: "POST",
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
