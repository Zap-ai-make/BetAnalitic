"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"
import { cn } from "~/lib/utils"
import {
  Wallet, Pencil, Check, X, Trash2, TicketPlus,
  Clock, History, ChevronRight, Loader2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = "FCFA" | "USD" | "EUR"
type OddKey = "1" | "X" | "2"
type Tab = "coupon" | "encours" | "historique"

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

// ─── Constants ────────────────────────────────────────────────────────────────

const BALANCE_KEY = "betanalytic-virtual-balance"
const LOCAL_BETS_KEY = "betanalytic-local-bets"
const CURRENCY_SYMBOLS: Record<Currency, string> = { FCFA: "FCFA", USD: "$", EUR: "€" }

const DEFAULT_BALANCE = { amount: 50000, currency: "FCFA" as Currency }

function loadLocalBets(): BetRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BETS_KEY) ?? "[]") as BetRecord[]
  } catch { return [] }
}

function saveLocalBets(bets: BetRecord[]) {
  localStorage.setItem(LOCAL_BETS_KEY, JSON.stringify(bets))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtAmount(n: number, currency: Currency) {
  const s = Math.round(n).toLocaleString("fr-FR")
  return currency === "FCFA" ? `${s} FCFA` : currency === "USD" ? `$${s}` : `${s} €`
}

function useFetch<T>(url: string) {
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
  }, [url])

  return { data, loading, error, reload: load }
}

// ─── Balance header ───────────────────────────────────────────────────────────

function BalanceBar({
  balance, currency, onSave,
}: {
  balance: number
  currency: Currency
  onSave: (amount: number, currency: Currency) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftAmount, setDraftAmount] = useState(String(balance))
  const [draftCurrency, setDraftCurrency] = useState<Currency>(currency)

  const open = () => {
    setDraftAmount(String(balance))
    setDraftCurrency(currency)
    setEditing(true)
  }

  const confirm = () => {
    const n = parseFloat(draftAmount.replace(/\s/g, "").replace(",", "."))
    if (!isNaN(n) && n >= 0) onSave(n, draftCurrency)
    setEditing(false)
  }

  const cancel = () => setEditing(false)

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
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel() }}
            className="w-28 bg-bg-tertiary rounded-lg px-2 py-1 text-sm text-text-primary outline-none text-right font-mono"
          />
          <select
            value={draftCurrency}
            onChange={(e) => setDraftCurrency(e.target.value as Currency)}
            className="bg-bg-tertiary rounded-lg px-1 py-1 text-xs text-text-primary outline-none"
          >
            <option value="FCFA">FCFA</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <button onClick={confirm} className="text-accent-green hover:opacity-80 transition-opacity">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={cancel} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={open}
          className="flex items-center gap-2 group"
        >
          <span className="font-mono font-bold text-accent-cyan text-sm">
            {fmtAmount(balance, currency)}
          </span>
          <Pencil className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-primary transition-colors" />
        </button>
      )}
    </div>
  )
}

// ─── Coupon match card ────────────────────────────────────────────────────────

function CouponMatchCard({
  match,
  selected,
  onSelect,
  onRemove,
}: {
  match: { id: string; homeTeam: string; awayTeam: string; league: string; time: string; odds?: { "1": number; X: number; "2": number } }
  selected: OddKey | undefined
  onSelect: (key: OddKey) => void
  onRemove: () => void
}) {
  const oddsButtons: { key: OddKey; label: string }[] = [
    { key: "1", label: "1" },
    { key: "X", label: "N" },
    { key: "2", label: "2" },
  ]

  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{match.league} · {match.time}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-text-tertiary hover:text-accent-red transition-colors mt-0.5 shrink-0"
          aria-label="Retirer du coupon"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {match.odds ? (
        <div className="grid grid-cols-3 gap-2">
          {oddsButtons.map(({ key, label }) => {
            const val = match.odds![key]
            const isSelected = selected === key
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                  "flex flex-col items-center py-2.5 rounded-lg transition-all min-h-11",
                  isSelected
                    ? "bg-accent-cyan text-bg-primary shadow-lg shadow-accent-cyan/20"
                    : "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/60"
                )}
              >
                <span className="text-[10px] font-medium opacity-70 mb-0.5">{label}</span>
                <span className="font-bold font-mono text-sm">{val.toFixed(2)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary text-center py-1.5 bg-bg-tertiary/50 rounded-lg">
          Cotes non disponibles
        </p>
      )}
    </div>
  )
}

// ─── Bet card ─────────────────────────────────────────────────────────────────

function BetCard({ bet, currency }: { bet: BetRecord; currency: Currency }) {
  const statusCfg = {
    pending: { label: "En cours", cls: "bg-accent-gold/15 text-accent-gold" },
    won:     { label: "Gagné",    cls: "bg-accent-green/15 text-accent-green" },
    lost:    { label: "Perdu",    cls: "bg-accent-red/15 text-accent-red" },
    cancelled: { label: "Annulé", cls: "bg-bg-tertiary text-text-tertiary" },
  }
  const s = statusCfg[bet.status]
  const date = new Date(bet.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })

  return (
    <div className="bg-bg-secondary rounded-xl p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {bet.home_team} vs {bet.away_team}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{bet.prediction_label} · @{bet.odds.toFixed(2)} · {date}</p>
        </div>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", s.cls)}>
          {s.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-tertiary">Mise</span>
        <span className="font-mono font-bold text-text-primary">{fmtAmount(bet.stake, currency)}</span>
      </div>
      {bet.status === "pending" || bet.status === "won" ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-tertiary">Gain potentiel</span>
          <span className={cn("font-mono font-bold", bet.status === "won" ? "text-accent-green" : "text-accent-cyan")}>
            {fmtAmount(bet.potential_win, currency)}
          </span>
        </div>
      ) : null}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParisPage() {
  const router = useRouter()
  const { matches: couponMatches, removeMatch, clearCoupon } = useCouponStore()

  // Balance
  const [balance, setBalance] = useState(DEFAULT_BALANCE.amount)
  const [currency, setCurrency] = useState<Currency>(DEFAULT_BALANCE.currency)

  // Coupon state
  const [oddsSelection, setOddsSelection] = useState<Record<string, OddKey>>({})
  const [stake, setStake] = useState(1000)
  const [placing, setPlacing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Tabs
  const [tab, setTab] = useState<Tab>("coupon")

  // Local bets (fallback when API rejects mock match IDs)
  const [localBets, setLocalBets] = useState<BetRecord[]>([])

  // API
  const betsFetch = useFetch<{ bets: BetRecord[] }>("/api/beta/betting/bet")

  // Load balance + local bets from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(BALANCE_KEY)
    if (raw) {
      try {
        const d = JSON.parse(raw) as { amount: number; currency: Currency }
        setBalance(d.amount)
        setCurrency(d.currency)
      } catch { /* ignore */ }
    }
    setLocalBets(loadLocalBets())
  }, [])

  // Load bets when switching tabs
  useEffect(() => {
    if ((tab === "encours" || tab === "historique") && !betsFetch.data && !betsFetch.loading) {
      void betsFetch.reload()
    }
  }, [tab, betsFetch])

  const saveBalance = (amount: number, cur: Currency) => {
    setBalance(amount)
    setCurrency(cur)
    localStorage.setItem(BALANCE_KEY, JSON.stringify({ amount, currency: cur }))
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleOddSelect = (matchId: string, key: OddKey) => {
    setOddsSelection((prev) =>
      prev[matchId] === key
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== matchId))
        : { ...prev, [matchId]: key }
    )
  }

  const handleRemoveMatch = (matchId: string) => {
    removeMatch(matchId)
    setOddsSelection((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => k !== matchId))
    )
  }

  // Accumulated odds (only matches with a selected odd)
  const matchesWithSelection = couponMatches.filter((m) => oddsSelection[m.id])
  const totalOdds = matchesWithSelection.reduce((acc, m) => {
    const key = oddsSelection[m.id]!
    const val = m.odds?.[key] ?? 1
    return acc * val
  }, 1)
  const potentialWin = stake * totalOdds
  const canPlace = matchesWithSelection.length > 0 && stake > 0 && stake <= balance

  const handlePlaceBet = async () => {
    if (!canPlace || placing) return
    setPlacing(true)
    try {
      const n = matchesWithSelection.length
      const newLocalBets: BetRecord[] = []

      for (const m of matchesWithSelection) {
        const key = oddsSelection[m.id]!
        const odds = m.odds?.[key] ?? 1
        const legStake = stake / n
        const labelMap: Record<OddKey, string> = {
          "1": m.homeTeam, X: "Nul", "2": m.awayTeam,
        }
        let savedToApi = false
        try {
          const res = await fetch("/api/beta/betting/bet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              match_id: m.id,
              home_team: m.homeTeam,
              away_team: m.awayTeam,
              prediction: key === "1" ? "home" : key === "2" ? "away" : "draw",
              prediction_label: labelMap[key],
              odds,
              stake: legStake,
            }),
          })
          savedToApi = res.ok
        } catch { /* network error — fall through to local */ }

        if (!savedToApi) {
          newLocalBets.push({
            id: `local-${Date.now()}-${m.id}`,
            match_id: m.id,
            home_team: m.homeTeam,
            away_team: m.awayTeam,
            prediction_label: labelMap[key],
            odds,
            stake: legStake,
            potential_win: legStake * odds,
            status: "pending",
            created_at: new Date().toISOString(),
          })
        }
      }

      if (newLocalBets.length > 0) {
        const updated = [...loadLocalBets(), ...newLocalBets]
        saveLocalBets(updated)
        setLocalBets(updated)
      }

      saveBalance(balance - stake, currency)
      clearCoupon()
      setOddsSelection({})
      showToast(`Coupon placé ! Gain potentiel : ${fmtAmount(potentialWin, currency)}`)
      setTab("encours")
      void betsFetch.reload()
    } catch {
      showToast("Erreur inattendue — réessaie")
    } finally {
      setPlacing(false)
    }
  }

  // Merge API bets + local bets (dedup by id)
  const apiBets = betsFetch.data?.bets ?? []
  const apiIds = new Set(apiBets.map((b) => b.id))
  const allBets = [...apiBets, ...localBets.filter((b) => !apiIds.has(b.id))]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pendingBets = allBets.filter((b) => b.status === "pending")
  const historyBets = allBets.filter((b) => b.status !== "pending")

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "coupon",     label: "Coupon",      icon: <TicketPlus className="w-4 h-4" />, badge: couponMatches.length || undefined },
    { id: "encours",    label: "En cours",    icon: <Clock className="w-4 h-4" />, badge: pendingBets.length || undefined },
    { id: "historique", label: "Historique",  icon: <History className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg shadow-lg text-sm font-medium max-w-xs text-center">
          {toast}
        </div>
      )}

      {/* Balance bar */}
      <BalanceBar balance={balance} currency={currency} onSave={saveBalance} />

      {/* Tabs */}
      <div className="flex border-b border-bg-tertiary px-4 bg-bg-primary">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              tab === t.id
                ? "border-accent-cyan text-accent-cyan"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            )}
          >
            {t.icon}
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span className={cn(
                "ml-1 min-w-4.5 h-4.5 text-[10px] font-bold rounded-full flex items-center justify-center px-1",
                tab === t.id ? "bg-accent-cyan text-bg-primary" : "bg-bg-tertiary text-text-secondary"
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto pb-24">

        {/* ── COUPON TAB ── */}
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
                {couponMatches.map((m) => (
                  <CouponMatchCard
                    key={m.id}
                    match={m}
                    selected={oddsSelection[m.id]}
                    onSelect={(key) => handleOddSelect(m.id, key)}
                    onRemove={() => handleRemoveMatch(m.id)}
                  />
                ))}

                {/* Sticky summary */}
                <div className="sticky bottom-0 -mx-4 px-4 pb-2 pt-3 bg-bg-primary/95 backdrop-blur border-t border-bg-tertiary space-y-3">

                  {/* Odds summary */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-tertiary">
                      {matchesWithSelection.length}/{couponMatches.length} cotes sélectionnées
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-tertiary text-xs">Cote totale</span>
                      <span className="font-mono font-bold text-accent-cyan">×{totalOdds.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Stake input */}
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

                  {/* Gain + solde */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-tertiary">Gain potentiel</span>
                    <span className="font-mono font-bold text-accent-green">{fmtAmount(potentialWin, currency)}</span>
                  </div>
                  {stake > balance && (
                    <p className="text-xs text-accent-red text-center">Solde insuffisant — max {fmtAmount(balance, currency)}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
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
                      {placing && <Loader2 className="w-4 h-4 animate-spin" />}
                      Valider le coupon
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EN COURS TAB ── */}
        {tab === "encours" && (
          <div className="p-4 space-y-3">
            {betsFetch.loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl h-28 animate-pulse" />
                ))}
              </div>
            )}
            {!betsFetch.loading && pendingBets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Clock className="w-10 h-10 text-text-tertiary" />
                <p className="font-semibold text-text-primary">Aucun pari en cours</p>
                <p className="text-sm text-text-tertiary">Tes paris actifs apparaîtront ici</p>
              </div>
            )}
            {pendingBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} currency={currency} />
            ))}
          </div>
        )}

        {/* ── HISTORIQUE TAB ── */}
        {tab === "historique" && (
          <div className="p-4 space-y-3">
            {betsFetch.loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-bg-secondary rounded-xl h-28 animate-pulse" />
                ))}
              </div>
            )}
            {!betsFetch.loading && historyBets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <History className="w-10 h-10 text-text-tertiary" />
                <p className="font-semibold text-text-primary">Aucun historique</p>
                <p className="text-sm text-text-tertiary">Tes paris terminés apparaîtront ici</p>
              </div>
            )}
            {historyBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} currency={currency} />
            ))}
          </div>
        )}

      </main>

      <DashboardNav />
    </div>
  )
}
