import { NextResponse } from "next/server"
import { getMatchPrecomputeService } from "~/lib/services/matchPrecompute"

export const dynamic = "force-dynamic"

/**
 * Cron endpoint for match pre-computation
 * Should be called every hour by a cron service (Vercel Cron, GitHub Actions, etc.)
 *
 * Authorization: Uses CRON_SECRET environment variable
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const service = getMatchPrecomputeService()
    await service.precomputeUpcomingMatches()

    return NextResponse.json({
      success: true,
      message: "Match pre-computation completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
