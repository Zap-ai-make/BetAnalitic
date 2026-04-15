/**
 * Core data types for match data
 */

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  competition: Competition
  startTime: Date
  status: MatchStatus
  venue?: Venue
  referee?: Referee
  weather?: Weather
  round?: string
  stage?: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  logoUrl?: string
  form?: string // e.g., "WWDLW"
  standings?: {
    position: number
    points: number
    played: number
    won: number
    drawn: number
    lost: number
  }
}

export interface Competition {
  id: string
  name: string
  country: string
  logoUrl?: string
  tier: number
}

export interface Venue {
  id: string
  name: string
  city: string
  capacity?: number
}

export interface Referee {
  id: string
  name: string
  country: string
}

export interface Weather {
  temperature: number
  condition: string // "Clear", "Rain", etc.
  windSpeed?: number
  humidity?: number
}

export interface Player {
  id: string
  name: string
  position: string
  number?: number
  teamId: string
  stats?: PlayerStats
}

export interface PlayerStats {
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
  matchesPlayed: number
}

export interface FormData {
  teamId: string
  lastMatches: {
    matchId: string
    date: Date
    opponent: string
    result: "W" | "D" | "L"
    score: string
    homeAway: "home" | "away"
  }[]
  formString: string // "WWDLW"
  stats: {
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
  }
}

export interface LiveStats {
  matchId: string
  score: {
    home: number
    away: number
  }
  possession: {
    home: number
    away: number
  }
  shots: {
    home: number
    away: number
  }
  shotsOnTarget: {
    home: number
    away: number
  }
  corners: {
    home: number
    away: number
  }
  fouls: {
    home: number
    away: number
  }
  yellowCards: {
    home: number
    away: number
  }
  redCards: {
    home: number
    away: number
  }
  events: MatchEvent[]
}

export interface MatchEvent {
  id: string
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "penalty"
  minute: number
  playerId?: string
  playerName?: string
  teamId: string
  description?: string
}

export interface OddsData {
  matchId: string
  bookmakers: {
    name: string
    odds: {
      home: number
      draw: number
      away: number
    }
  }[]
  averageOdds: {
    home: number
    draw: number
    away: number
  }
  updatedAt: Date
}

export interface RefereeData {
  id: string
  name: string
  country: string
  stats: {
    matchesRefereed: number
    yellowCardsPerMatch: number
    redCardsPerMatch: number
    penaltiesPerMatch: number
  }
}

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled"

export interface HeadToHead {
  homeTeamId: string
  awayTeamId: string
  matches: {
    matchId: string
    date: Date
    homeTeam: string
    awayTeam: string
    score: string
    winner?: string
  }[]
  stats: {
    homeWins: number
    awayWins: number
    draws: number
    averageGoals: number
  }
}
