import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { betaFetch, getBetaApiKey } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** POST /api/beta/rooms/[roomId]/message */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const { roomId } = await params
  const body = await req.json()
  const res = await betaFetch(
    `/api/rooms/${roomId}/message`,
    apiKey,
    { method: "POST", body: JSON.stringify(body) }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

/** GET /api/beta/rooms/[roomId]/message — historique messages */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const { roomId } = await params
  const { searchParams } = req.nextUrl
  const qs = new URLSearchParams()
  if (searchParams.get("page")) qs.set("page", searchParams.get("page")!)
  if (searchParams.get("per_page")) qs.set("per_page", searchParams.get("per_page")!)

  const res = await betaFetch(
    `/api/rooms/${roomId}/messages?${qs.toString()}`,
    apiKey
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
