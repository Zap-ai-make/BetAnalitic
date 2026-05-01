"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { cn } from "~/lib/utils"
import { Trash2, Send, Mic, Volume2, Pause, Zap, TrendingUp, MessageSquare, X, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { AGENTS } from "~/lib/agents/config"
import { api } from "~/trpc/react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConversationMessage {
  id: string
  type: "user" | "agent"
  agentId?: string
  agentName?: string
  content: string
  timestamp: Date
  confidence?: number
}

interface Balance {
  amount: number
  currency: "FCFA" | "USD" | "EUR"
}

type OddKey = "1" | "X" | "2"

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

function readStreak(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem("betanalytic-briefing-streak")
    if (!raw) return 0
    const data = JSON.parse(raw) as { count: number; lastDate: string }
    const today = new Date().toDateString()
    return data.lastDate === today || data.lastDate === new Date(Date.now() - 86400000).toDateString()
      ? data.count
      : 0
  } catch {
    return 0
  }
}

function touchStreak() {
  if (typeof window === "undefined") return
  const today = new Date().toDateString()
  try {
    const raw = localStorage.getItem("betanalytic-briefing-streak")
    const data = raw ? (JSON.parse(raw) as { count: number; lastDate: string }) : null
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newCount = data?.lastDate === yesterday ? (data.count + 1) : data?.lastDate === today ? (data?.count ?? 1) : 1
    localStorage.setItem("betanalytic-briefing-streak", JSON.stringify({ count: newCount, lastDate: today }))
  } catch { /* noop */ }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // ── AI Picks ──────────────────────────────────────────────────────────────
  const { data: aiPicks = [], isLoading: picksLoading } = api.match.getAIPicks.useQuery({})
  const { data: picksStats } = api.match.getAIPicksStats.useQuery()

  // ── Selected signals → coupon ─────────────────────────────────────────────
  const [selectedSignals, setSelectedSignals] = React.useState<string[]>([])
  const [stake, setStake] = React.useState("")
  const [showChatMobile, setShowChatMobile] = React.useState(false)

  // ── Balance ───────────────────────────────────────────────────────────────
  const [balance, setBalance] = React.useState<Balance>(() => readBalance())
  const [streak, setStreak] = React.useState(0)

  // ── Chat state (unchanged) ─────────────────────────────────────────────────
  const [agentInput, setAgentInput] = React.useState("")
  const [showAgentSuggestions, setShowAgentSuggestions] = React.useState(false)
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ConversationMessage[]>([])
  const [isInvoking, setIsInvoking] = React.useState(false)
  const [isFullAnalysis, setIsFullAnalysis] = React.useState(false)
  const [fullAnalysisProgress, setFullAnalysisProgress] = React.useState(0)
  const [showFullAnalysisConfirm, setShowFullAnalysisConfirm] = React.useState(false)
  const [showComparison, setShowComparison] = React.useState(false)
  const [accuracyModalAgent, setAccuracyModalAgent] = React.useState<string | null>(null)
  const [pendingMatchForChat, setPendingMatchForChat] = React.useState<{ id: string; homeTeam: string; awayTeam: string; league: string } | null>(null)

  // Preferences (unchanged)
  const [expertiseLevel, setExpertiseLevel] = React.useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">("INTERMEDIATE")
  const [analysisDepth, setAnalysisDepth] = React.useState<"QUICK" | "STANDARD" | "DETAILED">("STANDARD")
  const [learnMode, setLearnMode] = React.useState(false)

  // Burst mode (unchanged)
  const userTier = session?.user?.subscriptionTier ?? "FREE"
  const [burstModeActive, setBurstModeActive] = React.useState(false)
  const [showBurstUpsell, setShowBurstUpsell] = React.useState(false)

  // Voice
  const [isRecording, setIsRecording] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null)

  // TTS
  const [playingMessageId, setPlayingMessageId] = React.useState<string | null>(null)
  const [speechRate, setSpeechRate] = React.useState(1)
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)

  // ── Effects ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const savedExpertise = localStorage.getItem("expertiseLevel") as typeof expertiseLevel | null
    const savedDepth = localStorage.getItem("analysisDepth") as typeof analysisDepth | null
    if (savedExpertise) setExpertiseLevel(savedExpertise)
    if (savedDepth) setAnalysisDepth(savedDepth)
    setLearnMode(localStorage.getItem("learnMode") === "true")
    setBalance(readBalance())
    touchStreak()
    setStreak(readStreak())
  }, [])

  React.useEffect(() => {
    const hasLive = pendingMatchForChat !== null
    const isPremium = userTier === "PREMIUM" || userTier === "EXPERT"
    setBurstModeActive(hasLive && isPremium)
    if (hasLive && userTier === "FREE" && !burstModeActive) setShowBurstUpsell(true)
  }, [pendingMatchForChat, userTier, burstModeActive])

  React.useEffect(() => {
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel() }
  }, [])

  // ── Agent autocomplete ────────────────────────────────────────────────────
  const filteredAgents = React.useMemo(() => {
    if (!agentInput.startsWith("@")) return []
    const q = agentInput.slice(1).toLowerCase()
    return AGENTS.filter((a) => a.name.toLowerCase().includes(q))
  }, [agentInput])

  const agentMessages = React.useMemo(() => messages.filter((m) => m.type === "agent" && m.agentId), [messages])
  const uniqueAgentCount = React.useMemo(() => new Set(agentMessages.map((m) => m.agentId)).size, [agentMessages])

  React.useEffect(() => {
    setShowAgentSuggestions(agentInput.startsWith("@") && filteredAgents.length > 0)
  }, [agentInput, filteredAgents])

  // ── Coupon from signals ───────────────────────────────────────────────────
  const selectedPicksData = React.useMemo(
    () => aiPicks.filter((p) => selectedSignals.includes(p.matchId)),
    [aiPicks, selectedSignals]
  )

  const totalOdds = React.useMemo(
    () => selectedPicksData.reduce((acc, p) => acc * p.odds, 1),
    [selectedPicksData]
  )

  const stakeNum = parseFloat(stake) || 0
  const potentialWin = stakeNum * totalOdds

  const toggleSignal = (matchId: string) => {
    setSelectedSignals((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    )
  }

  const handlePlaceBet = () => {
    if (selectedPicksData.length === 0 || stakeNum <= 0 || stakeNum > balance.amount) return

    const legs = selectedPicksData.map((pick) => {
      const outcomeMap: Record<string, string> = { home: "V1", draw: "X", away: "V2" }
      const teamMap: Record<string, string> = {
        home: pick.match.homeTeam.name,
        draw: "Nul",
        away: pick.match.awayTeam.name,
      }
      const apiMap: Record<string, string> = { home: "home", draw: "draw", away: "away" }
      return {
        matchId: pick.matchId,
        homeTeam: pick.match.homeTeam.name,
        awayTeam: pick.match.awayTeam.name,
        predictionLabel: `${outcomeMap[pick.prediction] ?? pick.prediction} — ${teamMap[pick.prediction] ?? pick.prediction}`,
        outcomeCode: outcomeMap[pick.prediction] ?? pick.prediction,
        apiPrediction: apiMap[pick.prediction] ?? pick.prediction,
        odds: pick.odds,
      }
    })

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

    // Deduct balance
    const newBalance = { ...balance, amount: balance.amount - stakeNum }
    setBalance(newBalance)
    writeBalance(newBalance)

    // Silent API calls
    void Promise.allSettled(
      legs.map((leg) =>
        fetch("/api/beta/betting/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match_id: leg.matchId,
            prediction: leg.apiPrediction,
            stake: stakeNum / legs.length,
            odds: leg.odds,
          }),
        })
      )
    )

    setSelectedSignals([])
    setStake("")
    router.push("/paris")
  }

  // ── Agent handlers (unchanged) ────────────────────────────────────────────
  const handleAgentSelect = (agentId: string, agentName: string) => {
    setSelectedAgent(agentId)
    setAgentInput(`@${agentName}`)
    setShowAgentSuggestions(false)
  }

  const handleInvokeAgent = async () => {
    if (!selectedAgent) return
    setIsInvoking(true)
    const agent = AGENTS.find((a) => a.id === selectedAgent)
    const firstMatch = pendingMatchForChat

    const userMsg: ConversationMessage = { id: `msg-${Date.now()}`, type: "user", content: agentInput, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])

    const agentMsgId = `msg-${Date.now() + 1}`
    setMessages((prev) => [...prev, { id: agentMsgId, type: "agent", agentId: selectedAgent, agentName: agent?.name, content: "", timestamp: new Date() }])

    try {
      const res = await fetch("/api/agents/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent,
          query: agentInput || `Analyse ${firstMatch?.homeTeam} vs ${firstMatch?.awayTeam}`,
          matchId: firstMatch?.id,
          homeTeam: firstMatch?.homeTeam,
          awayTeam: firstMatch?.awayTeam,
          competition: firstMatch?.league,
        }),
      })

      if (!res.ok || !res.body) throw new Error(`Stream error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const parsed = JSON.parse(line.slice(6)) as { type: string; content?: string; confidence?: number }
            if (parsed.type === "token" && parsed.content) {
              accumulated += parsed.content
              setMessages((prev) => prev.map((m) => m.id === agentMsgId ? { ...m, content: accumulated } : m))
            }
            if (parsed.type === "done") {
              setMessages((prev) => prev.map((m) => m.id === agentMsgId
                ? { ...m, confidence: parsed.confidence ? Math.round(parsed.confidence * 100) : undefined }
                : m
              ))
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Agent error:", err)
      setMessages((prev) => prev.map((m) => m.id === agentMsgId
        ? { ...m, content: "❌ Erreur de connexion au backend." } : m
      ))
    } finally {
      setIsInvoking(false)
      setAgentInput("")
      setSelectedAgent(null)
    }
  }

  const handleFullAnalysis = async () => {
    if (!pendingMatchForChat) return
    setShowFullAnalysisConfirm(false)
    setIsFullAnalysis(true)
    setFullAnalysisProgress(0)
    const startTime = Date.now()
    const m = pendingMatchForChat

    setMessages((prev) => [...prev, {
      id: `msg-${Date.now()}`, type: "user",
      content: `⚡ Analyse Complète — ${m.homeTeam} vs ${m.awayTeam}`, timestamp: new Date(),
    }])

    try {
      const qs = new URLSearchParams({ home_team: m.homeTeam, away_team: m.awayTeam, ...(m.league ? { competition: m.league } : {}) })
      const res = await fetch(`/api/beta/matches/${m.id}/analyze-full?${qs.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Pronostic complet pour ce match" }),
      })
      if (!res.ok) throw new Error(`analyze-full error: ${res.status}`)
      const data = await res.json() as {
        agents_results: Record<string, { agent_type: string; content: string; confidence: number }>
        consensus?: { main_prediction: string; average_confidence: number }
      }
      const entries = Object.entries(data.agents_results)
      for (let i = 0; i < entries.length; i++) {
        const [agentType, result] = entries[i]!
        const ag = AGENTS.find((a) => a.betanalyticType === agentType)
        setMessages((prev) => [...prev, {
          id: `msg-${Date.now()}-${i}`, type: "agent",
          agentId: ag?.id ?? agentType.toLowerCase(), agentName: ag?.name ?? agentType,
          content: result.content, timestamp: new Date(),
          confidence: Math.round(result.confidence * 100),
        }])
        setFullAnalysisProgress(i + 1)
      }
      if (data.consensus) {
        const dur = ((Date.now() - startTime) / 1000).toFixed(1)
        setMessages((prev) => [...prev, {
          id: `msg-summary-${Date.now()}`, type: "agent", agentId: "advisor", agentName: "Synthèse finale",
          content: `🎓 Analyse complète en ${dur}s\n\n${data.consensus!.main_prediction}`,
          timestamp: new Date(), confidence: Math.round(data.consensus!.average_confidence * 100),
        }])
      }
    } catch (err) {
      console.error("Full analysis failed:", err)
      setMessages((prev) => [...prev, {
        id: `msg-err-${Date.now()}`, type: "agent", agentId: "scout", agentName: "Système",
        content: "❌ Analyse complète échouée. Vérifiez que le backend BetAnalytic est accessible.",
        timestamp: new Date(),
      }])
    } finally {
      setIsFullAnalysis(false)
      setFullAnalysisProgress(0)
    }
  }

  // ── Voice ──────────────────────────────────────────────────────────────────
  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const win = window as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const SpeechRecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SpeechRecognitionClass) { alert("Votre navigateur ne supporte pas la reconnaissance vocale."); return }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const rec = new SpeechRecognitionClass()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    rec.lang = "fr-FR"; rec.continuous = true; rec.interimResults = true
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const t = Array.from(event.results).map((r: any) => r[0]?.transcript ?? "").join("")
      if (t.trim()) setAgentInput(t.trim().startsWith("@") ? t.trim() : `@${t.trim()}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      setIsRecording(false)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.error === "not-allowed") alert("Accès micro refusé.")
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    rec.onend = () => setIsRecording(false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    rec.start()
    setIsRecording(true)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    recognitionRef.current = rec
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  // ── TTS ────────────────────────────────────────────────────────────────────
  const startTTS = (msgId: string, content: string) => {
    if (!("speechSynthesis" in window)) { alert("TTS non supporté"); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(content)
    u.lang = "fr-FR"; u.rate = speechRate
    u.onend = () => { setPlayingMessageId(null); utteranceRef.current = null }
    u.onerror = () => { setPlayingMessageId(null); utteranceRef.current = null }
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
    setPlayingMessageId(msgId)
  }

  const stopTTS = () => {
    if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); setPlayingMessageId(null); utteranceRef.current = null }
  }

  // ── Confidence styles ─────────────────────────────────────────────────────
  const getConfidenceStyle = (c: number) =>
    c >= 80 ? { label: "Haute", bgColor: "bg-green-500/20", textColor: "text-green-500", borderColor: "border-green-500/30" }
    : c >= 50 ? { label: "Moyenne", bgColor: "bg-yellow-500/20", textColor: "text-yellow-500", borderColor: "border-yellow-500/30" }
    : { label: "Faible", bgColor: "bg-orange-500/20", textColor: "text-orange-500", borderColor: "border-orange-500/30" }

  const getAccuracyStyle = (a: number) =>
    a >= 70 ? { label: "Excellente", bgColor: "bg-green-500/20", textColor: "text-green-500", borderColor: "border-green-500/30" }
    : a >= 60 ? { label: "Bonne", bgColor: "bg-yellow-500/20", textColor: "text-yellow-500", borderColor: "border-yellow-500/30" }
    : { label: "Moyenne", bgColor: "bg-orange-500/20", textColor: "text-orange-500", borderColor: "border-orange-500/30" }

  // ── Signal level ──────────────────────────────────────────────────────────
  const signalLevel = (confidence: number) =>
    confidence >= 0.75 ? { label: "SIGNAL FORT", color: "text-red-400", border: "border-accent-cyan/60", dot: "bg-red-400" }
    : confidence >= 0.60 ? { label: "SIGNAL MOYEN", color: "text-amber-400", border: "border-amber-400/40", dot: "bg-amber-400" }
    : { label: "SIGNAL FAIBLE", color: "text-text-tertiary", border: "border-bg-tertiary", dot: "bg-text-tertiary" }

  const predictionLabel = (prediction: string) =>
    prediction === "home" ? "V1" : prediction === "draw" ? "X" : "V2"

  // ── Today's date ──────────────────────────────────────────────────────────
  const todayLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-bg-primary flex flex-col" style={{ height: "calc(100dvh - var(--header-h))" }}>
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden pb-16">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-bg-tertiary flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-cyan" />
              Intelligence Briefing
            </h1>
            <p className="text-xs text-text-tertiary capitalize">{todayLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-accent-orange/10 border border-accent-orange/30 px-2 py-1 rounded-full">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-accent-orange">{streak}</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-text-tertiary">Solde</div>
              <div className="text-sm font-bold text-accent-cyan font-mono">{fmtAmount(balance.amount, balance.currency)}</div>
            </div>
          </div>
        </div>

        {/* ── 2-column layout ───────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ══ LEFT COLUMN — Signals + Coupon ════════════════════════════ */}
          <div className={cn(
            "flex flex-col overflow-y-auto border-r border-bg-tertiary",
            "w-full md:w-[42%] lg:w-[38%]",
            showChatMobile ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 space-y-4 flex-1">

              {/* AI Performance card */}
              {picksStats && (picksStats.yesterday.total > 0 || picksStats.last30Days.total > 0) && (
                <div className="bg-bg-secondary rounded-xl p-3 border border-bg-tertiary flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
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
                </div>
              )}

              {/* Signals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                    Signaux du Jour
                  </h2>
                  {aiPicks.length > 0 && (
                    <span className="text-xs text-text-tertiary">{aiPicks.length} match{aiPicks.length > 1 ? "s" : ""}</span>
                  )}
                </div>

                {picksLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-bg-secondary rounded-xl h-28 animate-pulse border border-bg-tertiary" />
                    ))}
                  </div>
                )}

                {!picksLoading && aiPicks.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🤖</div>
                    <p className="text-sm text-text-secondary font-medium">Aucun signal pour aujourd&apos;hui</p>
                    <p className="text-xs text-text-tertiary mt-1">Les agents analysent les matchs à 08:00</p>
                  </div>
                )}

                {aiPicks.map((pick) => {
                  const level = signalLevel(pick.confidence)
                  const isSelected = selectedSignals.includes(pick.matchId)
                  const pct = Math.round(pick.confidence * 100)
                  const kickoff = new Date(pick.expiresAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

                  return (
                    <div
                      key={pick.id}
                      className={cn(
                        "bg-bg-secondary rounded-xl p-4 border-2 transition-all",
                        isSelected ? "border-accent-cyan" : level.border,
                        "hover:border-accent-cyan/40"
                      )}
                    >
                      {/* Signal badge + kickoff */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full animate-pulse", level.dot)} />
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider", level.color)}>
                            {level.label}
                          </span>
                        </div>
                        <span className="text-xs text-text-tertiary">{kickoff}</span>
                      </div>

                      {/* Teams */}
                      <div className="mb-1">
                        <p className="font-display font-semibold text-text-primary text-sm leading-tight">
                          {pick.match.homeTeam.name} vs {pick.match.awayTeam.name}
                        </p>
                        <p className="text-xs text-text-tertiary">{pick.match.competition.name}</p>
                      </div>

                      {/* Confidence bar + pick */}
                      <div className="flex items-center gap-2 mt-2 mb-1">
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-accent-cyan font-mono">{pct}%</span>
                        <span className="text-xs font-bold text-text-primary bg-bg-tertiary px-1.5 py-0.5 rounded">
                          {predictionLabel(pick.prediction)} · ×{pick.odds.toFixed(2)}
                        </span>
                      </div>

                      {/* Agent + reasoning */}
                      <p className="text-[11px] text-text-tertiary italic leading-relaxed mb-3 line-clamp-2">
                        &ldquo;{pick.reasoning}&rdquo;
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPendingMatchForChat({
                              id: pick.matchId,
                              homeTeam: pick.match.homeTeam.name,
                              awayTeam: pick.match.awayTeam.name,
                              league: pick.match.competition.name,
                            })
                            setShowChatMobile(true)
                          }}
                          className="flex-1 text-xs py-1.5 rounded-lg border border-bg-tertiary text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Analyser
                        </button>
                        <button
                          onClick={() => toggleSignal(pick.matchId)}
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

            {/* ── Coupon panel (sticky bottom of left column) ─────────────── */}
            {selectedPicksData.length > 0 && (
              <div className="sticky bottom-0 border-t-2 border-accent-cyan/30 bg-bg-secondary p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">
                    Mon Coupon ({selectedPicksData.length})
                  </span>
                  <span className="text-sm font-mono text-accent-cyan font-bold">×{totalOdds.toFixed(2)}</span>
                </div>

                {/* Legs */}
                <div className="space-y-1">
                  {selectedPicksData.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary truncate max-w-[60%]">
                        {p.match.homeTeam.name} vs {p.match.awayTeam.name}
                      </span>
                      <span className="text-accent-cyan font-bold font-mono">
                        {predictionLabel(p.prediction)} ×{p.odds.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stake */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    placeholder={`Mise en ${balance.currency}`}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm",
                      "bg-bg-primary border border-bg-tertiary",
                      "text-text-primary placeholder:text-text-tertiary",
                      "focus:outline-none focus:border-accent-cyan"
                    )}
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
                    className="px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-accent-red border border-bg-tertiary transition-colors"
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
          </div>

          {/* ══ RIGHT COLUMN — Chat IA ═════════════════════════════════════ */}
          <div className={cn(
            "flex flex-col flex-1 overflow-hidden",
            showChatMobile ? "flex" : "hidden md:flex"
          )}>
            {/* Mobile back button */}
            <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-bg-tertiary">
              <button
                onClick={() => setShowChatMobile(false)}
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-sm"
              >
                ← Signaux
              </button>
              {pendingMatchForChat && (
                <span className="text-xs text-text-tertiary ml-2">
                  {pendingMatchForChat.homeTeam} vs {pendingMatchForChat.awayTeam}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Active match context */}
              {pendingMatchForChat ? (
                <div className="bg-bg-secondary rounded-xl p-3 border border-accent-cyan/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wide mb-0.5">Match chargé</p>
                    <p className="text-sm font-bold text-text-primary">
                      {pendingMatchForChat.homeTeam} vs {pendingMatchForChat.awayTeam}
                    </p>
                    <p className="text-xs text-text-tertiary">{pendingMatchForChat.league}</p>
                  </div>
                  <button
                    onClick={() => setPendingMatchForChat(null)}
                    className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="text-sm text-text-secondary">Cliquez sur &ldquo;Analyser&rdquo; sur un signal pour charger un match</p>
                  <p className="text-xs text-text-tertiary mt-1">ou tapez @AgentName dans le chat</p>
                </div>
              )}

              {/* Burst mode indicator */}
              {burstModeActive && (
                <div className="p-3 rounded-xl bg-linear-to-r from-accent-gold/20 to-accent-orange/20 border-2 border-accent-gold/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="font-display font-bold text-text-primary text-sm">Burst Mode Actif</div>
                      <div className="text-xs text-text-secondary">Invocations illimitées LIVE</div>
                    </div>
                  </div>
                  <div className="text-accent-gold font-mono font-bold text-xl">∞</div>
                </div>
              )}

              {/* Full analysis button */}
              {pendingMatchForChat && (
                <Button
                  size="sm"
                  onClick={() => setShowFullAnalysisConfirm(true)}
                  className="w-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/20"
                  disabled={isFullAnalysis}
                >
                  {isFullAnalysis ? `⚡ Analyse... ${fullAnalysisProgress}/${AGENTS.length}` : "⚡ Analyse Complète (14 agents)"}
                </Button>
              )}

              {/* Progress bar during full analysis */}
              {isFullAnalysis && (
                <div className="w-full bg-bg-tertiary rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-accent-cyan transition-all duration-300"
                    style={{ width: `${(fullAnalysisProgress / AGENTS.length) * 100}%` }} />
                </div>
              )}

              {/* Message thread */}
              <div className="space-y-3">
                {messages.length === 0 && !pendingMatchForChat && null}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-lg p-3",
                      message.type === "user"
                        ? "bg-bg-tertiary ml-auto max-w-[80%]"
                        : "bg-bg-primary border border-bg-tertiary"
                    )}
                  >
                    {message.type === "agent" && (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <button
                          onClick={() => setAccuracyModalAgent(message.agentId ?? null)}
                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group"
                        >
                          <span className="text-xl">{AGENTS.find((a) => a.id === message.agentId)?.emoji}</span>
                          <span className="font-display font-semibold text-text-primary text-sm group-hover:text-accent-cyan transition-colors">
                            {message.agentName}
                          </span>
                        </button>
                        <button
                          onClick={() => playingMessageId === message.id ? stopTTS() : startTTS(message.id, message.content)}
                          className={cn(
                            "p-1.5 rounded-full transition-colors",
                            playingMessageId === message.id ? "bg-accent-cyan/20 text-accent-cyan" : "text-text-tertiary hover:text-accent-cyan"
                          )}
                        >
                          {playingMessageId === message.id ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                        {playingMessageId === message.id && (
                          <div className="flex items-center gap-1">
                            {[0.75, 1, 1.5, 2].map((rate) => (
                              <button key={rate} onClick={() => { setSpeechRate(rate); stopTTS(); setTimeout(() => startTTS(message.id, message.content), 100) }}
                                className={cn("px-1.5 py-0.5 rounded text-[10px]", speechRate === rate ? "bg-accent-cyan text-bg-primary" : "text-text-tertiary hover:text-text-primary")}>
                                {rate}x
                              </button>
                            ))}
                          </div>
                        )}
                        {message.confidence !== undefined && (() => {
                          const s = getConfidenceStyle(message.confidence)
                          return (
                            <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", s.bgColor, s.textColor, s.borderColor)}>
                              {message.confidence}%
                            </div>
                          )
                        })()}
                        <span className="text-xs text-text-tertiary ml-auto">
                          {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
                    {message.type === "user" && (
                      <div className="text-xs text-text-tertiary mt-1 text-right">
                        {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                ))}
                {isInvoking && (
                  <div className="rounded-lg p-3 bg-bg-primary border border-bg-tertiary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                      <span className="text-sm text-text-secondary">Agent en cours d&apos;analyse…</span>
                    </div>
                  </div>
                )}
                {uniqueAgentCount >= 2 && (
                  <Button variant="outline" size="sm" onClick={() => setShowComparison(true)} className="w-full">
                    🔄 Comparer les agents ({uniqueAgentCount})
                  </Button>
                )}
              </div>
            </div>

            {/* Chat input */}
            <div className="border-t border-bg-tertiary p-4">
              <div className="relative">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && selectedAgent) void handleInvokeAgent() }}
                  placeholder="@AgentName — ex: @Scout analyse ce match"
                  className={cn(
                    "w-full px-4 py-3 pr-24 rounded-lg",
                    "bg-bg-secondary border-2 border-bg-tertiary",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:border-accent-cyan transition-colors"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button onClick={isRecording ? stopRecording : startRecording} disabled={isInvoking}
                    className={cn("p-2 rounded-full transition-all", isRecording ? "bg-accent-red text-white animate-pulse" : "text-text-secondary hover:text-accent-cyan hover:bg-bg-tertiary", isInvoking && "opacity-50 cursor-not-allowed")}>
                    <Mic className="h-5 w-5" />
                  </button>
                  <button onClick={() => void handleInvokeAgent()} disabled={!selectedAgent || isInvoking}
                    className={cn("p-2 rounded-full transition-colors", selectedAgent && !isInvoking ? "text-accent-cyan hover:bg-accent-cyan/10" : "text-text-tertiary cursor-not-allowed")}>
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                {showAgentSuggestions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAgentSuggestions(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-20 max-h-75 overflow-y-auto">
                      {filteredAgents.map((agent) => (
                        <button key={agent.id} onClick={() => handleAgentSelect(agent.id, agent.name)}
                          className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-start gap-3">
                          <span className="text-2xl">{agent.emoji}</span>
                          <div className="flex-1">
                            <div className="font-display font-semibold text-text-primary">{agent.name}</div>
                            <div className="text-sm text-text-secondary">{agent.description}</div>
                            <div className="text-xs text-text-tertiary mt-1">{agent.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: floating chat button when on signals view */}
        {!showChatMobile && (
          <button
            onClick={() => setShowChatMobile(true)}
            className={cn(
              "md:hidden fixed bottom-20 right-4 z-30",
              "w-12 h-12 rounded-full bg-accent-cyan text-bg-primary shadow-lg",
              "flex items-center justify-center",
              messages.length > 0 && "ring-2 ring-accent-cyan/40 ring-offset-2 ring-offset-bg-primary"
            )}
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}

      {/* Full analysis confirm */}
      {showFullAnalysisConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFullAnalysisConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-text-primary">Lancer l&apos;analyse complète ?</h3>
              <p className="text-sm text-text-secondary">
                Les {AGENTS.length} agents vont analyser{" "}
                <span className="font-semibold text-accent-cyan">
                  {pendingMatchForChat ? `${pendingMatchForChat.homeTeam} vs ${pendingMatchForChat.awayTeam}` : "ce match"}
                </span>.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFullAnalysisConfirm(false)} className="flex-1">Annuler</Button>
                <Button onClick={handleFullAnalysis} className="flex-1 bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90">Lancer</Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Agent comparison */}
      {showComparison && agentMessages.length >= 2 && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowComparison(false)} />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-text-primary">Comparaison des Agents</h3>
                <button onClick={() => setShowComparison(false)} className="text-text-secondary hover:text-text-primary transition-colors">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentMessages.map((message) => {
                  const agent = AGENTS.find((a) => a.id === message.agentId)
                  const style = message.confidence ? getConfidenceStyle(message.confidence) : null
                  return (
                    <div key={message.id} className="bg-bg-primary rounded-lg border border-bg-tertiary p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{agent?.emoji}</span>
                        <div className="flex-1">
                          <div className="font-display font-semibold text-text-primary">{message.agentName}</div>
                          <div className="text-xs text-text-tertiary">{agent?.category}</div>
                        </div>
                        {message.confidence !== undefined && style && (
                          <div className={cn("px-2 py-1 rounded-full text-xs font-medium border", style.bgColor, style.textColor, style.borderColor)}>
                            {message.confidence}%
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )
                })}
              </div>
              {agentMessages.length >= 2 && (() => {
                const confidences = agentMessages.filter((m) => m.confidence !== undefined).map((m) => m.confidence!)
                if (confidences.length < 2) return null
                const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length
                const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / confidences.length
                const stdDev = Math.sqrt(variance)
                return (
                  <div className="mt-4 p-4 bg-bg-tertiary rounded-lg">
                    <div className="text-sm font-medium text-text-primary mb-2">Indicateur de consensus</div>
                    <div className="text-xs text-text-secondary">
                      {stdDev < 10 ? "✅ Fort consensus" : stdDev < 20 ? "⚖️ Consensus modéré" : "⚠️ Opinions divergentes"}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Confiance moyenne : {avg.toFixed(1)}% (écart-type : {stdDev.toFixed(1)})
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {/* Historical accuracy modal */}
      {accuracyModalAgent && (() => {
        const agent = AGENTS.find((a) => a.id === accuracyModalAgent)
        const accuracy = agent?.historicalAccuracy
        return (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setAccuracyModalAgent(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg">
              <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent?.emoji}</span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text-primary">{agent?.name}</h3>
                      <p className="text-xs text-text-tertiary">{agent?.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setAccuracyModalAgent(null)} className="text-text-secondary hover:text-text-primary transition-colors">✕</button>
                </div>
                {!accuracy || accuracy.totalPredictions < 30 ? (
                  <div className="bg-bg-primary rounded-lg p-4 text-center">
                    <p className="text-text-secondary text-sm">⏳ Données insuffisantes</p>
                    <p className="text-text-tertiary text-xs mt-1">{accuracy?.totalPredictions ?? 0} prédictions (minimum 30 requis)</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary">Précision Globale</span>
                      {(() => {
                        const s = getAccuracyStyle(accuracy.overallAccuracy)
                        return <div className={cn("px-3 py-1 rounded-full text-sm font-semibold border-2", s.bgColor, s.textColor, s.borderColor)}>{accuracy.overallAccuracy}%</div>
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary">Forme Récente (30j)</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-lg", accuracy.recentForm > accuracy.overallAccuracy ? "text-green-500" : accuracy.recentForm < accuracy.overallAccuracy ? "text-orange-500" : "text-text-tertiary")}>
                          {accuracy.recentForm > accuracy.overallAccuracy ? "↑" : accuracy.recentForm < accuracy.overallAccuracy ? "↓" : "→"}
                        </span>
                        <span className="text-text-primary font-semibold">{accuracy.recentForm}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Résultat", value: accuracy.predictionBreakdown.result },
                        { label: "Buts", value: accuracy.predictionBreakdown.goals },
                        { label: "Corners", value: accuracy.predictionBreakdown.corners },
                        { label: "Cartes", value: accuracy.predictionBreakdown.cards },
                      ].map((item) => (
                        <div key={item.label} className="bg-bg-primary rounded-lg p-3 border border-bg-tertiary">
                          <div className="text-xs text-text-tertiary mb-1">{item.label}</div>
                          <div className="text-text-primary font-semibold">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-bg-primary rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">Valeur ajoutée vs hasard (50%)</span>
                        <span className="text-accent-cyan font-semibold">+{(accuracy.overallAccuracy - 50).toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">{accuracy.totalPredictions} prédictions analysées</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )
      })()}

      {/* Premium burst upsell */}
      {showBurstUpsell && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowBurstUpsell(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            <div className="bg-bg-secondary rounded-lg border-2 border-accent-gold p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-accent-gold to-accent-orange flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary mb-2">Burst Mode Premium</h3>
                <p className="text-sm text-text-secondary">Match LIVE détecté ! Débloquez l&apos;accès illimité aux agents pendant les matchs en direct.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBurstUpsell(false)} className="flex-1">Plus tard</Button>
                <Button onClick={() => router.push("/subscription")} className="flex-1 bg-linear-to-r from-accent-gold to-accent-orange text-bg-primary hover:opacity-90">Passer Premium</Button>
              </div>
            </div>
          </div>
        </>
      )}

      <DashboardNav />
    </div>
  )
}
