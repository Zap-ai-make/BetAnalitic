import { type NextRequest, NextResponse } from "next/server"
import { precomputeService } from "~/lib/services/precomputeService"

/**
 * Cron endpoint for pre-computing match data
 * Triggered every 30 minutes via Vercel Cron
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("❌ CRON_SECRET not configured")
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Starting pre-compute cron job...")

    // Get matches needing pre-computation
    const matchIds = await precomputeService.getMatchesNeedingPrecompute()

    if (matchIds.length === 0) {
      console.log("✅ No matches need pre-computation")
      return NextResponse.json({
        success: true,
        message: "No matches need pre-computation",
        processed: 0,
      })
    }

    console.log(`📊 Found ${matchIds.length} matches to pre-compute`)

    // Process each match
    const results = await Promise.allSettled(
      matchIds.map((id) => precomputeService.precomputeMatch(id))
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    // Cleanup expired data
    const cleanedUp = await precomputeService.cleanupExpired()

    console.log(
      `✅ Pre-compute job completed: ${successful} succeeded, ${failed} failed, ${cleanedUp} cleaned up`
    )

    return NextResponse.json({
      success: true,
      processed: matchIds.length,
      successful,
      failed,
      cleanedUp,
    })
  } catch (error) {
    console.error("❌ Pre-compute cron job failed:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Manual trigger for testing (protected)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization")
    const apiSecret = process.env.API_SECRET

    if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as { matchId?: string }

    if (body.matchId) {
      // Pre-compute specific match
      await precomputeService.precomputeMatch(body.matchId)
      return NextResponse.json({
        success: true,
        message: `Pre-computed match ${body.matchId}`,
      })
    } else {
      // Pre-compute all eligible matches
      const matchIds = await precomputeService.getMatchesNeedingPrecompute()
      const results = await Promise.allSettled(
        matchIds.map((id) => precomputeService.precomputeMatch(id))
      )

      const successful = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length

      return NextResponse.json({
        success: true,
        processed: matchIds.length,
        successful,
        failed,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
