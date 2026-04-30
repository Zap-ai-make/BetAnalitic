"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { cn } from "~/lib/utils"
import { Zap, TrendingUp, X, Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "~/trpc/react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Balance {
  amount: number
  currency: "FCFA" | "USD" | "EUR"
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BALANCE_KEY = "betanalytic-virtual-balance"
const COUPONS_KEY = "betanalytic-local-coupons"

function readBalance(): Balance {
  if (typeof window === "undefined") return { amount: 50000, currency: "FCFA" }
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    return raw ? (JSON.parse(raw) as Balance) : { amount: 50000, currency: "FCFA" }
  } catch {
    return { amount: 50000, currency: "FCFA" }
  }
}

function writeBalance(b: Balance) {
  localStorage.setItem(BALANCE_KEY, JSON.stringify(b))
}

function fmtAmount(n: number, currency: string) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} ${currency}`
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0]!
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignauxPage() {
  const router = useRouter()
  useSession()

  // ── Date picker ───────────────────────────────────────────────────────────
  const todayStr = React.useMemo(() => toDateStr(new Date()), [])
  const minDateStr = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return toDateStr(d)
  }, [])
  const [selectedDate, setSelectedDate] = React.useState(todayStr)
  const isToday = selectedDate === todayStr
  const isMinDate = selectedDate === minDateStr

  const prevDay = () => { if (!isMinDate) setSelectedDate(addDays(selectedDate, -1)) }
  const nextDay = () => { if (!isToday) setSelectedDate(addDays(selectedDate, 1)) }

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
  })

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: aiPicks = [], isLoading: picksLoading } = api.match.getAIPicks.useQuery({ date: selectedDate })
  const { data: picksStats } = api.match.getAIPicksStats.useQuery()

  // ── Coupon ────────────────────────────────────────────────────────────────
  const [selectedSignals, setSelectedSignals] = React.useState<string[]>([])
  const [stake, setStake] = React.useState("")
  const [balance, setBalance] = React.useState<Balance>(() => readBalance())

  React.useEffect(() => { setBalance(readBalance()) }, [])

  const selectedPicksData = React.useMemo(
    () => aiPicks.filter((p) => selectedSignals.includes(p.id)),
    [aiPicks, selectedSignals]
  )
  const totalOdds = React.useMemo(
    () => selectedPicksData.reduce((acc, p) => acc * p.odds, 1),
    [selectedPicksData]
  )
  const stakeNum = parseFloat(stake) || 0
  const potentialWin = stakeNum * totalOdds

  const toggleSignal = (pickId: string) => {
    setSelectedSignals((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    )
  }

  const handlePlaceBet = () => {
    if (selectedPicksData.length === 0 || stakeNum <= 0 || stakeNum > balance.amount) return
    const legs = selectedPicksData.map((pick) => {
      const outcomeMap: Record<string, string> = {
        home: "V1", draw: "X", away: "V2",
        yes: "Oui", no: "Non", over: "Over", under: "Under",
      }
      return {
        matchId: pick.matchId,
        homeTeam: pick.match.homeTeam.name,
        awayTeam: pick.match.awayTeam.name,
        predictionLabel: `${outcomeMap[pick.prediction] ?? pick.prediction} — ${pick.signalType}`,
        outcomeCode: outcomeMap[pick.prediction] ?? pick.prediction,
        apiPrediction: pick.prediction,
        odds: pick.odds,
      }
    })
    const coupon = {
      id: `coupon-${Date.now()}`,
      legs, totalOdds, stake: stakeNum, potentialWin,
      status: "pending" as const, createdAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem(COUPONS_KEY) ?? "[]") as unknown[]
      localStorage.setItem(COUPONS_KEY, JSON.stringify([coupon, ...existing]))
    } catch { /* noop */ }
    const newBalance = { ...balance, amount: balance.amount - stakeNum }
    setBalance(newBalance)
    writeBalance(newBalance)
    void Promise.allSettled(
      legs.map((leg) =>
        fetch("/api/beta/betting/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match_id: leg.matchId, prediction: leg.apiPrediction,
            stake: stakeNum / legs.length, odds: leg.odds,
          }),
        })
      )
    )
    setSelectedSignals([])
    setStake("")
    router.push("/paris")
  }

  // ── Signal helpers ────────────────────────────────────────────────────────

  const signalLevel = (confidence: number) =>
    confidence >= 0.75
      ? { label: "SIGNAL FORT",  color: "text-red-400",        border: "border-accent-cyan/60", dot: "bg-red-400" }
      : confidence >= 0.60
      ? { label: "SIGNAL MOYEN", color: "text-amber-400",       border: "border-amber-400/40",   dot: "bg-amber-400" }
      : { label: "SIGNAL FAIBLE",color: "text-text-tertiary",   border: "border-bg-tertiary",    dot: "bg-text-tertiary" }

  const predictionLabel = (p: string) =>
    ({ home: "V1", draw: "X", away: "V2", yes: "Oui", no: "Non", over: "Over", under: "Under" }[p] ?? p)

  const SIGNAL_TYPE_LABELS: Record<string, string> = {
    RESULT: "Résultat", BTTS: "BTTS", CORNERS: "Corners", CARDS: "Cartons",
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* ── Sticky sub-header — OUTSIDE main, direct child of flex ────────── */}
      <div className="sticky top-14 z-10 bg-bg-primary border-b border-bg-tertiary px-4 pt-4 pb-3 space-y-3">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent-cyan" />
            Intelligence Briefing
          </h1>
          {isToday ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 px-2 py-0.5 rounded-full">
              Aujourd&apos;hui
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary bg-bg-tertiary border border-bg-tertiary/60 px-2 py-0.5 rounded-full">
              Historique
            </span>
          )}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevDay}
            disabled={isMinDate}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg border transition-colors",
              isMinDate
                ? "border-bg-tertiary text-text-tertiary opacity-30 cursor-not-allowed"
                : "border-bg-tertiary text-text-secondary hover:text-text-primary hover:border-accent-cyan/40"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm font-semibold text-text-primary capitalize">{displayDate}</span>
          </div>

          <button
            onClick={nextDay}
            disabled={isToday}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg border transition-colors",
              isToday
                ? "border-bg-tertiary text-text-tertiary opacity-30 cursor-not-allowed"
                : "border-bg-tertiary text-text-secondary hover:text-text-primary hover:border-accent-cyan/40"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <div className="flex-1 pb-28">
        <div className="p-4 space-y-4">

          {/* AI Performance card */}
          {picksStats && (picksStats.yesterday.total > 0 || picksStats.last30Days.total > 0) && (
            <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-cyan shrink-0" />
              <div>
                {picksStats.yesterday.total > 0 && (
                  <p className="text-xs text-text-primary font-medium">
                    IA hier : ✅ {picksStats.yesterday.correct}/{picksStats.yesterday.total} corrects
                  </p>
                )}
                {picksStats.last30Days.accuracy !== null && (
                  <p className="text-xs text-text-tertiary">
                    Précision 30j : {picksStats.last30Days.accuracy}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Signals count */}
          {aiPicks.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Signaux
              </h2>
              <span className="text-xs text-text-tertiary">
                {aiPicks.length} signal{aiPicks.length > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Loading skeletons */}
          {picksLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-secondary rounded-xl h-36 animate-pulse border border-bg-tertiary" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!picksLoading && aiPicks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🤖</div>
              {isToday ? (
                <>
                  <p className="text-sm text-text-secondary font-medium">Aucun signal pour aujourd&apos;hui</p>
                  <p className="text-xs text-text-tertiary mt-1">Les agents analysent les matchs à 08:00</p>
                </>
              ) : (
                <p className="text-sm text-text-secondary font-medium">
                  Aucun signal pour le {displayDate}
                </p>
              )}
            </div>
          )}

          {/* Signal cards */}
          {aiPicks.map((pick) => {
            const level = signalLevel(pick.confidence)
            const isSelected = selectedSignals.includes(pick.id)
            const pct = Math.round(pick.confidence * 100)
            const kickoff = new Date(pick.expiresAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            const signalTypeLabel = SIGNAL_TYPE_LABELS[pick.signalType] ?? pick.signalType
            const ev = pick.confidence * pick.odds - 1
            const supportingAgents = pick.agentReports.filter((r) => r.supports).length

            return (
              <div
                key={pick.id}
                className={cn(
                  "bg-bg-secondary rounded-xl p-4 border-2 transition-all",
                  isSelected ? "border-accent-cyan" : level.border,
                  "hover:border-accent-cyan/40"
                )}
              >
                {/* Signal badge + type + kickoff */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full animate-pulse", level.dot)} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", level.color)}>
                      {level.label}
                    </span>
                    <span className="text-[10px] text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded font-medium">
                      {signalTypeLabel}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">{kickoff}</span>
                </div>

                {/* Teams */}
                <div className="mb-2">
                  <p className="font-display font-semibold text-text-primary text-sm leading-tight">
                    {pick.match.homeTeam.name} vs {pick.match.awayTeam.name}
                  </p>
                  <p className="text-xs text-text-tertiary">{pick.match.competition.name}</p>
                </div>

                {/* Confidence bar + pick */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-accent-cyan font-mono">{pct}%</span>
                  <span className="text-xs font-bold text-text-primary bg-bg-tertiary px-1.5 py-0.5 rounded">
                    {predictionLabel(pick.prediction)} · ×{pick.odds.toFixed(2)}
                  </span>
                </div>

                {/* Consensus + Value bet */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {pick.agentReports.length > 0 && (
                    <span className="text-[10px] text-text-tertiary">
                      {supportingAgents}/{pick.agentReports.length} agents en accord
                    </span>
                  )}
                  {ev > 0.05 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                      💰 Value +{Math.round(ev * 100)}%
                    </span>
                  )}
                </div>

                {/* Reasoning */}
                <p className="text-[11px] text-text-tertiary italic leading-relaxed mb-3 line-clamp-2">
                  &ldquo;{pick.reasoning}&rdquo;
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/signaux/rapport/${pick.matchId}`)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-bg-tertiary text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    Rapport
                  </button>
                  <button
                    onClick={() => toggleSignal(pick.id)}
                    className={cn(
                      "flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1",
                      isSelected
                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/60"
                        : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan/10 hover:text-accent-cyan"
                    )}
                  >
                    {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {isSelected ? "Retirer" : "Coupon"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Coupon panel (fixed, au-dessus du bottom nav) ────────────────────── */}
      {selectedPicksData.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t-2 border-accent-cyan/30 bg-bg-secondary px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary">
              Mon Coupon ({selectedPicksData.length})
            </span>
            <span className="text-sm font-mono text-accent-cyan font-bold">×{totalOdds.toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            {selectedPicksData.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary truncate max-w-[60%]">
                  {p.match.homeTeam.name} vs {p.match.awayTeam.name} · {SIGNAL_TYPE_LABELS[p.signalType] ?? p.signalType}
                </span>
                <span className="text-accent-cyan font-bold font-mono">
                  {predictionLabel(p.prediction)} ×{p.odds.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder={`Mise en ${balance.currency}`}
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-bg-primary border border-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan"
            />
            <span className="text-xs text-text-tertiary">{balance.currency}</span>
          </div>
          {stakeNum > 0 && (
            <p className="text-xs text-text-tertiary">
              Gain potentiel : <span className="text-green-400 font-bold">{fmtAmount(potentialWin, balance.currency)}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSignals([])}
              className="px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-red-400 border border-bg-tertiary transition-colors"
            >
              Vider
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={stakeNum <= 0 || stakeNum > balance.amount}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                stakeNum > 0 && stakeNum <= balance.amount
                  ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
                  : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
              )}
            >
              Valider le coupon →
            </button>
          </div>
        </div>
      )}

      <DashboardNav />
    </div>
  )
}
