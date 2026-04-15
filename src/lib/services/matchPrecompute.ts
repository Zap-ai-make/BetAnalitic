/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db"
import { getDataProvider } from "~/lib/providers/dataProvider"

interface PrecomputedMatchData {
  matchId: string
  homeTeamForm: string // JSON
  awayTeamForm: string // JSON
  h2hHistory: string // JSON
  injuries: string // JSON
  oddsMovement: string // JSON
  tags: string[]
  computedAt: Date
}

/**
 * Match pre-computation service
 * Runs 2 hours before kickoff to aggregate all match data
 */
export class MatchPrecomputeService {
  private provider = getDataProvider()

  /**
   * Pre-compute data for a single match
   */
  async precomputeMatch(matchId: string): Promise<PrecomputedMatchData> {
    console.log(`[Precompute] Starting for match ${matchId}`)

    const match = await db.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, competition: true },
    })

    if (!match) {
      throw new Error(`Match ${matchId} not found`)
    }

    // Fetch all data in parallel
    const [homeForm, awayForm, h2h, odds] = await Promise.all([
      this.provider
        .getTeamForm(match.homeTeam.externalId, 5)
        .catch(() => null),
      this.provider
        .getTeamForm(match.awayTeam.externalId, 5)
        .catch(() => null),
      this.provider
        .getHeadToHead(
          match.homeTeam.externalId,
          match.awayTeam.externalId
        )
        .catch(() => null),
      this.provider.getOdds(match.externalId).catch(() => null),
    ])

    // Generate tags
    const tags = this.generateTags(match)

    // Store in database
    const precomputed: PrecomputedMatchData = {
      matchId: match.id,
      homeTeamForm: JSON.stringify(homeForm),
      awayTeamForm: JSON.stringify(awayForm),
      h2hHistory: JSON.stringify(h2h),
      injuries: JSON.stringify({}), // TODO: Implement injuries
      oddsMovement: JSON.stringify(odds),
      tags,
      computedAt: new Date(),
    }

    // Update match with precomputed data
    await db.match.update({
      where: { id: matchId },
      data: {
        // Store as JSON in the match record
        statistics: JSON.parse(JSON.stringify(precomputed)),
      },
    })

    // Add tags
    if (tags.length > 0) {
      await db.matchTag.createMany({
        data: tags.map((tag) => ({
          matchId: match.id,
          tag,
        })),
        skipDuplicates: true,
      })
    }

    console.log(`[Precompute] Completed for match ${matchId} with tags:`, tags)

    return precomputed
  }

  /**
   * Pre-compute data for all upcoming matches (within 24h)
   */
  async precomputeUpcomingMatches(): Promise<void> {
    console.log("[Precompute] Finding upcoming matches...")

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const matches = await db.match.findMany({
      where: {
        kickoffTime: {
          gte: now,
          lte: in24h,
        },
        status: "SCHEDULED",
      },
    })

    console.log(`[Precompute] Found ${matches.length} matches to precompute`)

    // Process matches sequentially to avoid rate limiting
    for (const match of matches) {
      try {
        await this.precomputeMatch(match.id)
      } catch (error) {
        console.error(`[Precompute] Error for match ${match.id}:`, error)
      }
    }

    console.log("[Precompute] Batch complete")
  }

  /**
   * Generate match tags based on context
   */
  private generateTags(match: {
    homeTeam: { name: string; country: string | null }
    awayTeam: { name: string; country: string | null }
    competition: { name: string; country: string }
  }): string[] {
    const tags: string[] = []

    // Derby detection (same country + same league name suggests local derby)
    if (
      match.homeTeam.country &&
      match.homeTeam.country === match.awayTeam.country &&
      match.competition.name.toLowerCase().includes("league")
    ) {
      tags.push("Derby")
    }

    // Clasico detection (hardcoded famous rivalries)
    const homeTeam = match.homeTeam.name.toLowerCase()
    const awayTeam = match.awayTeam.name.toLowerCase()

    if (
      (homeTeam.includes("real madrid") && awayTeam.includes("barcelona")) ||
      (homeTeam.includes("barcelona") && awayTeam.includes("real madrid"))
    ) {
      tags.push("Clasico")
    }

    if (
      (homeTeam.includes("liverpool") && awayTeam.includes("manchester")) ||
      (homeTeam.includes("manchester") && awayTeam.includes("liverpool"))
    ) {
      tags.push("TopMatch")
    }

    if (
      (homeTeam.includes("marseille") &&
        awayTeam.includes("saint-germain")) ||
      (homeTeam.includes("saint-germain") && awayTeam.includes("marseille"))
    ) {
      tags.push("Clasico")
    }

    // Top competition
    if (
      match.competition.name.toLowerCase().includes("champions league") ||
      match.competition.name.toLowerCase().includes("europa league")
    ) {
      tags.push("European")
    }

    return tags
  }
}

/**
 * Singleton instance
 */
let _service: MatchPrecomputeService | null = null

export function getMatchPrecomputeService(): MatchPrecomputeService {
  if (!_service) {
    _service = new MatchPrecomputeService()
  }
  return _service
}
