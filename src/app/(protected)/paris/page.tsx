"use client"

import { useState, useCallback } from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { VirtualBetSlip } from "~/components/features/virtual/VirtualBetSlip"
import { cn } from "~/lib/utils"
import { Trophy, Clock, TrendingUp, Wallet } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BetSelection {
  id: string
  matchId: string
  homeTeam: string
  awayTeam: string
  market: string
  selection: string
  odds: number
}

interface BetaMatch {
  match_id: string
  home_team: string
  away_team: string
  competition: string
  date_iso: string
  status: string
  odds: { "1": number | null; X: number | null; "2": number | null }
}

interface BetRecord {
  id: string
  match_id: string
  home_team: string
  away_team: string
  prediction_label: string
  odds: number
  stake: number
  potential_win: number
  status: "pending" | "won" | "lost" | "cancelled"
  created_at: string
}

interface Account {
  balance: number
  starting_balance: number
  total_wagered: number
  total_won: number
  pnl: number
  roi_pct: number
  bets_total: number
  bets_pending: number
  bets_settled: number
  win_rate_pct: number
}

interface LeaderboardEntry {
  rank: number
  username: string
  balance: number
  roi_pct: number
  is_me: boolean
}

type Tab = "matches" | "history" | "leaderboard"

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useFetch<T>(url: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status}`)
      setData(await res.json() as T)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps])

  return { data, loading, error, reload: load }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="w-5 h-5 text-accent-cyan" />
        <span className="font-display font-semibold text-text-primary">Mon compte virtuel</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-accent-cyan">{account.balance.toFixed(0)}€</p>
          <p className="text-xs text-text-tertiary mt-1">Solde</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className={cn("text-xl font-bold", account.pnl >= 0 ? "text-accent-green" : "text-accent-red")}>
            {account.pnl >= 0 ? "+" : ""}{account.pnl.toFixed(0)}€
          </p>
          <p className="text-xs text-text-tertiary mt-1">P&L</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-text-primary">{account.win_rate_pct.toFixed(0)}%</p>
          <p className="text-xs text-text-tertiary mt-1">Win rate</p>
        </div>
      </div>
      <div className="flex justify-between text-sm text-text-tertiary">
        <span>{account.bets_pending} en cours</span>
        <span>{account.bets_total} total</span>
        <span>ROI {account.roi_pct >= 0 ? "+" : ""}{account.roi_pct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function MatchOddsCard({
  match,
  onSelect,
  selected,
}: {
  match: BetaMatch
  onSelect: (sel: BetSelection) => void
  selected: string[]
}) {
  const time = new Date(match.date_iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const hasOdds = match.odds["1"] !== null || match.odds.X !== null || match.odds["2"] !== null

  const markets = [
    { key: "1X2:1", label: "1", odds: match.odds["1"], team: match.home_team },
    { key: "1X2:X", label: "N", odds: match.odds.X, team: "Nul" },
    { key: "1X2:2", label: "2", odds: match.odds["2"], team: match.away_team },
  ]

  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {match.home_team} vs {match.away_team}
          </p>
          <p className="text-xs text-text-tertiary">{match.competition} · {time}</p>
        </div>
        {match.status === "inprogress" && (
          <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {hasOdds ? (
        <div className="grid grid-cols-3 gap-2">
          {markets.map((m) => {
            if (m.odds === null) return null
            const selId = `${match.match_id}-${m.key}`
            const isSelected = selected.includes(selId)
            return (
              <button
                key={m.key}
                onClick={() =>
                  onSelect({
                    id: selId,
                    matchId: match.match_id,
                    homeTeam: match.home_team,
                    awayTeam: match.away_team,
                    market: "1X2",
                    selection: m.team,
                    odds: m.odds!,
                  })
                }
                className={cn(
                  "flex flex-col items-center py-2 rounded-lg transition-colors",
                  "min-h-[44px]",
                  isSelected
                    ? "bg-accent-cyan text-bg-primary"
                    : "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80"
                )}
              >
                <span className="text-xs opacity-70">{m.label}</span>
                <span className="font-bold">{m.odds!.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary text-center py-2">Cotes non disponibles</p>
      )}
    </div>
  )
}

function BetHistoryItem({ bet }: { bet: BetRecord }) {
  const statusConfig = {
    pending: { label: "En cours", cls: "text-accent-gold bg-accent-gold/10" },
    won: { label: "Gagné", cls: "text-accent-green bg-accent-green/10" },
    lost: { label: "Perdu", cls: "text-accent-red bg-accent-red/10" },
    cancelled: { label: "Annulé", cls: "text-text-tertiary bg-bg-tertiary" },
  }
  const s = statusConfig[bet.status]

  return (
    <div className="bg-bg-secondary rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {bet.home_team} vs {bet.away_team}
        </p>
        <p className="text-xs text-text-tertiary">{bet.prediction_label} · @{bet.odds.toFixed(2)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-text-primary">{bet.stake.toFixed(0)}€</p>
        <span className={cn("text-xs px-2 py-0.5 rounded-full", s.cls)}>{s.label}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParisPage() {
  const [tab, setTab] = useState<Tab>("matches")
  const [selections, setSelections] = useState<BetSelection[]>([])
  const [placing, setPlacing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const accountFetch = useFetch<Account>("/api/beta/betting/account")
  const matchesFetch = useFetch<{ matches_by_competition: Record<string, BetaMatch[]> }>("/api/beta/matches")
  const historyFetch = useFetch<{ bets: BetRecord[] }>("/api/beta/betting/bet")
  const leaderFetch = useFetch<{ leaderboard: LeaderboardEntry[] }>("/api/beta/betting/leaderboard")

  // Load on tab switch
  const handleTab = (t: Tab) => {
    setTab(t)
    if (t === "matches" && !matchesFetch.data) { void matchesFetch.reload(); void accountFetch.reload() }
    if (t === "history" && !historyFetch.data) { void historyFetch.reload(); void accountFetch.reload() }
    if (t === "leaderboard" && !leaderFetch.data) void leaderFetch.reload()
  }

  // Initial load
  if (!matchesFetch.data && !matchesFetch.loading && tab === "matches") {
    void matchesFetch.reload()
    void accountFetch.reload()
  }

  const allMatches = Object.values(matchesFetch.data?.matches_by_competition ?? {}).flat()
  const selectedIds = selections.map((s) => s.id)

  const handleSelect = (sel: BetSelection) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.id === sel.id)
      if (exists) return prev.filter((s) => s.id !== sel.id)
      // Only one selection per match
      const withoutSameMatch = prev.filter((s) => s.matchId !== sel.matchId)
      return [...withoutSameMatch, sel]
    })
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handlePlaceBet = async (stake: number) => {
    if (selections.length === 0) return
    setPlacing(true)
    try {
      const stakePerBet = stake / selections.length
      for (const sel of selections) {
        const res = await fetch("/api/beta/betting/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match_id: sel.matchId,
            home_team: sel.homeTeam,
            away_team: sel.awayTeam,
            prediction: sel.id.split("-").slice(1).join("-"),
            prediction_label: sel.selection,
            odds: sel.odds,
            stake: stakePerBet,
          }),
        })
        if (!res.ok) throw new Error("Erreur lors du pari")
      }
      setSelections([])
      void accountFetch.reload()
      showToast(`${selections.length} pari${selections.length > 1 ? "s" : ""} placé${selections.length > 1 ? "s" : ""} !`)
    } catch {
      showToast("Erreur lors du placement")
    } finally {
      setPlacing(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "matches", label: "Matchs", icon: <Clock className="w-4 h-4" /> },
    { id: "history", label: "Mes paris", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "leaderboard", label: "Classement", icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-xl font-bold text-text-primary">Paris Virtuels</h1>
        <p className="text-sm text-text-tertiary">1 000€ offerts pour s&apos;entraîner</p>
      </div>

      {/* Account Card */}
      {accountFetch.data && (
        <div className="px-4 pb-3">
          <AccountCard account={accountFetch.data} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-bg-tertiary px-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              tab === t.id
                ? "border-accent-cyan text-accent-cyan"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            )}
          >
            {t.icon}
            {t.label}
            {t.id === "matches" && selections.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-accent-cyan text-bg-primary text-xs rounded-full">
                {selections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 p-4 pb-20 space-y-4 overflow-y-auto">

        {/* ── MATCHES TAB ── */}
        {tab === "matches" && (
          <>
            {matchesFetch.loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl h-28 animate-pulse" />
                ))}
              </div>
            )}
            {matchesFetch.error && (
              <p className="text-center text-accent-red py-8">{matchesFetch.error}</p>
            )}
            {!matchesFetch.loading && allMatches.length === 0 && (
              <p className="text-center text-text-tertiary py-8">Aucun match disponible</p>
            )}

            <div className="space-y-3">
              {allMatches.map((match) => (
                <MatchOddsCard
                  key={match.match_id}
                  match={match}
                  onSelect={handleSelect}
                  selected={selectedIds}
                />
              ))}
            </div>

            {selections.length > 0 && (
              <div className="sticky bottom-4">
                <VirtualBetSlip
                  selections={selections}
                  balance={accountFetch.data?.balance ?? 1000}
                  onRemoveSelection={(id) => setSelections((p) => p.filter((s) => s.id !== id))}
                  onPlaceBet={(stake) => { void handlePlaceBet(stake) }}
                  onClear={() => setSelections([])}
                />
                {placing && (
                  <div className="mt-2 text-center text-sm text-text-tertiary animate-pulse">
                    Placement en cours...
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <>
            {historyFetch.loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl h-16 animate-pulse" />
                ))}
              </div>
            )}
            {!historyFetch.loading && (historyFetch.data?.bets.length ?? 0) === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">Aucun pari placé</p>
                <p className="text-sm text-text-tertiary mt-1">Sélectionne des matchs pour commencer</p>
              </div>
            )}
            <div className="space-y-3">
              {historyFetch.data?.bets.map((bet) => (
                <BetHistoryItem key={bet.id} bet={bet} />
              ))}
            </div>
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <>
            {leaderFetch.loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl h-14 animate-pulse" />
                ))}
              </div>
            )}
            <div className="space-y-2">
              {leaderFetch.data?.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl",
                    entry.is_me ? "bg-accent-cyan/10 border border-accent-cyan/30" : "bg-bg-secondary"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold w-8 text-center",
                    entry.rank === 1 ? "text-accent-gold" :
                    entry.rank === 2 ? "text-text-secondary" :
                    entry.rank === 3 ? "text-amber-600" : "text-text-tertiary"
                  )}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold truncate", entry.is_me ? "text-accent-cyan" : "text-text-primary")}>
                      {entry.username} {entry.is_me && "(moi)"}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      ROI {entry.roi_pct >= 0 ? "+" : ""}{entry.roi_pct.toFixed(1)}%
                    </p>
                  </div>
                  <p className="font-bold text-text-primary shrink-0">{entry.balance.toFixed(0)}€</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <DashboardNav />
    </div>
  )
}
