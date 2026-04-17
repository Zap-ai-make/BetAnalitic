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
 * Sportmonks API Client
 * https://docs.sportmonks.com/football
 */
export class SportmonksProvider implements DataProvider {
  private apiKey: string
  private baseUrl = "https://api.sportmonks.com/v3/football"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const separator = endpoint.includes("?") ? "&" : "?"

    const response = await fetch(`${url}${separator}api_token=${this.apiKey}`, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(
        `Sportmonks API error: ${response.status} ${response.statusText}`
      )
    }

    return (await response.json()) as T
  }

  async getMatch(matchId: string): Promise<Match> {
    const data = await this.request<{ data: unknown }>(
      `/fixtures/${matchId}?include=participants;venue;referee;weather;league`
    )

    // Transform Sportmonks response to our Match type
    return this.transformMatch(data.data)
  }

  async getMatches(
    from: Date,
    to: Date,
    competitionIds?: string[]
  ): Promise<Match[]> {
    const fromStr = from.toISOString().split("T")[0]
    const toStr = to.toISOString().split("T")[0]

    let endpoint = `/fixtures/between/${fromStr}/${toStr}?include=participants;league`

    if (competitionIds?.length) {
      endpoint += `&leagues=${competitionIds.join(",")}`
    }

    const data = await this.request<{ data: unknown[] }>(endpoint)
    return data.data.map((m) => this.transformMatch(m))
  }

  async getUpcomingMatches(
    competitionIds?: string[],
    limit = 20
  ): Promise<Match[]> {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const matches = await this.getMatches(today, nextWeek, competitionIds)
    return matches.slice(0, limit)
  }

  async getLiveMatches(): Promise<Match[]> {
    const data = await this.request<{ data: unknown[] }>(
      `/livescores/inplay?include=participants;league`
    )
    return data.data.map((m) => this.transformMatch(m))
  }

  async getTeam(teamId: string): Promise<Team> {
    const data = await this.request<{ data: unknown }>(
      `/teams/${teamId}?include=latest;league`
    )

    return this.transformTeam(data.data)
  }

  async getPlayer(playerId: string): Promise<Player> {
    const data = await this.request<{ data: unknown }>(
      `/players/${playerId}?include=statistics`
    )

    return this.transformPlayer(data.data)
  }

  async getTeamForm(teamId: string, lastN = 5): Promise<FormData> {
    const data = await this.request<{ data: unknown }>(
      `/teams/${teamId}?include=latest:${lastN}`
    )

    return this.transformFormData(teamId, data.data)
  }

  async getLiveStats(matchId: string): Promise<LiveStats> {
    const data = await this.request<{ data: unknown }>(
      `/fixtures/${matchId}?include=statistics;events`
    )

    return this.transformLiveStats(data.data)
  }

  async getOdds(matchId: string): Promise<OddsData> {
    const data = await this.request<{ data: unknown }>(
      `/odds/pre-match/fixtures/${matchId}?bookmakers=3,5,8`
    )

    return this.transformOdds(matchId, data.data)
  }

  async getRefereeStats(refereeId: string): Promise<RefereeData> {
    const data = await this.request<{ data: unknown }>(
      `/referees/${refereeId}?include=statistics`
    )

    return this.transformRefereeData(data.data)
  }

  async getHeadToHead(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<HeadToHead> {
    const data = await this.request<{ data: unknown[] }>(
      `/fixtures/head-to-head/${homeTeamId}/${awayTeamId}`
    )

    return this.transformHeadToHead(homeTeamId, awayTeamId, data.data)
  }

  async getCompetition(competitionId: string): Promise<Competition> {
    const data = await this.request<{ data: unknown }>(
      `/leagues/${competitionId}`
    )

    return this.transformCompetition(data.data)
  }

  async getCompetitions(): Promise<Competition[]> {
    const data = await this.request<{ data: unknown[] }>("/leagues")
    return data.data.map((c) => this.transformCompetition(c))
  }

  /**
   * Transform methods - convert Sportmonks format to our types
   */

  private transformMatch(data: unknown): Match {
    // TODO: Implement actual transformation from Sportmonks schema
    // This is a placeholder
    const raw = data as Record<string, unknown>

    return {
      id: String(raw.id ?? ""),
      homeTeam: { id: "", name: "", shortName: "" },
      awayTeam: { id: "", name: "", shortName: "" },
      competition: { id: "", name: "", country: "", tier: 1 },
      startTime: new Date(),
      status: "scheduled",
    }
  }

  private transformTeam(data: unknown): Team {
    const raw = data as Record<string, unknown>
    return {
      id: String(raw.id ?? ""),
      name: String(raw.name ?? ""),
      shortName: String(raw.short_code ?? ""),
    }
  }

  private transformPlayer(data: unknown): Player {
    const raw = data as Record<string, unknown>
    return {
      id: String(raw.id ?? ""),
      name: String(raw.display_name ?? ""),
      position: String(raw.position_id ?? ""),
      teamId: String(raw.team_id ?? ""),
    }
  }

  private transformFormData(teamId: string, _data: unknown): FormData {
    return {
      teamId,
      lastMatches: [],
      formString: "",
      stats: {
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    }
  }

  private transformLiveStats(_data: unknown): LiveStats {
    return {
      matchId: "",
      score: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
      events: [],
    }
  }

  private transformOdds(matchId: string, _data: unknown): OddsData {
    return {
      matchId,
      bookmakers: [],
      averageOdds: { home: 0, draw: 0, away: 0 },
      updatedAt: new Date(),
    }
  }

  private transformRefereeData(_data: unknown): RefereeData {
    const raw = _data as Record<string, unknown>
    return {
      id: String(raw.id ?? ""),
      name: String(raw.display_name ?? ""),
      country: "",
      stats: {
        matchesRefereed: 0,
        yellowCardsPerMatch: 0,
        redCardsPerMatch: 0,
        penaltiesPerMatch: 0,
      },
    }
  }

  private transformHeadToHead(
    homeTeamId: string,
    awayTeamId: string,
    _data: unknown[]
  ): HeadToHead {
    return {
      homeTeamId,
      awayTeamId,
      matches: [],
      stats: {
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        averageGoals: 0,
      },
    }
  }

  private transformCompetition(data: unknown): Competition {
    const raw = data as Record<string, unknown>
    return {
      id: String(raw.id ?? ""),
      name: String(raw.name ?? ""),
      country: String(raw.country ?? ""),
      tier: 1,
    }
  }
}
