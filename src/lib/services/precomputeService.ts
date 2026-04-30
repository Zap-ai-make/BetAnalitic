/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db"
import { getDataProvider } from "~/lib/providers/dataProvider"

interface TeamStats {
  form: string[]
  goalsScored: number
  goalsConceded: number
  wins: number
  draws: number
  losses: number
  lastFiveMatches: Array<{
    date: string
    opponent: string
    score: string
    result: "W" | "D" | "L"
  }>
}

interface H2HHistory {
  totalMatches: number
  homeWins: number
  awayWins: number
  draws: number
  recentMatches: Array<{
    date: string
    homeTeam: string
    awayTeam: string
    score: string
  }>
}

interface RefereeProfile {
  name: string
  totalMatches: number
  yellowCards: number
  redCards: number
  penaltiesAwarded: number
}

interface WeatherData {
  temperature: number
  conditions: string
  windSpeed: number
  humidity: number
  fetchedAt: string
}

interface PrecomputedData {
  teamStats: {
    home: TeamStats
    away: TeamStats
  }
  h2hHistory: H2HHistory
  referee?: RefereeProfile
  weather?: WeatherData
}

export class PrecomputeService {
  private readonly provider = getDataProvider()

  /**
   * Check which matches need pre-computation (T-2h before kickoff)
   */
  async getMatchesNeedingPrecompute(): Promise<string[]> {
    const now = new Date()
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const matches = await db.match.findMany({
      where: {
        kickoffTime: {
          gte: now,
          lte: twoHoursFromNow,
        },
        status: "SCHEDULED",
        precomputedData: null, // Only matches without precomputed data
      },
      select: {
        id: true,
      },
    })

    return matches.map((m) => m.id)
  }

  /**
   * Pre-compute data for a specific match
   */
  async precomputeMatch(matchId: string): Promise<void> {
    try {
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

      // Fetch all required data in parallel
      const [homeStats, awayStats, h2hHistory, refereeProfile, weatherData] =
        await Promise.allSettled([
          this.fetchTeamStats(match.homeTeam.externalId),
          this.fetchTeamStats(match.awayTeam.externalId),
          this.fetchH2HHistory(
            match.homeTeam.externalId,
            match.awayTeam.externalId
          ),
          match.referee
            ? this.fetchRefereeProfile(match.referee)
            : Promise.resolve(null),
          match.venue
            ? this.fetchWeather(match.venue, match.kickoffTime)
            : Promise.resolve(null),
        ])

      // Aggregate data
      const precomputedData: PrecomputedData = {
        teamStats: {
          home:
            homeStats.status === "fulfilled"
              ? homeStats.value
              : this.getDefaultTeamStats(),
          away:
            awayStats.status === "fulfilled"
              ? awayStats.value
              : this.getDefaultTeamStats(),
        },
        h2hHistory:
          h2hHistory.status === "fulfilled"
            ? h2hHistory.value
            : this.getDefaultH2HHistory(),
        referee:
          refereeProfile.status === "fulfilled"
            ? refereeProfile.value ?? undefined
            : undefined,
        weather:
          weatherData.status === "fulfilled"
            ? weatherData.value ?? undefined
            : undefined,
      }

      // Calculate expiration (match end + 2h)
      const expiresAt = new Date(
        match.kickoffTime.getTime() + 4 * 60 * 60 * 1000
      ) // 2h match + 2h buffer

      // Store in database
      await db.precomputedMatchData.upsert({
        where: { matchId },
        create: {
          matchId,
          teamStats: precomputedData.teamStats as never,
          h2hHistory: precomputedData.h2hHistory as never,
          referee: precomputedData.referee as never,
          weather: precomputedData.weather as never,
          expiresAt,
          retryCount: 0,
        },
        update: {
          teamStats: precomputedData.teamStats as never,
          h2hHistory: precomputedData.h2hHistory as never,
          referee: precomputedData.referee as never,
          weather: precomputedData.weather as never,
          expiresAt,
          retryCount: 0,
          lastError: null,
        },
      })

      // Generate AI pick from computed stats
      await this.generateAIPick(matchId, precomputedData, match.kickoffTime, match.odds)

      console.log(`✅ Pre-computed data for match ${matchId}`)
    } catch (error) {
      console.error(`❌ Failed to pre-compute match ${matchId}:`, error)

      // Log error to database
      await db.precomputedMatchData.upsert({
        where: { matchId },
        create: {
          matchId,
          teamStats: this.getDefaultTeamStats() as never,
          h2hHistory: this.getDefaultH2HHistory() as never,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          retryCount: 1,
          lastError: error instanceof Error ? error.message : String(error),
        },
        update: {
          retryCount: { increment: 1 },
          lastError: error instanceof Error ? error.message : String(error),
        },
      })

      throw error
    }
  }

  /**
   * Fetch team stats from provider
   */
  private async fetchTeamStats(teamExternalId: string): Promise<TeamStats> {
    const formData = await this.provider.getTeamForm(teamExternalId) as unknown as Array<{
      result: "W" | "D" | "L"
      goalsFor: number
      goalsAgainst: number
      date: string
      opponent: string
    }>

    return {
      form: formData.map((m) => m.result),
      goalsScored: formData.reduce((sum, m) => sum + m.goalsFor, 0),
      goalsConceded: formData.reduce((sum, m) => sum + m.goalsAgainst, 0),
      wins: formData.filter((m) => m.result === "W").length,
      draws: formData.filter((m) => m.result === "D").length,
      losses: formData.filter((m) => m.result === "L").length,
      lastFiveMatches: formData.slice(0, 5).map((m) => ({
        date: m.date,
        opponent: m.opponent,
        score: `${m.goalsFor}-${m.goalsAgainst}`,
        result: m.result,
      })),
    }
  }

  /**
   * Fetch head-to-head history
   */
  private async fetchH2HHistory(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<H2HHistory> {
    const h2h = await this.provider.getHeadToHead(homeTeamId, awayTeamId)

    return {
      totalMatches: h2h.length,
      homeWins: h2h.filter((m) => m.homeGoals > m.awayGoals).length,
      awayWins: h2h.filter((m) => m.homeGoals < m.awayGoals).length,
      draws: h2h.filter((m) => m.homeGoals === m.awayGoals).length,
      recentMatches: h2h.slice(0, 5).map((m) => ({
        date: m.date,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        score: `${m.homeGoals}-${m.awayGoals}`,
      })),
    }
  }

  /**
   * Fetch referee profile (placeholder - implement based on provider)
   */
  private async fetchRefereeProfile(
    refereeName: string
  ): Promise<RefereeProfile | null> {
    // TODO: Implement when provider supports referee data
    return {
      name: refereeName,
      totalMatches: 0,
      yellowCards: 0,
      redCards: 0,
      penaltiesAwarded: 0,
    }
  }

  /**
   * Fetch weather data (placeholder - implement based on weather API)
   */
  private async fetchWeather(
    _venue: string,
    _kickoffTime: Date
  ): Promise<WeatherData | null> {
    // TODO: Implement weather API integration
    return null
  }

  /**
   * Generate AI pick from precomputed stats using confidence formula
   */
  async generateAIPick(
    matchId: string,
    data: PrecomputedData,
    kickoffTime: Date,
    matchOdds: unknown
  ): Promise<void> {
    const { teamStats, h2hHistory } = data
    const total = Math.max(teamStats.home.wins + teamStats.home.draws + teamStats.home.losses, 1)
    const awayTotal = Math.max(teamStats.away.wins + teamStats.away.draws + teamStats.away.losses, 1)
    const h2hTotal = Math.max(h2hHistory.totalMatches, 1)

    const homeFormRate = teamStats.home.wins / total
    const awayFormRate = teamStats.away.wins / awayTotal
    const h2hHomeRate = h2hHistory.homeWins / h2hTotal
    const h2hAwayRate = h2hHistory.awayWins / h2hTotal
    const drawRate = h2hHistory.draws / h2hTotal

    const homeScore = homeFormRate * 0.6 + h2hHomeRate * 0.4
    const awayScore = awayFormRate * 0.6 + h2hAwayRate * 0.4

    let prediction: string
    let confidence: number
    let reasoning: string

    if (homeScore >= awayScore && homeScore > 0.45) {
      prediction = "home"
      confidence = Math.min(homeScore + 0.1, 0.95)
      const wins5 = teamStats.home.form.slice(0, 5).filter((r) => r === "W").length
      reasoning = `Domination à domicile (${wins5}/5 victoires récentes) et ${h2hHistory.homeWins} victoires sur ${h2hHistory.totalMatches} confrontations directes.`
    } else if (awayScore > homeScore && awayScore > 0.45) {
      prediction = "away"
      confidence = Math.min(awayScore + 0.08, 0.92)
      const wins5 = teamStats.away.form.slice(0, 5).filter((r) => r === "W").length
      reasoning = `Visiteurs en excellente forme (${wins5}/5 victoires récentes), tendance à s'imposer à l'extérieur.`
    } else {
      prediction = "draw"
      confidence = Math.max(Math.min(drawRate + 0.35, 0.72), 0.48)
      reasoning = `Équilibre H2H (${h2hHistory.homeWins}V/${h2hHistory.draws}N/${h2hHistory.awayWins}D) et niveaux similaires — nul probable.`
    }

    const agentType = confidence > 0.75 ? "SCOUT" : confidence > 0.60 ? "PREDICTION" : "ODDS"

    // Extract odds from match JSON
    const oddsJson = matchOdds as Record<string, number> | null | undefined
    const oddsMap: Record<string, number> = {
      home: oddsJson?.["1"] ?? 1.85,
      draw: oddsJson?.X ?? 3.30,
      away: oddsJson?.["2"] ?? 3.80,
    }
    const odds = oddsMap[prediction] ?? 2.0

    await db.aIPick.upsert({
      where: { matchId },
      create: { matchId, agentType, prediction, confidence, reasoning, odds, expiresAt: kickoffTime },
      update: { agentType, prediction, confidence, reasoning, odds, expiresAt: kickoffTime, isCorrect: null },
    })
  }

  /**
   * Get default team stats for fallback
   */
  private getDefaultTeamStats(): TeamStats {
    return {
      form: [],
      goalsScored: 0,
      goalsConceded: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      lastFiveMatches: [],
    }
  }

  /**
   * Get default H2H history for fallback
   */
  private getDefaultH2HHistory(): H2HHistory {
    return {
      totalMatches: 0,
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      recentMatches: [],
    }
  }

  /**
   * Clean up expired precomputed data
   */
  async cleanupExpired(): Promise<number> {
    const result = await db.precomputedMatchData.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`🗑️  Cleaned up ${result.count} expired precomputed entries`)
    return result.count
  }
}

export const precomputeService = new PrecomputeService()
