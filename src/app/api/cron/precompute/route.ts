import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    // Dynamic import to avoid build-time DB connection
    const { getMatchPrecomputeService } = await import("~/lib/services/matchPrecompute")

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
