"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { cn } from "~/lib/utils"
import { Zap, TrendingUp, X, Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "~/trpc/react"
import { type Balance, readBalance } from "~/lib/balance"
import { predictionLabel, SIGNAL_TYPE_LABELS } from "~/lib/labels"
import { CouponPanel } from "~/components/features/betting/CouponPanel"
import { useLang } from "~/lib/lang"

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0]!
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

function signalLevel(confidence: number, t: { signalStrong: string; signalMedium: string; signalWeak: string }) {
  return confidence >= 0.75
    ? { label: t.signalStrong, color: "text-red-400",      border: "border-accent-cyan/60", dot: "bg-red-400" }
    : confidence >= 0.60
    ? { label: t.signalMedium, color: "text-amber-400",    border: "border-amber-400/40",   dot: "bg-amber-400" }
    : { label: t.signalWeak,   color: "text-text-tertiary", border: "border-bg-tertiary",   dot: "bg-text-tertiary" }
}

// ─── Signal Card ──────────────────────────────────────────────────────────────

interface AIPick {
  id: string
  matchId: string
  prediction: string
  odds: number
  confidence: number
  signalType: string
  reasoning: string
  expiresAt: Date
  agentReports: { supports: boolean }[]
  match: { homeTeam: { name: string }; awayTeam: { name: string }; competition: { name: string } }
}

const SignalCard = React.memo(function SignalCard({
  pick,
  isSelected,
  onToggle,
  onRapport,
}: {
  pick: AIPick
  isSelected: boolean
  onToggle: (id: string) => void
  onRapport: (matchId: string) => void
}) {
  const { t, lang } = useLang()
  const locale = lang === "FR" ? "fr-FR" : "en-US"
  const level = signalLevel(pick.confidence, t.analysis)
  const pct = Math.round(pick.confidence * 100)
  const kickoff = pick.expiresAt
    ? new Date(pick.expiresAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    : "—"
  const signalTypeLabel = SIGNAL_TYPE_LABELS[pick.signalType as keyof typeof SIGNAL_TYPE_LABELS] ?? pick.signalType
  const ev = pick.confidence * pick.odds - 1
  const supportingAgents = pick.agentReports.filter((r) => r.supports).length

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-xl p-4 border-2 transition-all",
        isSelected ? "border-accent-cyan" : level.border,
        "hover:border-accent-cyan/40"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", level.dot)} />
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", level.color)}>{level.label}</span>
          <span className="text-[10px] text-text-tertiary bg-bg-tertiary px-1.5 py-0.5 rounded font-medium">{signalTypeLabel}</span>
        </div>
        <span className="text-xs text-text-tertiary">{kickoff}</span>
      </div>
      <div className="mb-2">
        <p className="font-display font-semibold text-text-primary text-sm leading-tight">
          {pick.match.homeTeam.name} vs {pick.match.awayTeam.name}
        </p>
        <p className="text-xs text-text-tertiary">{pick.match.competition.name}</p>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-bold text-accent-cyan font-mono">{pct}%</span>
        <span className="text-xs font-bold text-text-primary bg-bg-tertiary px-1.5 py-0.5 rounded">
          {predictionLabel(pick.prediction)} · ×{pick.odds.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {pick.agentReports.length > 0 && (
          <span className="text-[10px] text-text-tertiary">
            {supportingAgents}/{pick.agentReports.length} {t.signaux.agentsAgree}
          </span>
        )}
        {ev > 0.05 && (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30">
            💰 Value +{Math.round(ev * 100)}%
          </span>
        )}
      </div>
      <p className="text-[11px] text-text-tertiary italic leading-relaxed mb-3 line-clamp-2">
        &ldquo;{pick.reasoning}&rdquo;
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onRapport(pick.matchId)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-bg-tertiary text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors flex items-center justify-center gap-1"
        >
          <FileText className="h-3 w-3" />
          {t.signaux.report}
        </button>
        <button
          onClick={() => onToggle(pick.id)}
          className={cn(
            "flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1",
            isSelected
              ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/60"
              : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan/10 hover:text-accent-cyan"
          )}
        >
          {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {isSelected ? t.analysis.removeCoupon : t.analysis.addCoupon}
        </button>
      </div>
    </div>
  )
})

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignauxPage() {
  const router = useRouter()
  const { t, lang } = useLang()
  const locale = lang === "FR" ? "fr-FR" : "en-US"

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

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString(locale, {
    weekday: "short", day: "numeric", month: "short",
  })

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: aiPicks = [], isLoading: picksLoading } = api.match.getAIPicks.useQuery({ date: selectedDate })
  const { data: picksStats } = api.match.getAIPicksStats.useQuery()

  // ── Coupon ────────────────────────────────────────────────────────────────
  const [selectedSignals, setSelectedSignals] = React.useState<string[]>([])
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

  const toggleSignal = (pickId: string) => {
    setSelectedSignals((prev) =>
      prev.includes(pickId) ? prev.filter((id) => id !== pickId) : [...prev, pickId]
    )
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-bg-primary flex flex-col">
      <Header />

      {/* Sub-header — sits at top of flex column, never scrolls */}
      <div className="shrink-0 z-10 bg-bg-primary border-b border-bg-tertiary px-4 pt-4 pb-3 space-y-3">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent-cyan" />
            {t.signaux.title}
          </h1>
          {isToday ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 px-2 py-0.5 rounded-full">
              {t.signaux.todayBadge}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary bg-bg-tertiary border border-bg-tertiary/60 px-2 py-0.5 rounded-full">
              {t.signaux.historyBadge}
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
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-4">

          {/* AI Performance card */}
          {picksStats && (picksStats.yesterday.total > 0 || picksStats.last30Days.total > 0) && (
            <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-cyan shrink-0" />
              <div>
                {picksStats.yesterday.total > 0 && (
                  <p className="text-xs text-text-primary font-medium">
                    {t.analysis.aiYesterday} : ✅ {picksStats.yesterday.correct}/{picksStats.yesterday.total} {t.analysis.correct}
                  </p>
                )}
                {picksStats.last30Days.accuracy !== null && (
                  <p className="text-xs text-text-tertiary">
                    {t.analysis.accuracy30} : {picksStats.last30Days.accuracy}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Signals count */}
          {aiPicks.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {t.signaux.signals}
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
                  <p className="text-sm text-text-secondary font-medium">{t.analysis.noSignals}</p>
                  <p className="text-xs text-text-tertiary mt-1">{t.analysis.noSignalsHint}</p>
                </>
              ) : (
                <p className="text-sm text-text-secondary font-medium">
                  {t.signaux.noSignalForDate} {displayDate}
                </p>
              )}
            </div>
          )}

          {/* Signal cards */}
          {aiPicks.map((pick) => (
            <SignalCard
              key={pick.id}
              pick={pick}
              isSelected={selectedSignals.includes(pick.id)}
              onToggle={toggleSignal}
              onRapport={(matchId) => router.push(`/signaux/rapport/${matchId}`)}
            />
          ))}
        </div>
      </div>

      <CouponPanel
        selectedPicksData={selectedPicksData}
        totalOdds={totalOdds}
        balance={balance}
        onBalanceChange={setBalance}
        onClear={() => setSelectedSignals([])}
      />

      <DashboardNav />
    </div>
  )
}
