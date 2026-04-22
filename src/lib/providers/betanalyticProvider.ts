/**
 * BetAnalytic Data Provider
 * Replaces Sportmonks — fetches match data directly from BetAnalytic FastAPI.
 * Used server-side only (matchDataService, precomputeService).
 */

import { betaAdminFetch, type BetaMatch, type BetaMatchDetail } from "../betanalytic"
import type { DataProvider } from "./dataProvider"
import type {
  Match,
  Team,
  Player,
  FormData,
  LiveStats,
  OddsData,
  RefereeData,
  HeadToHead,
  Competition,
} from "./types"

export class BetAnalyticProvider implements DataProvider {
  async getUpcomingMatches(_competitionIds?: string[], limit?: number): Promise<Match[]> {
    const days = Math.min(Math.ceil((limit ?? 20) / 4), 7)
    const res = await betaAdminFetch(`/api/matches?days=${days}`)
    if (!res.ok) throw new Error(`BetAnalytic getUpcomingMatches failed: ${res.status}`)

    const data = (await res.json()) as {
      matches_by_competition: Record<string, BetaMatch[]>
    }

    const all: Match[] = []
    for (const matches of Object.values(data.matches_by_competition)) {
      for (const m of matches) {
        all.push(this.mapMatch(m))
      }
    }
    return all.slice(0, limit ?? 20)
  }

  async getMatch(matchId: string): Promise<Match> {
    const res = await betaAdminFetch(`/api/matches/${matchId}`)
    if (!res.ok) throw new Error(`BetAnalytic getMatch(${matchId}) failed: ${res.status}`)
    const data = (await res.json()) as BetaMatchDetail
    return this.mapMatchDetail(data)
  }

  async getMatches(from: Date, to: Date): Promise<Match[]> {
    const days = Math.ceil((to.getTime() - from.getTime()) / 86_400_000)
    return this.getUpcomingMatches(undefined, days * 5)
  }

  async getLiveMatches(): Promise<Match[]> {
    const res = await betaAdminFetch("/api/matches?days=1")
    if (!res.ok) return []
    const data = (await res.json()) as { matches_by_competition: Record<string, BetaMatch[]> }
    const live: Match[] = []
    for (const matches of Object.values(data.matches_by_competition)) {
      for (const m of matches) {
        if (m.status === "inprogress" || m.status === "halftime") {
          live.push(this.mapMatch(m))
        }
      }
    }
    return live
  }

  // ── Unsupported endpoints (BetAnalytic doesn't expose these individually) ──

  async getTeam(_teamId: string): Promise<Team> {
    throw new Error("getTeam not supported by BetAnalytic provider")
  }

  async getPlayer(_playerId: string): Promise<Player> {
    throw new Error("getPlayer not supported by BetAnalytic provider")
  }

  async getTeamForm(_teamId: string): Promise<FormData> {
    throw new Error("getTeamForm not supported by BetAnalytic provider — use agent FORM")
  }

  async getLiveStats(_matchId: string): Promise<LiveStats> {
    throw new Error("getLiveStats not supported by BetAnalytic provider")
  }

  async getOdds(matchId: string): Promise<OddsData> {
    const res = await betaAdminFetch(`/api/analytics/match/${matchId}/market`)
    if (!res.ok) throw new Error(`BetAnalytic getOdds(${matchId}) failed: ${res.status}`)
    return res.json() as Promise<OddsData>
  }

  async getRefereeStats(_refereeId: string): Promise<RefereeData> {
    throw new Error("getRefereeStats not supported by BetAnalytic provider — use agent REFEREE")
  }

  async getHeadToHead(_homeTeamId: string, _awayTeamId: string): Promise<HeadToHead> {
    throw new Error("getHeadToHead not supported by BetAnalytic provider — use agent H2H")
  }

  async getCompetition(_competitionId: string): Promise<Competition> {
    throw new Error("getCompetition not supported by BetAnalytic provider")
  }

  async getAllCompetitions(): Promise<Competition[]> {
    throw new Error("getAllCompetitions not supported by BetAnalytic provider")
  }

  // ── Mapping ────────────────────────────────────────────────────────────────

  private mapMatch(m: BetaMatch): Match {
    return {
      id: m.match_id,
      homeTeam: { id: m.home_team_id, name: m.home_team, shortName: m.home_team.split(" ")[0] ?? m.home_team },
      awayTeam: { id: m.away_team_id, name: m.away_team, shortName: m.away_team.split(" ")[0] ?? m.away_team },
      competition: { id: m.competition.toLowerCase().replace(/ /g, "-"), name: m.competition, country: m.country, tier: 1 },
      startTime: new Date(m.date_iso),
      status: this.mapStatus(m.status),
      venue: m.venue ? { id: m.venue, name: m.venue, city: m.country } : undefined,
    }
  }

  private mapMatchDetail(m: BetaMatchDetail): Match {
    return {
      ...this.mapMatch(m),
      referee: m.referee ? { id: m.referee, name: m.referee, country: "" } : undefined,
    }
  }

  async getCompetitions(): Promise<Competition[]> {
    return []
  }

  private mapStatus(status: string): Match["status"] {
    const map: Record<string, Match["status"]> = {
      notstarted: "scheduled",
      inprogress: "live",
      halftime: "halftime",
      finished: "finished",
      postponed: "postponed",
      cancelled: "cancelled",
    }
    return map[status] ?? "scheduled"
  }
}
