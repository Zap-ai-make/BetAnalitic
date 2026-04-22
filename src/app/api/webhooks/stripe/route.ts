import { NextResponse } from "next/server"

/**
 * Stripe webhook — EN STANDBY
 * Stripe n'est pas disponible au Burkina Faso pour l'instant.
 * La facturation sera implémentée ultérieurement avec une solution locale.
 *
 * Pour upgrader un utilisateur manuellement en attendant :
 * POST /api/admin/upgrade-tier  { userId, tier: "PREMIUM" | "EXPERT" }
 */
export async function POST() {
  return NextResponse.json(
    { message: "Billing not yet available in this region" },
    { status: 503 }
  )
}
