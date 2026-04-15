import type {
  Match,
  Player,
  FormData,
  LiveStats,
  OddsData,
  RefereeData,
  HeadToHead,
  Team,
  Competition,
} from "./types"

/**
 * DataProvider interface - abstraction layer for sports data sources
 * Allows switching between providers (Sportmonks, API-Football, etc.)
 */
export interface DataProvider {
  /**
   * Get match by ID
   */
  getMatch(matchId: string): Promise<Match>

  /**
   * Get matches by date range
   */
  getMatches(from: Date, to: Date, competitionIds?: string[]): Promise<Match[]>

  /**
   * Get upcoming matches
   */
  getUpcomingMatches(competitionIds?: string[], limit?: number): Promise<Match[]>

  /**
   * Get live matches
   */
  getLiveMatches(): Promise<Match[]>

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Promise<Team>

  /**
   * Get player by ID
   */
  getPlayer(playerId: string): Promise<Player>

  /**
   * Get team form (last N matches)
   */
  getTeamForm(teamId: string, lastN?: number): Promise<FormData>

  /**
   * Get live stats for a match
   */
  getLiveStats(matchId: string): Promise<LiveStats>

  /**
   * Get odds for a match
   */
  getOdds(matchId: string): Promise<OddsData>

  /**
   * Get referee stats
   */
  getRefereeStats(refereeId: string): Promise<RefereeData>

  /**
   * Get head-to-head data
   */
  getHeadToHead(homeTeamId: string, awayTeamId: string): Promise<HeadToHead>

  /**
   * Get competition by ID
   */
  getCompetition(competitionId: string): Promise<Competition>

  /**
   * Get all supported competitions
   */
  getCompetitions(): Promise<Competition[]>

  /**
   * Get team statistics
   */
  getTeamStatistics?(teamId: string): Promise<unknown>
}

import { SportmonksProvider } from "./sportmonksProvider"

// Singleton instance
let _provider: DataProvider | null = null

export function getDataProvider(): DataProvider {
  if (!_provider) {
    const apiKey = process.env.SPORTMONKS_API_KEY ?? ""
    _provider = new SportmonksProvider(apiKey)
  }
  return _provider
}
