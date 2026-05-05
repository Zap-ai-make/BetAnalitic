"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "~/lib/utils"
import { Trophy, Clock, TrendingUp, Wallet, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────

type BetStatus = "pending" | "won" | "lost" | "cancelled"
type FilterTab = "all" | "pending" | "won" | "lost"

interface BetRecord {
  id: string
  match_id: string
  home_team: string
  away_team: string
  competition?: string
  prediction_label: string
  prediction: string
  odds: number
  stake: number
  potential_win: number
  status: BetStatus
  created_at: string
  settled_at?: string
  bet_type?: "single" | "combo"
  selections?: Array<{ label: string; odds: number; status?: BetStatus }>
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

// ─── Coupon Card ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BetStatus, { label: string; cls: string; dot: string }> = {
  pending: {
    label: "En cours",
    cls: "text-accent-gold bg-accent-gold/10 border-accent-gold/30",
    dot: "bg-accent-gold animate-pulse",
  },
  won: {
    label: "Gagné",
    cls: "text-accent-green bg-accent-green/10 border-accent-green/30",
    dot: "bg-accent-green",
  },
  lost: {
    label: "Perdu",
    cls: "text-accent-red bg-accent-red/10 border-accent-red/30",
    dot: "bg-accent-red",
  },
  cancelled: {
    label: "Annulé",
    cls: "text-text-tertiary bg-bg-tertiary border-bg-tertiary",
    dot: "bg-text-tertiary",
  },
}

function CouponCard({ bet }: { bet: BetRecord }) {
  const [open, setOpen] = useState(false)
  const s = STATUS_CONFIG[bet.status]
  const date = new Date(bet.created_at).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  const profit =
    bet.status === "won"
      ? bet.potential_win - bet.stake
      : bet.status === "lost"
      ? -bet.stake
      : null

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-xl overflow-hidden border",
        bet.status === "won" ? "border-accent-green/20" :
        bet.status === "lost" ? "border-accent-red/10" :
        bet.status === "pending" ? "border-accent-gold/20" :
        "border-transparent"
      )}
    >
      {/* Header */}
      <button
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary truncate">
              {bet.home_team} vs {bet.away_team}
            </span>
            {bet.bet_type === "combo" && (
              <span className="text-xs px-1.5 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded shrink-0">
                COMBINÉ
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary">{date}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-text-primary">{bet.stake.toFixed(0)}€</p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full border", s.cls)}>
            {s.label}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-text-tertiary shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
        )}
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-bg-tertiary pt-3">
          {/* Selection(s) */}
          {bet.selections && bet.selections.length > 0 ? (
            <div className="space-y-2">
              {bet.selections.map((sel, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{sel.label}</span>
                  <span className="font-bold text-accent-cyan">@{sel.odds.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{bet.prediction_label}</span>
              <span className="font-bold text-accent-cyan">@{bet.odds.toFixed(2)}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-bg-tertiary">
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Mise</p>
              <p className="font-bold text-text-primary">{bet.stake.toFixed(0)}€</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">Cote</p>
              <p className="font-bold text-accent-cyan">{bet.odds.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary">
                {bet.status === "pending" ? "Gain potentiel" : "Gain"}
              </p>
              <p className={cn(
                "font-bold",
                bet.status === "won" ? "text-accent-green" :
                bet.status === "lost" ? "text-accent-red" : "text-text-primary"
              )}>
                {bet.status === "won"
                  ? `+${profit?.toFixed(0)}€`
                  : bet.status === "lost"
                  ? `${profit?.toFixed(0)}€`
                  : `${bet.potential_win.toFixed(0)}€`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [bets, setBets] = useState<BetRecord[]>([])
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    try {
      const [betsRes, accRes] = await Promise.all([
        fetch("/api/beta/betting/bet"),
        fetch("/api/beta/betting/account"),
      ])
      if (betsRes.ok) {
        const data = await betsRes.json() as { bets: BetRecord[] }
        setBets(data.bets ?? [])
      }
      if (accRes.ok) {
        setAccount(await accRes.json() as Account)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = bets.filter((b) => filter === "all" || b.status === filter)

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tous", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "pending", label: "En cours", icon: <Clock className="w-3.5 h-3.5" /> },
    { id: "won", label: "Gagnés", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "lost", label: "Perdus", icon: null },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Title + Refresh */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">Mes Coupons</h1>
          <p className="text-sm text-text-tertiary">Historique de vos paris virtuels</p>
        </div>
        <button
          onClick={() => { void load() }}
          disabled={refreshing}
          className="p-2 rounded-lg bg-bg-secondary text-text-tertiary hover:text-text-primary transition-colors"
        >
          <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Account Summary */}
      {account && (
        <div className="px-4 pb-3">
          <div className="bg-bg-secondary rounded-xl p-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wallet className="w-4 h-4 text-accent-cyan" />
              </div>
              <p className="font-bold text-accent-cyan text-sm">{account.balance.toFixed(0)}€</p>
              <p className="text-xs text-text-tertiary">Solde</p>
            </div>
            <div className="text-center">
              <p className={cn("font-bold text-sm", account.pnl >= 0 ? "text-accent-green" : "text-accent-red")}>
                {account.pnl >= 0 ? "+" : ""}{account.pnl.toFixed(0)}€
              </p>
              <p className="text-xs text-text-tertiary">P&L</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-text-primary text-sm">{account.win_rate_pct.toFixed(0)}%</p>
              <p className="text-xs text-text-tertiary">Win rate</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-text-primary text-sm">{account.bets_pending}</p>
              <p className="text-xs text-text-tertiary">En cours</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {tabs.map((t) => {
          const count = t.id === "all" ? bets.length : bets.filter((b) => b.status === t.id).length
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors",
                filter === t.id
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-secondary text-text-tertiary hover:text-text-primary"
              )}
            >
              {t.icon}
              {t.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  filter === t.id ? "bg-bg-primary/20 text-bg-primary" : "bg-bg-tertiary text-text-tertiary"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <main className="flex-1 px-4 pb-20 space-y-3 overflow-y-auto">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-secondary rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary font-medium">
              {filter === "pending" ? "Aucun pari en cours"
               : filter === "won" ? "Aucun pari gagné pour l'instant"
               : filter === "lost" ? "Aucun pari perdu"
               : "Aucun coupon"}
            </p>
            <p className="text-sm text-text-tertiary mt-1">
              Vos paris apparaîtront ici après placement
            </p>
          </div>
        )}

        {!loading && filtered.map((bet) => (
          <CouponCard key={bet.id} bet={bet} />
        ))}
      </main>

    </div>
  )
}
