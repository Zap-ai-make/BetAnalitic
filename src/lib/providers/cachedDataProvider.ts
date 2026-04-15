import type { DataProvider } from "./dataProvider"
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
 * Cache TTLs in seconds
 */
const CACHE_TTL = {
  // Static data - rarely changes
  team: 24 * 60 * 60, // 24 hours
  player: 24 * 60 * 60, // 24 hours
  competition: 7 * 24 * 60 * 60, // 7 days

  // Semi-dynamic data
  form: 60 * 60, // 1 hour
  match: 60 * 60, // 1 hour (for upcoming matches)
  headToHead: 7 * 24 * 60 * 60, // 7 days
  refereeStats: 24 * 60 * 60, // 24 hours

  // No cache for live data
  liveStats: 0,
  liveMatches: 0,
  odds: 0,
} as const

/**
 * Simple in-memory cache for development
 * In production, replace with Redis
 */
class MemoryCache {
  private cache = new Map<string, { value: unknown; expiresAt: number }>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}

/**
 * CachedDataProvider - wraps any DataProvider with caching
 */
export class CachedDataProvider implements DataProvider {
  private cache = new MemoryCache()

  constructor(private provider: DataProvider) {}

  private cacheKey(method: string, ...args: unknown[]): string {
    return `${method}:${args.map((a) => JSON.stringify(a)).join(":")}`
  }

  private async withCache<T>(
    cacheKey: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // No cache if TTL is 0
    if (ttl === 0) {
      return fetcher()
    }

    // Try cache first
    const cached = await this.cache.get<T>(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch and cache
    try {
      const data = await fetcher()
      await this.cache.set(cacheKey, data, ttl)
      return data
    } catch (error) {
      // On error, try to return stale cache if available
      const stale = await this.cache.get<T>(cacheKey)
      if (stale) {
        console.warn("Returning stale cache due to error:", error)
        return stale
      }
      throw error
    }
  }

  async getMatch(matchId: string): Promise<Match> {
    return this.withCache(
      this.cacheKey("getMatch", matchId),
      CACHE_TTL.match,
      () => this.provider.getMatch(matchId)
    )
  }

  async getMatches(
    from: Date,
    to: Date,
    competitionIds?: string[]
  ): Promise<Match[]> {
    return this.withCache(
      this.cacheKey("getMatches", from, to, competitionIds),
      CACHE_TTL.match,
      () => this.provider.getMatches(from, to, competitionIds)
    )
  }

  async getUpcomingMatches(
    competitionIds?: string[],
    limit?: number
  ): Promise<Match[]> {
    return this.withCache(
      this.cacheKey("getUpcomingMatches", competitionIds, limit),
      CACHE_TTL.match,
      () => this.provider.getUpcomingMatches(competitionIds, limit)
    )
  }

  async getLiveMatches(): Promise<Match[]> {
    // Never cache live data
    return this.provider.getLiveMatches()
  }

  async getTeam(teamId: string): Promise<Team> {
    return this.withCache(
      this.cacheKey("getTeam", teamId),
      CACHE_TTL.team,
      () => this.provider.getTeam(teamId)
    )
  }

  async getPlayer(playerId: string): Promise<Player> {
    return this.withCache(
      this.cacheKey("getPlayer", playerId),
      CACHE_TTL.player,
      () => this.provider.getPlayer(playerId)
    )
  }

  async getTeamForm(teamId: string, lastN?: number): Promise<FormData> {
    return this.withCache(
      this.cacheKey("getTeamForm", teamId, lastN),
      CACHE_TTL.form,
      () => this.provider.getTeamForm(teamId, lastN)
    )
  }

  async getLiveStats(matchId: string): Promise<LiveStats> {
    // Never cache live data
    return this.provider.getLiveStats(matchId)
  }

  async getOdds(matchId: string): Promise<OddsData> {
    // Never cache odds (frequently changing)
    return this.provider.getOdds(matchId)
  }

  async getRefereeStats(refereeId: string): Promise<RefereeData> {
    return this.withCache(
      this.cacheKey("getRefereeStats", refereeId),
      CACHE_TTL.refereeStats,
      () => this.provider.getRefereeStats(refereeId)
    )
  }

  async getHeadToHead(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<HeadToHead> {
    return this.withCache(
      this.cacheKey("getHeadToHead", homeTeamId, awayTeamId),
      CACHE_TTL.headToHead,
      () => this.provider.getHeadToHead(homeTeamId, awayTeamId)
    )
  }

  async getCompetition(competitionId: string): Promise<Competition> {
    return this.withCache(
      this.cacheKey("getCompetition", competitionId),
      CACHE_TTL.competition,
      () => this.provider.getCompetition(competitionId)
    )
  }

  async getCompetitions(): Promise<Competition[]> {
    return this.withCache(
      this.cacheKey("getCompetitions"),
      CACHE_TTL.competition,
      () => this.provider.getCompetitions()
    )
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear()
  }
}
