import { type NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "~/server/auth"
import { db } from "~/server/db"
import { updateBetaUserTier } from "~/lib/betanalytic"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/upgrade-tier
 * Route admin temporaire pour upgrader un utilisateur manuellement
 * (en attendant l'intégration d'un système de paiement local).
 *
 * Body : { userId: string, tier: "FREE" | "PREMIUM" | "EXPERT" }
 * Requiert : session admin (role === "ADMIN")
 */
export async function POST(req: NextRequest) {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Admin uniquement
  const caller = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (caller?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = (await req.json()) as { userId?: string; tier?: string }
  const { userId, tier } = body

  if (!userId || !tier || !["FREE", "PREMIUM", "EXPERT"].includes(tier)) {
    return NextResponse.json(
      { error: "userId and tier (FREE | PREMIUM | EXPERT) are required" },
      { status: 400 }
    )
  }

  const tierValue = tier as "FREE" | "PREMIUM" | "EXPERT"

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { betanalyticId: true, username: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Mise à jour Neon
  await db.user.update({
    where: { id: userId },
    data: { subscriptionTier: tierValue },
  })

  // Sync BetAnalytic
  if (user.betanalyticId) {
    await updateBetaUserTier(user.betanalyticId, tierValue)
  }

  return NextResponse.json({
    success: true,
    username: user.username,
    new_tier: tierValue,
    betanalytic_synced: !!user.betanalyticId,
  })
}
