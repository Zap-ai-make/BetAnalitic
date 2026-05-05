import { NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { betaFetch, getBetaApiKey } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/betting/account — solde + stats virtuelles */
export async function GET() {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = await getBetaApiKey(session.user.id)
  if (!apiKey) return NextResponse.json({ error: "BetAnalytic sync failed" }, { status: 503 })

  const res = await betaFetch("/api/betting/account", apiKey)
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
