"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"
import { ChevronLeft, Plus, X } from "lucide-react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"

// ─── Agent metadata ───────────────────────────────────────────────────────────

const AGENT_META: Record<string, { label: string; emoji: string; dashboardId: string; color: string }> = {
  SCOUT:    { label: "Scout",         emoji: "🔍", dashboardId: "Scout",          color: "text-emerald-400" },
  FORM:     { label: "FormAnalyzer",  emoji: "📊", dashboardId: "MomentumX",      color: "text-blue-400" },
  H2H:      { label: "HeadToHead",    emoji: "⚔️", dashboardId: "Scout",          color: "text-purple-400" },
  MOMENTUM: { label: "MomentumX",     emoji: "🌊", dashboardId: "MomentumX",      color: "text-pink-400" },
  REFEREE:  { label: "RefereeWatch",  emoji: "🟨", dashboardId: "RefereeAnalyst", color: "text-yellow-400" },
  GOALS:    { label: "GoalMaster",    emoji: "⚽", dashboardId: "GoalMaster",     color: "text-green-400" },
  CORNERS:  { label: "CornerKing",    emoji: "🏳️", dashboardId: "CornerKing",     color: "text-orange-400" },
  ODDS:     { label: "OddsWhisperer", emoji: "💰", dashboardId: "Scout",          color: "text-amber-400" },
  VALUE:    { label: "ValueHunter",   emoji: "💎", dashboardId: "Scout",          color: "text-cyan-400" },
  RISK:     { label: "RiskGuardian",  emoji: "⚠️", dashboardId: "WallMaster",     color: "text-red-400" },
}

const SIGNAL_LABELS: Record<string, { label: string; short: string; emoji: string }> = {
  RESULT:  { label: "Résultat", short: "RÉSULTAT", emoji: "🏆" },
  BTTS:    { label: "Les deux équipes marquent", short: "BTTS", emoji: "⚽" },
  CORNERS: { label: "Corners", short: "CORNERS", emoji: "🏳️" },
  CARDS:   { label: "Cartons", short: "CARTONS", emoji: "🟨" },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConsensusBar({ reports }: { reports: { supports: boolean }[] }) {
  const total = reports.length
  if (total === 0) return null
  const supporting = reports.filter((r) => r.supports).length
  const pct = Math.round((supporting / total) * 100)
  const isStrong = supporting >= Math.ceil(total * 0.7)
  const isMixed = supporting >= Math.ceil(total * 0.4)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary font-medium">Consensus des agents</span>
        <span className={cn(
          "font-bold",
          isStrong ? "text-green-400" : isMixed ? "text-amber-400" : "text-red-400"
        )}>
          {supporting}/{total} agents en accord
        </span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden flex">
        <div
          className={cn("h-full rounded-full transition-all", isStrong ? "bg-green-400" : isMixed ? "bg-amber-400" : "bg-red-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-text-tertiary">
        {isStrong ? "✅ Fort consensus" : isMixed ? "⚖️ Consensus modéré" : "⚠️ Opinions divergentes"}
      </p>
    </div>
  )
}

function ValueBadge({ confidence, odds }: { confidence: number; odds: number }) {
  const ev = confidence * odds - 1
  if (ev <= 0.05) return null
  return (
    <div className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 rounded-full">
      <span className="text-sm">💰</span>
      <span className="text-xs font-bold text-amber-400">Value Bet +{Math.round(ev * 100)}%</span>
    </div>
  )
}

function AgentCard({
  report,
  onAskQuestion,
}: {
  report: { agentType: string; analysis: string; confidence: number; supports: boolean }
  onAskQuestion: (agentType: string) => void
}) {
  const meta = AGENT_META[report.agentType] ?? { label: report.agentType, emoji: "🤖", dashboardId: "Scout", color: "text-text-secondary" }
  const pct = Math.round(report.confidence * 100)
  const badge = report.supports
    ? { label: "Appui", bg: "bg-accent-cyan/15", text: "text-accent-cyan", border: "border-accent-cyan/40" }
    : { label: "Contre", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40" }

  return (
    <div className={cn(
      "bg-bg-secondary rounded-xl p-4 border transition-all",
      report.supports ? "border-bg-tertiary hover:border-accent-cyan/30" : "border-bg-tertiary hover:border-red-500/20"
    )}>
      {/* Agent header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={cn("font-display font-semibold text-sm", meta.color)}>{meta.label}</div>
        </div>
        <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", badge.bg, badge.text, badge.border)}>
          {badge.label}
        </div>
      </div>

      {/* Confidence bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full", report.supports ? "bg-accent-cyan" : "bg-red-400")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] font-mono font-bold text-text-tertiary">{pct}%</span>
      </div>

      {/* Analysis */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">{report.analysis}</p>

      {/* CTA */}
      <button
        onClick={() => onAskQuestion(report.agentType)}
        className="w-full py-1.5 rounded-lg border border-bg-tertiary text-xs text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
      >
        Poser une question →
      </button>
    </div>
  )
}

// ─── Coupon helpers (same as signaux page) ────────────────────────────────────

interface Balance { amount: number; currency: "FCFA" | "USD" | "EUR" }
const BALANCE_KEY = "betanalytic-virtual-balance"
const COUPONS_KEY = "betanalytic-local-coupons"

function readBalance(): Balance {
  if (typeof window === "undefined") return { amount: 50000, currency: "FCFA" }
  try {
    const raw = localStorage.getItem(BALANCE_KEY)
    return raw ? (JSON.parse(raw) as Balance) : { amount: 50000, currency: "FCFA" }
  } catch { return { amount: 50000, currency: "FCFA" } }
}

function writeBalance(b: Balance) { localStorage.setItem(BALANCE_KEY, JSON.stringify(b)) }
function fmtAmount(n: number, currency: string) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} ${currency}`
}

const predictionLabel = (p: string) =>
  p === "home" ? "V1" : p === "draw" ? "X" : p === "away" ? "V2"
    : p === "yes" ? "Oui" : p === "no" ? "Non"
    : p === "over" ? "Over" : p === "under" ? "Under" : p

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RapportPage() {
  const router = useRouter()
  const params = useParams<{ matchId: string }>()
  const matchId = params.matchId

  const { data: signals = [], isLoading } = api.match.getMatchSignals.useQuery({ matchId })

  const [activeTab, setActiveTab] = React.useState<string | null>(null)

  // Set first tab once signals load
  React.useEffect(() => {
    if (signals.length > 0 && !activeTab) {
      setActiveTab(signals[0]!.signalType)
    }
  }, [signals, activeTab])

  // Coupon state (shared with signaux page via localStorage)
  const [balance, setBalance] = React.useState<Balance>(() => readBalance())
  const [selectedSignals, setSelectedSignals] = React.useState<string[]>([])
  const [stake, setStake] = React.useState("")

  const match = signals[0]?.match
  const activePick = signals.find((s) => s.signalType === activeTab)

  const selectedPicksData = React.useMemo(
    () => signals.filter((s) => selectedSignals.includes(s.id)),
    [signals, selectedSignals]
  )
  const totalOdds = selectedPicksData.reduce((acc, p) => acc * p.odds, 1)
  const stakeNum = parseFloat(stake) || 0
  const potentialWin = stakeNum * totalOdds

  const toggleSignal = (pickId: string) => {
    setSelectedSignals((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    )
  }

  const handlePlaceBet = () => {
    if (selectedPicksData.length === 0 || stakeNum <= 0 || stakeNum > balance.amount) return
    const legs = selectedPicksData.map((pick) => ({
      matchId: pick.matchId,
      homeTeam: pick.match.homeTeam.name,
      awayTeam: pick.match.awayTeam.name,
      predictionLabel: `${predictionLabel(pick.prediction)} — ${pick.signalType}`,
      outcomeCode: predictionLabel(pick.prediction),
      apiPrediction: pick.prediction,
      odds: pick.odds,
    }))
    const coupon = {
      id: `coupon-${Date.now()}`,
      legs,
      totalOdds,
      stake: stakeNum,
      potentialWin,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
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
          body: JSON.stringify({ match_id: leg.matchId, prediction: leg.apiPrediction, stake: stakeNum / legs.length, odds: leg.odds }),
        })
      )
    )
    setSelectedSignals([])
    setStake("")
    router.push("/paris")
  }

  const handleAskQuestion = (agentType: string) => {
    if (!match) return
    const meta = AGENT_META[agentType]
    sessionStorage.setItem("pending_match", JSON.stringify({
      id: matchId,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      competition: match.competition.name,
      time: new Date(activePick?.expiresAt ?? "").toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }))
    sessionStorage.setItem("pending_agent", meta?.dashboardId ?? "Scout")
    router.push("/dashboard")
  }

  // ── UI ───────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Header />
        <main className="flex-1 p-4 pb-20">
          <div className="h-8 bg-bg-secondary rounded-lg animate-pulse mb-4 w-32" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
        <DashboardNav />
      </div>
    )
  }

  if (signals.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-sm text-text-secondary">Aucun signal disponible pour ce match.</p>
            <button onClick={() => router.back()} className="mt-4 text-xs text-accent-cyan underline">
              Retour
            </button>
          </div>
        </main>
        <DashboardNav />
      </div>
    )
  }

  const kickoff = match ? new Date(activePick?.expiresAt ?? "").toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto pb-32">
        {/* ── Back header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux signaux
          </button>
          {match && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-bold text-text-primary text-base">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </h1>
                <p className="text-xs text-text-tertiary">{match.competition.name} · {kickoff}</p>
              </div>
              <div className="text-right text-xs text-text-tertiary">
                <div className="font-mono font-bold text-accent-cyan">{fmtAmount(balance.amount, balance.currency)}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Signal tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto">
          {signals.map((sig) => {
            const meta = SIGNAL_LABELS[sig.signalType]
            const isActive = activeTab === sig.signalType
            return (
              <button
                key={sig.id}
                onClick={() => setActiveTab(sig.signalType)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  isActive
                    ? "bg-accent-cyan text-bg-primary"
                    : "bg-bg-secondary border border-bg-tertiary text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary"
                )}
              >
                <span>{meta?.emoji ?? "📊"}</span>
                <span>{meta?.short ?? sig.signalType}</span>
                <span className={cn("font-mono text-[10px]", isActive ? "text-bg-primary/70" : "text-text-tertiary")}>
                  {Math.round(sig.confidence * 100)}%
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Active signal content ────────────────────────────────────────── */}
        {activePick && (
          <div className="px-4 space-y-4 pb-4">

            {/* Signal summary card */}
            <div className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
                    {SIGNAL_LABELS[activePick.signalType]?.label ?? activePick.signalType}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-accent-cyan text-lg">
                      {predictionLabel(activePick.prediction)}
                    </span>
                    <span className="font-mono font-bold text-text-primary">×{activePick.odds.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <ValueBadge confidence={activePick.confidence} odds={activePick.odds} />
                  <button
                    onClick={() => toggleSignal(activePick.id)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      selectedSignals.includes(activePick.id)
                        ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/60"
                        : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan/10 hover:text-accent-cyan"
                    )}
                  >
                    {selectedSignals.includes(activePick.id) ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {selectedSignals.includes(activePick.id) ? "Retirer" : "Coupon"}
                  </button>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary">Confiance globale</span>
                  <span className="font-bold text-accent-cyan font-mono">{Math.round(activePick.confidence * 100)}%</span>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${Math.round(activePick.confidence * 100)}%` }} />
                </div>
              </div>

              {/* Reasoning */}
              <p className="text-xs text-text-tertiary italic">&ldquo;{activePick.reasoning}&rdquo;</p>

              {/* Consensus */}
              <ConsensusBar reports={activePick.agentReports} />
            </div>

            {/* Agent cards */}
            <div>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Rapports des agents ({activePick.agentReports.length})
              </h2>
              <div className="space-y-3">
                {activePick.agentReports.map((r) => (
                  <AgentCard key={r.id} report={r} onAskQuestion={handleAskQuestion} />
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ── Coupon sticky panel ──────────────────────────────────────────────── */}
      {selectedPicksData.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t-2 border-accent-cyan/30 bg-bg-secondary px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-primary">Mon Coupon ({selectedPicksData.length})</span>
            <span className="text-sm font-mono text-accent-cyan font-bold">×{totalOdds.toFixed(2)}</span>
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
