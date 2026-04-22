import { NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"
import { betaFetch } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** GET /api/beta/betting/account — solde + stats virtuelles */
export async function GET() {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { betanalyticApiKey: true },
  })
  if (!user?.betanalyticApiKey) {
    return NextResponse.json({ error: "BetAnalytic account not linked" }, { status: 403 })
  }

  const res = await betaFetch("/api/betting/account", user.betanalyticApiKey)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
