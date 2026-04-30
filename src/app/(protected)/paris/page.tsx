"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"
import { cn } from "~/lib/utils"
import {
  Wallet, Pencil, Check, X, Trash2, TicketPlus,
  Clock, History, ChevronRight, Loader2, TrendingUp,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = "FCFA" | "USD" | "EUR"
type OddKey = "1" | "X" | "2"
type Tab = "coupon" | "encours" | "historique"
type BetStatus = "pending" | "won" | "lost" | "cancelled"

interface CouponLeg {
  matchId: string
  homeTeam: string
  awayTeam: string
  predictionLabel: string   // e.g. "V1 — PSG"
  outcomeCode?: string      // "V1" | "X" | "V2"
  apiPrediction?: string    // "home" | "draw" | "away"
  odds: number
}

interface LocalCoupon {
  id: string
  legs: CouponLeg[]
  totalOdds: number
  stake: number
  potentialWin: number
  status: BetStatus
  createdAt: string
}

interface ApiBet {
  id: string
  match_id: string
  home_team: string
  away_team: string
  prediction_label: string
  odds: number
  stake: number
  potential_win: number
  status: BetStatus
  created_at: string
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const BALANCE_KEY    = "betanalytic-virtual-balance"
const COUPONS_KEY    = "betanalytic-local-coupons"
const OLD_BETS_KEY   = "betanalytic-local-bets"   // legacy — migrated on mount

function readCoupons(): LocalCoupon[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(COUPONS_KEY) ?? "[]") as LocalCoupon[] }
  catch { return [] }
}

function writeCoupons(c: LocalCoupon[]) {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(c))
}

function readBalance(): { amount: number; currency: Currency } {
  if (typeof window === "undefined") return { amount: 50000, currency: "FCFA" }
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    if (raw) return JSON.parse(raw) as { amount: number; currency: Currency }
  } catch { /* ignore */ }
  return { amount: 50000, currency: "FCFA" }
}

/** Convert old per-match BetRecord list into a single LocalCoupon per bet */
function migrateLegacy(): LocalCoupon[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(OLD_BETS_KEY)
  if (!raw) return []
  try {
    type OldBet = {
      id: string; match_id: string; home_team: string; away_team: string
      prediction_label: string; odds: number; stake: number; potential_win: number
      status: BetStatus; created_at: string
    }
    const old = JSON.parse(raw) as OldBet[]
    return old.map((b): LocalCoupon => ({
      id: `migrated-${b.id}`,
      legs: [{ matchId: b.match_id, homeTeam: b.home_team, awayTeam: b.away_team, predictionLabel: b.prediction_label, odds: b.odds }],
      totalOdds: b.odds,
      stake: b.stake,
      potentialWin: b.potential_win,
      status: b.status,
      createdAt: b.created_at,
    }))
  } catch { return [] }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<Currency, string> = { FCFA: "FCFA", USD: "$", EUR: "€" }

function fmtAmount(n: number, currency: Currency) {
  const s = Math.round(n).toLocaleString("fr-FR")
  return currency === "FCFA" ? `${s} FCFA` : currency === "USD" ? `$${s}` : `${s} €`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

// Stable fetch hook — reload ref avoids stale closure, betsFetched guards double-call
function useApiBets() {
  const [bets, setBets]       = useState<ApiBet[]>([])
  const [loading, setLoading] = useState(false)
  const loadedRef             = useRef(false)

  const load = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    try {
      const res = await fetch("/api/beta/betting/bet")
      if (!res.ok) throw new Error()
      const data = await res.json() as { bets: ApiBet[] }
      setBets(data.bets ?? [])
    } catch { /* API optional — local coupons are source of truth */ }
    finally { setLoading(false) }
  }, [])

  const reload = useCallback(() => {
    loadedRef.current = false
    void load()
  }, [load])

  return { bets, loading, load, reload }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BetStatus }) {
  const cfg: Record<BetStatus, { label: string; cls: string }> = {
    pending:   { label: "En cours", cls: "bg-accent-gold/15 text-accent-gold" },
    won:       { label: "Gagné",    cls: "bg-accent-green/15 text-accent-green" },
    lost:      { label: "Perdu",    cls: "bg-accent-red/15 text-accent-red" },
    cancelled: { label: "Annulé",  cls: "bg-bg-tertiary text-text-tertiary" },
  }
  const { label, cls } = cfg[status]
  return <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", cls)}>{label}</span>
}

// ─── Balance bar ──────────────────────────────────────────────────────────────

function BalanceBar({ balance, currency, onSave }: {
  balance: number; currency: Currency; onSave: (a: number, c: Currency) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftAmt, setDraftAmt] = useState("")
  const [draftCur, setDraftCur] = useState<Currency>(currency)

  const open = () => { setDraftAmt(String(balance)); setDraftCur(currency); setEditing(true) }
  const confirm = () => {
    const n = parseFloat(draftAmt.replace(/[\s ]/g, "").replace(",", "."))
    if (!isNaN(n) && n >= 0) onSave(n, draftCur)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-bg-tertiary">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-accent-cyan" />
        <span className="text-sm font-semibold text-text-primary">Paris Virtuels</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="number"
            value={draftAmt}
            onChange={(e) => setDraftAmt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirm(); if (e.key === "Escape") setEditing(false) }}
            className="w-28 bg-bg-tertiary rounded-lg px-2 py-1 text-sm text-text-primary outline-none text-right font-mono"
          />
          <select
            value={draftCur}
            onChange={(e) => setDraftCur(e.target.value as Currency)}
            className="bg-bg-tertiary rounded-lg px-1 py-1 text-xs text-text-primary outline-none"
          >
            <option value="FCFA">FCFA</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <button onClick={confirm}            className="text-accent-green transition-opacity hover:opacity-70"><Check className="w-4 h-4" /></button>
          <button onClick={() => setEditing(false)} className="text-text-tertiary hover:text-text-primary transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <button onClick={open} className="flex items-center gap-2 group">
          <span className="font-mono font-bold text-accent-cyan text-sm">{fmtAmount(balance, currency)}</span>
          <Pencil className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors" />
        </button>
      )}
    </div>
  )
}

// ─── Coupon builder card (onglet Coupon) ──────────────────────────────────────

function MatchBuilderCard({ match, selected, onSelect, onRemove }: {
  match: { id: string; homeTeam: string; awayTeam: string; league: string; time: string; odds?: { "1": number; X: number; "2": number } }
  selected: OddKey | undefined
  onSelect: (key: OddKey) => void
  onRemove: () => void
}) {
  // V1 = domicile gagne, X = nul, V2 = extérieur gagne (style 1xbet FR)
  const btns: { key: OddKey; label: string; sub: string }[] = [
    { key: "1", label: "V1", sub: match.homeTeam },
    { key: "X", label: "X",  sub: "Nul" },
    { key: "2", label: "V2", sub: match.awayTeam },
  ]
  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{match.homeTeam} vs {match.awayTeam}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{match.league} · {match.time}</p>
        </div>
        <button onClick={onRemove} className="text-text-tertiary hover:text-accent-red transition-colors shrink-0 mt-0.5">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {match.odds ? (
        <div className="grid grid-cols-3 gap-1.5">
          {btns.map(({ key, label, sub }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                "flex flex-col items-center py-2.5 px-1 rounded-lg transition-all min-h-11 gap-0.5",
                selected === key
                  ? "bg-accent-cyan text-bg-primary shadow-sm shadow-accent-cyan/30"
                  : "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/60"
              )}
            >
              <span className={cn("text-[10px] font-bold", selected === key ? "opacity-90" : "text-accent-cyan")}>{label}</span>
              <span className="font-bold font-mono text-sm leading-none">{match.odds![key].toFixed(2)}</span>
              <span className={cn("text-[9px] truncate max-w-full px-1 leading-none", selected === key ? "opacity-75" : "text-text-tertiary")}>{sub}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary text-center py-1.5 bg-bg-tertiary/50 rounded-lg">Cotes non disponibles</p>
      )}
    </div>
  )
}

// ─── Local coupon card (En cours / Historique) ────────────────────────────────

function LocalCouponCard({ coupon, currency }: { coupon: LocalCoupon; currency: Currency }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-text-primary">
            Coupon combiné · {coupon.legs.length} match{coupon.legs.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{fmtDate(coupon.createdAt)}</p>
        </div>
        <StatusBadge status={coupon.status} />
      </div>

      <div className="space-y-1.5">
        {coupon.legs.map((leg, i) => {
          const code = leg.outcomeCode ?? leg.predictionLabel.split(" — ")[0] ?? "?"
          const teamName = leg.predictionLabel.split(" — ")[1] ?? ""
          return (
            <div key={i} className="flex items-center gap-2 bg-bg-tertiary/60 rounded-lg px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{leg.homeTeam} vs {leg.awayTeam}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold bg-accent-cyan/20 text-accent-cyan px-1.5 py-0.5 rounded shrink-0">{code}</span>
                  {teamName && <span className="text-[10px] text-text-tertiary truncate">{teamName}</span>}
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-text-primary shrink-0">×{leg.odds.toFixed(2)}</span>
            </div>
          )
        })}
      </div>

      <div className="border-t border-bg-tertiary pt-2.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-text-tertiary mb-0.5">Cote totale</p>
          <p className="font-mono font-bold text-sm text-text-primary">×{coupon.totalOdds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary mb-0.5">Mise</p>
          <p className="font-mono font-bold text-sm text-text-primary">{fmtAmount(coupon.stake, currency)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary mb-0.5">Gain potentiel</p>
          <p className={cn("font-mono font-bold text-sm", coupon.status === "won" ? "text-accent-green" : "text-accent-cyan")}>
            {fmtAmount(coupon.potentialWin, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── API bet card ─────────────────────────────────────────────────────────────

function ApiBetCard({ bet, currency }: { bet: ApiBet; currency: Currency }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{bet.home_team} vs {bet.away_team}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{bet.prediction_label} · @{bet.odds.toFixed(2)} · {fmtDate(bet.created_at)}</p>
        </div>
        <StatusBadge status={bet.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-bg-tertiary/60 rounded-lg px-3 py-2">
          <p className="text-[10px] text-text-tertiary mb-0.5">Mise</p>
          <p className="font-mono font-bold text-sm text-text-primary">{fmtAmount(bet.stake, currency)}</p>
        </div>
        {(bet.status === "pending" || bet.status === "won") && (
          <div className="bg-bg-tertiary/60 rounded-lg px-3 py-2">
            <p className="text-[10px] text-text-tertiary mb-0.5">Gain potentiel</p>
            <p className={cn("font-mono font-bold text-sm", bet.status === "won" ? "text-accent-green" : "text-accent-cyan")}>
              {fmtAmount(bet.potential_win, currency)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-text-tertiary">
        {icon}
      </div>
      <p className="font-semibold text-text-primary">{title}</p>
      <p className="text-sm text-text-tertiary">{sub}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParisPage() {
  const router = useRouter()
  const { matches: couponMatches, removeMatch, clearCoupon } = useCouponStore()

  // Balance — lazy init from localStorage (no hydration flash)
  const [balance,  setBalance]  = useState(() => readBalance().amount)
  const [currency, setCurrency] = useState<Currency>(() => readBalance().currency)

  // Local coupons — lazy init + migration from legacy format
  const [coupons, setCoupons] = useState<LocalCoupon[]>(() => {
    const existing = readCoupons()
    const migrated = migrateLegacy()
    if (migrated.length > 0) {
      // merge: migrated first, then existing (deduplicated)
      const existingIds = new Set(existing.map((c) => c.id))
      const merged = [...migrated.filter((c) => !existingIds.has(c.id)), ...existing]
      writeCoupons(merged)
      localStorage.removeItem(OLD_BETS_KEY)
      return merged
    }
    return existing
  })

  // Coupon builder state
  const [oddsSelection, setOddsSelection] = useState<Record<string, OddKey>>({})
  const [stake,   setStake]   = useState(1000)
  const [placing, setPlacing] = useState(false)
  const [toast,   setToast]   = useState<string | null>(null)
  const [tab,     setTab]     = useState<Tab>("coupon")

  // API bets (optional — enriches En cours / Historique with real results)
  const { bets: apiBets, loading: apiLoading, load: loadApi } = useApiBets()

  // Load API once when switching to En cours or Historique
  useEffect(() => {
    if (tab === "encours" || tab === "historique") void loadApi()
  }, [tab, loadApi])

  const saveBalance = (amount: number, cur: Currency) => {
    setBalance(amount); setCurrency(cur)
    localStorage.setItem(BALANCE_KEY, JSON.stringify({ amount, currency: cur }))
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const handleOddSelect = (matchId: string, key: OddKey) => {
    setOddsSelection((prev) =>
      prev[matchId] === key
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== matchId))
        : { ...prev, [matchId]: key }
    )
  }

  const handleRemoveMatch = (matchId: string) => {
    removeMatch(matchId)
    setOddsSelection((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== matchId)))
  }

  // ── Accumulated odds ──────────────────────────────────────────────────────
  const matchesWithOdd = couponMatches.filter((m) => oddsSelection[m.id])
  const totalOdds    = matchesWithOdd.reduce((acc, m) => acc * (m.odds?.[oddsSelection[m.id]!] ?? 1), 1)
  const potentialWin = stake * totalOdds
  const canPlace     = matchesWithOdd.length > 0 && stake > 0 && stake <= balance

  // ── Place coupon ──────────────────────────────────────────────────────────
  const handlePlaceBet = async () => {
    if (!canPlace || placing) return
    setPlacing(true)
    try {
      const legs: CouponLeg[] = matchesWithOdd.map((m) => {
        const key = oddsSelection[m.id]!
        // Store V1/X/V2 as outcome code + team name for display
        const outcomeCode: Record<OddKey, string> = { "1": "V1", X: "X", "2": "V2" }
        const apiPrediction: Record<OddKey, string> = { "1": "home", X: "draw", "2": "away" }
        const teamLabel: Record<OddKey, string> = { "1": m.homeTeam, X: "Nul", "2": m.awayTeam }
        return {
          matchId: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
          predictionLabel: `${outcomeCode[key]} — ${teamLabel[key]}`,
          outcomeCode: outcomeCode[key],
          apiPrediction: apiPrediction[key],
          odds: m.odds?.[key] ?? 1,
        }
      })

      await Promise.allSettled(
        legs.map((leg) =>
          fetch("/api/beta/betting/bet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              match_id: leg.matchId,
              home_team: leg.homeTeam,
              away_team: leg.awayTeam,
              prediction: leg.apiPrediction,
              prediction_label: leg.predictionLabel,
              odds: leg.odds,
              stake: stake / legs.length,
            }),
          })
        )
      )

      // Always persist coupon locally as single unit
      const coupon: LocalCoupon = {
        id: `coupon-${Date.now()}`,
        legs,
        totalOdds,
        stake,
        potentialWin,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
      const updated = [coupon, ...readCoupons()]
      writeCoupons(updated)
      setCoupons(updated)

      saveBalance(balance - stake, currency)
      clearCoupon()
      setOddsSelection({})
      showToast(`✓ Coupon placé — Gain potentiel : ${fmtAmount(potentialWin, currency)}`)
      setTab("encours")
    } catch {
      showToast("Erreur inattendue — réessaie")
    } finally {
      setPlacing(false)
    }
  }

  // ── Derived lists ─────────────────────────────────────────────────────────
  const localIds     = new Set(coupons.map((c) => c.id))
  // Exclude API bets whose match_id corresponds to a local coupon leg (dedup)
  const localLegIds  = new Set(coupons.flatMap((c) => c.legs.map((l) => l.matchId)))
  const uniqueApiBets = apiBets.filter((b) => !localLegIds.has(b.match_id))

  const pendingCoupons = coupons.filter((c) => c.status === "pending")
  const historyCoupons = coupons.filter((c) => c.status !== "pending")
  const pendingApi     = uniqueApiBets.filter((b) => b.status === "pending")
  const historyApi     = uniqueApiBets.filter((b) => b.status !== "pending")

  const totalPending   = pendingCoupons.length + pendingApi.length

  void localIds // suppress unused warning

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "coupon",     label: "Coupon",     icon: <TicketPlus className="w-4 h-4" />, badge: couponMatches.length || undefined },
    { id: "encours",    label: "En cours",   icon: <Clock className="w-4 h-4" />,      badge: totalPending || undefined },
    { id: "historique", label: "Historique", icon: <History className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-accent-cyan text-bg-primary rounded-xl shadow-lg text-sm font-semibold max-w-72 text-center">
          {toast}
        </div>
      )}

      <BalanceBar balance={balance} currency={currency} onSave={saveBalance} />

      {/* Tabs */}
      <div className="flex border-b border-bg-tertiary px-2 bg-bg-primary">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors flex-1 justify-center",
              tab === t.id ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-tertiary hover:text-text-primary"
            )}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge != null && t.badge > 0 && (
              <span className={cn(
                "min-w-4.5 h-4.5 text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                tab === t.id ? "bg-accent-cyan text-bg-primary" : "bg-bg-tertiary text-text-secondary"
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto pb-24">

        {/* ── COUPON TAB ────────────────────────────────────────────────────── */}
        {tab === "coupon" && (
          <div className="p-4 space-y-3">
            {couponMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-bg-secondary flex items-center justify-center">
                  <TicketPlus className="w-7 h-7 text-text-tertiary" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Coupon vide</p>
                  <p className="text-sm text-text-tertiary mt-1">Ajoute des matchs depuis la page Matchs</p>
                </div>
                <button
                  onClick={() => router.push("/matches")}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/15 text-accent-cyan rounded-lg text-sm font-medium hover:bg-accent-cyan/25 transition-colors"
                >
                  Voir les matchs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {couponMatches.map((m) => (
                    <MatchBuilderCard
                      key={m.id}
                      match={m}
                      selected={oddsSelection[m.id]}
                      onSelect={(key) => handleOddSelect(m.id, key)}
                      onRemove={() => handleRemoveMatch(m.id)}
                    />
                  ))}
                </div>

                {/* Sticky recap */}
                <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-2 bg-bg-primary/95 backdrop-blur border-t border-bg-tertiary space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-tertiary text-xs">{matchesWithOdd.length}/{couponMatches.length} cotes sélectionnées</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-tertiary text-xs">Cote totale</span>
                      <span className="font-mono font-bold text-accent-cyan">×{totalOdds.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-bg-secondary rounded-xl px-4 py-3">
                    <span className="text-xs text-text-tertiary shrink-0">Mise</span>
                    <input
                      type="number"
                      min={0}
                      value={stake}
                      onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                      className="flex-1 bg-transparent text-right font-mono font-bold text-text-primary outline-none text-base"
                    />
                    <span className="text-xs text-text-tertiary shrink-0">{CURRENCY_SYMBOLS[currency]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-tertiary">Gain potentiel</span>
                    <span className="font-mono font-bold text-accent-green">{fmtAmount(potentialWin, currency)}</span>
                  </div>

                  {stake > balance && (
                    <p className="text-xs text-accent-red text-center -mt-1">Solde insuffisant — max {fmtAmount(balance, currency)}</p>
                  )}

                  <div className="flex gap-2 pb-1">
                    <button
                      onClick={() => { clearCoupon(); setOddsSelection({}) }}
                      className="shrink-0 px-4 py-2.5 bg-bg-tertiary text-text-secondary rounded-xl text-sm font-medium hover:bg-bg-tertiary/70 transition-colors"
                    >
                      Vider
                    </button>
                    <button
                      onClick={() => { void handlePlaceBet() }}
                      disabled={!canPlace || placing}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                        canPlace && !placing
                          ? "bg-accent-cyan text-bg-primary hover:opacity-90 active:scale-[0.98]"
                          : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                      )}
                    >
                      {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Valider le coupon
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EN COURS TAB ──────────────────────────────────────────────────── */}
        {tab === "encours" && (
          <div className="p-4 space-y-3">
            {/* Local coupons — always available instantly */}
            {pendingCoupons.map((c) => <LocalCouponCard key={c.id} coupon={c} currency={currency} />)}

            {/* API bets — shown after load */}
            {pendingApi.map((b) => <ApiBetCard key={b.id} bet={b} currency={currency} />)}

            {/* API loading indicator — only while fetching, not blocking */}
            {apiLoading && pendingCoupons.length === 0 && (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="bg-bg-secondary rounded-xl h-36 animate-pulse" />)}
              </div>
            )}

            {/* Empty state — only when we're sure nothing exists */}
            {!apiLoading && totalPending === 0 && (
              <EmptyState
                icon={<Clock className="w-6 h-6" />}
                title="Aucun pari en cours"
                sub="Tes coupons actifs apparaîtront ici"
              />
            )}
          </div>
        )}

        {/* ── HISTORIQUE TAB ────────────────────────────────────────────────── */}
        {tab === "historique" && (
          <div className="p-4 space-y-3">
            {historyCoupons.map((c) => <LocalCouponCard key={c.id} coupon={c} currency={currency} />)}
            {historyApi.map((b)     => <ApiBetCard key={b.id} bet={b} currency={currency} />)}

            {apiLoading && historyCoupons.length === 0 && (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="bg-bg-secondary rounded-xl h-36 animate-pulse" />)}
              </div>
            )}

            {!apiLoading && historyCoupons.length === 0 && historyApi.length === 0 && (
              <EmptyState
                icon={<TrendingUp className="w-6 h-6" />}
                title="Aucun historique"
                sub="Tes coupons terminés apparaîtront ici"
              />
            )}
          </div>
        )}

      </main>

      <DashboardNav />
    </div>
  )
}
