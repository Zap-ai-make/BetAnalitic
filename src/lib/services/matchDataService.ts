import { db } from "~/server/db"
import { precomputeService } from "./precomputeService"

/**
 * Service for fetching match data with precomputed cache fallback
 */
export class MatchDataService {
  /**
   * Get match data with precomputed cache first, live fetch as fallback
   */
  async getMatchData(matchId: string) {
    // Try to get precomputed data first
    const precomputed = await db.precomputedMatchData.findUnique({
      where: { matchId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true,
          },
        },
      },
    })

    // Check if cache is valid
    if (precomputed && precomputed.expiresAt > new Date()) {
      console.log(`✅ Using precomputed data for match ${matchId}`)
      return {
        match: precomputed.match,
        data: {
          teamStats: precomputed.teamStats,
          h2hHistory: precomputed.h2hHistory,
          referee: precomputed.referee,
          weather: precomputed.weather,
        },
        source: "precomputed" as const,
        computedAt: precomputed.computedAt,
      }
    }

    // Cache miss or expired - fetch live
    console.log(`🔄 Cache miss for match ${matchId}, fetching live data`)

    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
      },
    })

    if (!match) {
      throw new Error(`Match ${matchId} not found`)
    }

    // Trigger background pre-computation for future requests
    void precomputeService.precomputeMatch(matchId).catch((error) => {
      console.error(`Failed to pre-compute match ${matchId}:`, error)
    })

    return {
      match,
      data: null,
      source: "live" as const,
      computedAt: null,
    }
  }

  /**
   * Check if match has valid precomputed data
   */
  async hasPrecomputedData(matchId: string): Promise<boolean> {
    const precomputed = await db.precomputedMatchData.findUnique({
      where: { matchId },
      select: { expiresAt: true },
    })

    return precomputed !== null && precomputed.expiresAt > new Date()
  }

  /**
   * Get multiple matches with precomputed data
   */
  async getMatchesWithPrecomputedData(matchIds: string[]) {
    const results = await Promise.all(
      matchIds.map((id) => this.getMatchData(id))
    )

    return results
  }

  /**
   * Invalidate precomputed data for a match (e.g., if source data changed)
   */
  async invalidateCache(matchId: string): Promise<void> {
    await db.precomputedMatchData.delete({
      where: { matchId },
    })

    console.log(`🗑️  Invalidated cache for match ${matchId}`)
  }
}

export const matchDataService = new MatchDataService()
