/**
 * Shared Prisma include/select constants to avoid repetition across routers.
 */

export const MATCH_INCLUDE = {
  homeTeam: true,
  awayTeam: true,
  competition: true,
} as const

export const MATCH_INCLUDE_WITH_TAGS = {
  homeTeam: true,
  awayTeam: true,
  competition: true,
  tags: true,
} as const

export const USER_PUBLIC_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const

export const LEADERBOARD_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  points: true,
  level: true,
  lifetimePoints: true,
} as const
