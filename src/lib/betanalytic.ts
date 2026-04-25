/**
 * BetAnalytic API — secure fetch helper (server-side only)
 * Browser never calls BetAnalytic directly — all requests go through Next.js API routes.
 */

const API_URL = process.env.BETANALYTIC_API_URL ?? ""
const INTERNAL_SECRET = process.env.BETANALYTIC_INTERNAL_SECRET ?? ""
const ADMIN_KEY = process.env.BETANALYTIC_ADMIN_KEY ?? ""

if (!API_URL) console.warn("⚠️  BETANALYTIC_API_URL not configured")
if (!INTERNAL_SECRET) console.warn("⚠️  BETANALYTIC_INTERNAL_SECRET not configured")

/**
 * Authenticated fetch toward BetAnalytic API.
 * Automatically injects X-Internal-Secret + Authorization headers.
 */
export async function betaFetch(
  path: string,
  userToken: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
      "X-Internal-Secret": INTERNAL_SECRET,
      ...(init?.headers ?? {}),
    },
  })
}

/**
 * Admin fetch — uses the admin API key.
 * Only for user creation, tier changes, match results.
 */
export async function betaAdminFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY}`,
      "X-Internal-Secret": INTERNAL_SECRET,
      ...(init?.headers ?? {}),
    },
  })
}

// ─── Response types ────────────────────────────────────────────────────────────

export interface BetaAnalyzeResponse {
  success: boolean
  match: string
  agent_type: string
  content: string
  confidence: number
  key_insights: string[]
  warnings: string | null
  processing_time_seconds: number
  data_completeness_pct: number
}

export interface BetaAnalyzeFullResponse {
  success: boolean
  match: string
  competition: string
  date: string
  data_completeness_pct: number
  agents_count: number
  consensus: {
    average_confidence: number
    agents_count: number
    successful_agents: number
    main_prediction: string
    top_insights: string[]
    risk_level: string
    value_found: string | null
  }
  agents_results: Record<string, BetaAnalyzeResponse>
}

export interface BetaMatch {
  match_id: string
  home_team: string
  away_team: string
  home_team_id: string
  away_team_id: string
  competition: string
  country: string
  date_iso: string
  date_timestamp: number
  status: string
  venue: string
  odds: { "1": number; X: number; "2": number }
}

export interface BetaMatchDetail extends BetaMatch {
  referee: string | null
  data_completeness_pct: number
  data_sources: string[]
  home_injuries: Array<{ player: { name: string }; type: string }>
  away_injuries: Array<{ player: { name: string }; type: string }>
  available_agents: Array<{ type: string; emoji: string; description: string }>
}

export interface BetaUser {
  id: string
  email: string
  username: string
  tier: "FREE" | "PREMIUM" | "EXPERT"
  api_key: string
}

export interface BetaPoissonResponse {
  available: boolean
  model: string
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  expected_home_goals: number
  expected_away_goals: number
  most_likely_score: string
  most_likely_score_prob: number
  over_25_prob: number
  btts_prob: number
  top_scores: [string, number][]
  data_quality: string
  notes: string[]
}

// ─── Lazy-sync helper ─────────────────────────────────────────────────────────

/**
 * Returns the BetAnalytic API key for a user.
 * If the user has no BetAnalytic account yet, creates one and persists it.
 * Use this in every /api/beta/* route instead of a raw DB lookup.
 */
export async function getBetaApiKey(userId: string): Promise<string | null> {
  const { db } = await import("~/server/db")

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { betanalyticApiKey: true, betanalyticId: true, email: true, username: true },
  })

  if (!user) return null
  if (user.betanalyticApiKey) return user.betanalyticApiKey

  // Lazy-sync: create BetAnalytic account on first use
  try {
    const result = await createBetaUser({
      email: user.email ?? undefined,
      username: user.username,
      tier: "FREE",
    })
    await db.user.update({
      where: { id: userId },
      data: {
        betanalyticId: result.user.id,
        betanalyticApiKey: result.user.api_key,
      },
    })
    return result.user.api_key
  } catch (err) {
    console.error("BetAnalytic lazy-sync failed:", err)
    return null
  }
}

// ─── Admin helpers ─────────────────────────────────────────────────────────────

export async function createBetaUser(params: {
  email?: string
  username: string
  tier?: "FREE" | "PREMIUM" | "EXPERT"
}): Promise<{ success: boolean; user: BetaUser }> {
  const res = await betaAdminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ tier: "FREE", ...params }),
  })
  if (!res.ok) throw new Error(`BetAnalytic user creation failed: ${res.status}`)
  return res.json() as Promise<{ success: boolean; user: BetaUser }>
}

export async function updateBetaUserTier(
  betanalyticUserId: string,
  tier: "FREE" | "PREMIUM" | "EXPERT"
): Promise<{ success: boolean; user_id: string; new_tier: string }> {
  const res = await betaAdminFetch(`/api/admin/users/${betanalyticUserId}/tier`, {
    method: "POST",
    body: JSON.stringify({ tier }),
  })
  if (!res.ok) throw new Error(`BetAnalytic tier update failed: ${res.status}`)
  return res.json() as Promise<{ success: boolean; user_id: string; new_tier: string }>
}
