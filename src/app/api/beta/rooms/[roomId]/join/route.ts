import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"
import { betaFetch } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/** POST /api/beta/rooms/[roomId]/join */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerAuthSession()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { betanalyticApiKey: true },
  })
  if (!user?.betanalyticApiKey) {
    return NextResponse.json({ error: "BetAnalytic account not linked" }, { status: 403 })
  }

  const { roomId } = await params
  const res = await betaFetch(
    `/api/rooms/${roomId}/join`,
    user.betanalyticApiKey,
    { method: "POST" }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
