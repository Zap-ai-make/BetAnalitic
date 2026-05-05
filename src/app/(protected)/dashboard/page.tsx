"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useLang } from "~/lib/lang"

// ── Agent definitions ────────────────────────────────────────
const AGENTS = [
  { id: "Scout", glyph: "SC", hue: 200, role: "DATA", cat: "H2H · Historique" },
  { id: "Insider", glyph: "IN", hue: 22, role: "DATA", cat: "Compos · Blessés" },
  { id: "RefereeAnalyst", glyph: "RF", hue: 300, role: "DATA", cat: "Arbitre · Tendances" },
  { id: "TacticMaster", glyph: "TM", hue: 190, role: "ANALYSE", cat: "Formation · Matchup" },
  { id: "ContextKing", glyph: "CK", hue: 45, role: "ANALYSE", cat: "Enjeux · Rivalités" },
  { id: "MomentumX", glyph: "MX", hue: 330, role: "ANALYSE", cat: "Forme · Dynamique" },
  { id: "WallMaster", glyph: "WM", hue: 260, role: "ANALYSE", cat: "Défense · Clean sheet" },
  { id: "GoalMaster", glyph: "GM", hue: 140, role: "MARCHE", cat: "Buts · BTTS" },
  { id: "CornerKing", glyph: "CN", hue: 165, role: "MARCHE", cat: "Corners" },
  { id: "CardShark", glyph: "CS", hue: 10, role: "MARCHE", cat: "Cartons" },
  { id: "CrowdWatch", glyph: "CW", hue: 90, role: "INTEL", cat: "Sentiment" },
  { id: "LivePulse", glyph: "LP", hue: 120, role: "LIVE", cat: "Commentaire" },
  { id: "DebateArena", glyph: "DA", hue: 285, role: "LIVE", cat: "Débats · Verdict" },
  { id: "Debrief", glyph: "DB", hue: 60, role: "LIVE", cat: "Post-match" },
] as const

type AgentId = typeof AGENTS[number]["id"]
const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<AgentId, typeof AGENTS[number]>
// ── Manga-style agent avatars ─────────────────────────────────
type HairStyle = "short" | "spiky" | "long" | "bun" | "cap"
type EyeStyle = "round" | "sharp" | "wide"
type MouthStyle = "smile" | "neutral" | "serious"
interface AvatarSpec { bg: string; hc: string; hair: HairStyle; eyes: EyeStyle; mouth: MouthStyle }

const AVATAR_SPECS: Record<"Oracle" | AgentId, AvatarSpec> = {
  Oracle:         { bg: "#00c8e0", hc: "#004e60", hair: "long",  eyes: "wide",    mouth: "smile"   },
  Scout:          { bg: "#00CC66", hc: "#005522", hair: "short", eyes: "round",   mouth: "neutral" },
  Insider:        { bg: "#FF6B35", hc: "#7A2000", hair: "cap",   eyes: "sharp",   mouth: "neutral" },
  RefereeAnalyst: { bg: "#FFD93D", hc: "#7A5500", hair: "bun",   eyes: "round",   mouth: "serious" },
  TacticMaster:   { bg: "#00D4FF", hc: "#004466", hair: "spiky", eyes: "sharp",   mouth: "serious" },
  ContextKing:    { bg: "#9B59B6", hc: "#3D1060", hair: "long",  eyes: "round",   mouth: "smile"   },
  MomentumX:      { bg: "#E91E63", hc: "#6A0030", hair: "spiky", eyes: "wide",    mouth: "smile"   },
  WallMaster:     { bg: "#607D8B", hc: "#1a2a30", hair: "short", eyes: "sharp",   mouth: "serious" },
  GoalMaster:     { bg: "#4CAF50", hc: "#1a4a1a", hair: "short", eyes: "round",   mouth: "smile"   },
  CornerKing:     { bg: "#FF9800", hc: "#7A3300", hair: "cap",   eyes: "wide",    mouth: "smile"   },
  CardShark:      { bg: "#F44336", hc: "#5a0000", hair: "spiky", eyes: "sharp",   mouth: "serious" },
  CrowdWatch:     { bg: "#3F51B5", hc: "#0d1550", hair: "long",  eyes: "round",   mouth: "smile"   },
  LivePulse:      { bg: "#00BCD4", hc: "#003a44", hair: "short", eyes: "wide",    mouth: "smile"   },
  DebateArena:    { bg: "#FFEB3B", hc: "#7A5500", hair: "bun",   eyes: "sharp",   mouth: "neutral" },
  Debrief:        { bg: "#8BC34A", hc: "#2a4a00", hair: "long",  eyes: "round",   mouth: "neutral" },
}

function AgentFace({ id, size = 36 }: { id: "Oracle" | AgentId; size?: number }) {
  const s = AVATAR_SPECS[id] ?? AVATAR_SPECS.Oracle
  const skin = "#FFDDBA"
  const iris = s.bg
  const dark = "#1a1a2e"

  const hair = (() => {
    if (s.hair === "short")  return <path d="M8 22 Q8 4 20 4 Q32 4 32 22Z" fill={s.hc}/>
    if (s.hair === "spiky")  return <path d="M8 22 L8 18 L12 8 L15.5 16 L20 4 L24.5 16 L28 8 L32 18 L32 22Z" fill={s.hc}/>
    if (s.hair === "bun")    return <><path d="M8 22 Q8 6 20 6 Q32 6 32 22Z" fill={s.hc}/><circle cx="20" cy="3" r="5.5" fill={s.hc}/></>
    if (s.hair === "cap")    return <><path d="M3 20 L8 13 Q20 8 32 13 L37 20Z" fill={s.hc}/><rect x="8" y="17" width="24" height="5" rx="1" fill={s.hc}/></>
    // long
    return <><path d="M8 22 Q8 4 20 4 Q32 4 32 22Z" fill={s.hc}/><path d="M8 22 Q5 32 4 40 Q7 33 10 28Z" fill={s.hc}/><path d="M32 22 Q35 32 36 40 Q33 33 30 28Z" fill={s.hc}/></>
  })()

  const eyes = (() => {
    if (s.eyes === "round") return <>
      <ellipse cx="14.5" cy="22" rx="3.5" ry="4.2" fill={dark}/>
      <ellipse cx="14.5" cy="22" rx="2.3" ry="3" fill={iris}/>
      <circle cx="16" cy="20.5" r="1.2" fill="white"/>
      <circle cx="13.2" cy="23.4" r="0.6" fill="white" opacity="0.7"/>
      <ellipse cx="25.5" cy="22" rx="3.5" ry="4.2" fill={dark}/>
      <ellipse cx="25.5" cy="22" rx="2.3" ry="3" fill={iris}/>
      <circle cx="27" cy="20.5" r="1.2" fill="white"/>
      <circle cx="24.2" cy="23.4" r="0.6" fill="white" opacity="0.7"/>
    </>
    if (s.eyes === "sharp") return <>
      <path d="M11 21.5 Q14.5 17.5 18 21.5 Q14.5 25.5 11 21.5Z" fill={dark}/>
      <path d="M12.5 21.5 Q14.5 19 16.5 21.5 Q14.5 24 12.5 21.5Z" fill={iris}/>
      <circle cx="15.2" cy="20.5" r="1" fill="white"/>
      <path d="M22 21.5 Q25.5 17.5 29 21.5 Q25.5 25.5 22 21.5Z" fill={dark}/>
      <path d="M23.5 21.5 Q25.5 19 27.5 21.5 Q25.5 24 23.5 21.5Z" fill={iris}/>
      <circle cx="26.2" cy="20.5" r="1" fill="white"/>
    </>
    // wide
    return <>
      <ellipse cx="14.5" cy="22" rx="4.2" ry="5" fill={dark}/>
      <ellipse cx="14.5" cy="22" rx="2.9" ry="3.7" fill={iris}/>
      <circle cx="16.3" cy="20" r="1.5" fill="white"/>
      <circle cx="13" cy="23.8" r="0.7" fill="white" opacity="0.7"/>
      <ellipse cx="25.5" cy="22" rx="4.2" ry="5" fill={dark}/>
      <ellipse cx="25.5" cy="22" rx="2.9" ry="3.7" fill={iris}/>
      <circle cx="27.3" cy="20" r="1.5" fill="white"/>
      <circle cx="24" cy="23.8" r="0.7" fill="white" opacity="0.7"/>
    </>
  })()

  const mouth = (() => {
    if (s.mouth === "smile")   return <>
      <path d="M16 30.5 Q20 34 24 30.5" stroke="#9a6040" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <ellipse cx="11.5" cy="27.5" rx="2.8" ry="1.4" fill="#ffb09a" opacity="0.45"/>
      <ellipse cx="28.5" cy="27.5" rx="2.8" ry="1.4" fill="#ffb09a" opacity="0.45"/>
    </>
    if (s.mouth === "neutral") return <path d="M17 30.5 Q20 31.5 23 30.5" stroke="#9a6040" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    return <path d="M16.5 30.5 L23.5 30.5" stroke="#9a6040" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  })()

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ borderRadius: "50%", display: "block", flexShrink: 0 }}>
      <circle cx="20" cy="20" r="20" fill={s.bg}/>
      {hair}
      <ellipse cx="20" cy="25" rx="11.5" ry="12.5" fill={skin}/>
      {eyes}
      <path d="M19 27.5 Q20 29 21 27.5" stroke="#9a6040" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      {mouth}
    </svg>
  )
}

// Module-level: persists in memory during SPA navigation (module stays loaded)
// sessionStorage: backup for code-split edge cases
const INTRO_KEY = "introShown"
let _introShownInMemory = false

function introShownThisSession(): boolean {
  if (_introShownInMemory) return true
  if (typeof window === "undefined") return false
  const stored = sessionStorage.getItem(INTRO_KEY) === "1"
  if (stored) _introShownInMemory = true
  return stored
}

// ── Intro splash ─────────────────────────────────────────────
interface IntroSplashProps { onDone: () => void }

// L0 — prise de conscience (slow, display)
// L1 — ce que vous pouvez faire (fast, mono list)
// L2 — transformation CTA (very slow, accent)
const INTRO_LINES = {
  FR: [
    "Les gagnants n'ont pas plus de chance. Ils ont plus d'informations.",
    "Compositions réelles · Blessures cachées · Tensions de vestiaire · Forme des joueurs · Signaux de value en direct.",
    "Arrêtez de parier. Commencez à investir.",
  ],
  EN: [
    "Winners don't have more luck. They have more information.",
    "Real lineups · Hidden injuries · Locker room tensions · Player form · Live value signals.",
    "Stop gambling. Start investing.",
  ],
} as const

const INTRO_SPEEDS = [32, 14, 42] as const

function IntroSplash({ onDone }: IntroSplashProps) {
  const { lang } = useLang()
  const lines = INTRO_LINES[lang]
  const [phase, setPhase] = useState<"in" | "exit-title" | "type" | "hold" | "out">("in")
  const [lineIdx, setLineIdx] = useState(0)
  const [typed, setTyped] = useState("")
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // Trigger h1 exit after lines are fully in
  useEffect(() => {
    const t = setTimeout(() => setPhase("exit-title"), 1650)
    return () => clearTimeout(t)
  }, [])

  // Start typewriter after h1 has exited (380ms transition)
  useEffect(() => {
    if (phase !== "exit-title") return
    const t = setTimeout(() => { setPhase("type"); setLineIdx(0); setTyped("") }, 420)
    return () => clearTimeout(t)
  }, [phase])

  // Typewriter — types line by line
  useEffect(() => {
    if (phase !== "type") return
    const line = lines[lineIdx] ?? ""
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(line.slice(0, i))
      if (i >= line.length) {
        clearInterval(id)
        const next = lineIdx + 1
        if (next < lines.length) {
          setTimeout(() => { setLineIdx(next); setTyped("") }, 320)
        } else {
          setTimeout(() => setPhase("hold"), 320)
        }
      }
    }, INTRO_SPEEDS[lineIdx] ?? 18)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lineIdx])

  // Fade out after hold
  useEffect(() => {
    if (phase !== "hold") return
    const tOut  = setTimeout(() => setPhase("out"),  3400)
    const tDone = setTimeout(() => onDoneRef.current(), 4100)
    return () => { clearTimeout(tOut); clearTimeout(tDone) }
  }, [phase])

  const showTitle = phase === "in" || phase === "exit-title"
  const showSub   = phase === "type" || phase === "hold" || phase === "out"

  return (
    <div className={`intro-splash${phase === "out" ? " fade-out" : ""}`}>
      <h1
        className="intro-mega"
        style={{
          // Once invisible, pull out of flow so subtitle centers without h1 pushing it down
          position: showTitle ? undefined : "absolute",
          transition: "opacity 0.38s ease, transform 0.38s ease",
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? "none" : "translateY(-12px) scale(0.97)",
          pointerEvents: "none",
        }}
      >
        <div className="intro-line" style={{ "--intro-delay": "0ms" } as React.CSSProperties}>
          <span className="fill">READ THE</span>
        </div>
        <div className="intro-line" style={{ "--intro-delay": "300ms" } as React.CSSProperties}>
          <span className="accent">GAME.</span>
        </div>
        <div className="intro-line" style={{ "--intro-delay": "620ms" } as React.CSSProperties}>
          <span className="outline">DECODE IT.</span>
        </div>
      </h1>

      {showSub && (
        <div className="intro-subtitle-wrap">
          {lines.map((line, i) => (
            <p key={i} className={`intro-subtitle${i === 0 ? " intro-subtitle--hook" : i === lines.length - 1 ? " intro-subtitle--cta" : ""}`}>
              {i < lineIdx
                ? line
                : i === lineIdx
                  ? <>{typed}{phase === "type" && <span className="intro-sub-caret" />}</>
                  : null}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Agent greeting messages ───────────────────────────────────
function agentGreeting(id: "Oracle" | AgentId, username: string, lang: "FR" | "EN" = "FR"): string {
  if (lang === "EN") {
    if (id === "Oracle") return `Hi ${username}! I'm Oracle, your AI analytics assistant. I coordinate 14 specialized agents to give you a complete analysis of every match. Ask your question or pick an expert.`
    const a = BY_ID[id as AgentId]!
    const en: Partial<Record<AgentId, string>> = {
      Scout: "exploring head-to-head records and team history",
      Insider: "analyzing team lineups and injury reports",
      RefereeAnalyst: "decoding refereeing trends and their impact on results",
      TacticMaster: "breaking down tactical formations and key matchups",
      ContextKing: "contextualizing stakes, rivalries and mental pressure",
      MomentumX: "measuring recent form and team momentum",
      WallMaster: "analyzing defenses and clean sheet probabilities",
      GoalMaster: "predicting goals, BTTS and offensive markets",
      CornerKing: "analyzing corner stats and related markets",
      CardShark: "predicting cards, tactical fouls and suspensions",
      CrowdWatch: "measuring fan sentiment and crowd dynamics",
      LivePulse: "tracking real-time events and live commentary",
      DebateArena: "hosting tactical debates and delivering the final verdict",
      Debrief: "analyzing post-match performance and key takeaways",
    }
    return `Hi ${username}! I'm @${id}, specialist in ${a.cat}. I'll help you analyze by ${en[id as AgentId] ?? `covering ${a.cat}`}. What's your question?`
  }
  if (id === "Oracle") return `Salut ${username} ! Je suis Oracle, ton assistant analytique IA. Je coordonne les 14 agents spécialisés pour t'offrir une analyse complète de chaque match. Pose ta question ou sélectionne un expert.`
  const a = BY_ID[id as AgentId]!
  const fr: Partial<Record<AgentId, string>> = {
    Scout: "explorant les confrontations directes et l'historique des équipes",
    Insider: "analysant les compositions et le suivi des blessures",
    RefereeAnalyst: "décryptant les tendances arbitrales et leur influence sur les résultats",
    TacticMaster: "décryptant les formations tactiques et les duels clés",
    ContextKing: "contextualisant les enjeux, rivalités et la pression mentale",
    MomentumX: "mesurant la forme récente et la dynamique des équipes",
    WallMaster: "analysant les défenses et les probabilités de clean sheet",
    GoalMaster: "prédisant les buts, BTTS et les marchés offensifs",
    CornerKing: "analysant les statistiques de corners et marchés associés",
    CardShark: "prédisant les cartons, fautes tactiques et suspensions",
    CrowdWatch: "mesurant le sentiment des fans et les dynamiques de crowd",
    LivePulse: "suivant les événements en temps réel et le flux live",
    DebateArena: "animant les débats tactiques et rendant le verdict final",
    Debrief: "analysant les performances post-match et les enseignements clés",
  }
  return `Salut ${username} ! Je suis @${id}, spécialiste en ${a.cat}. Je vais t'aider dans ton analyse en ${fr[id as AgentId] ?? `couvrant ${a.cat}`}. Quelle est ta question ?`
}

// ── Pending match (from Matchs page) ─────────────────────────
interface PendingMatch {
  id: string; homeTeam: string; awayTeam: string
  competition: string; country: string; time: string
  status: "live" | "upcoming" | "finished"
}

// ── Chat persistence helpers ──────────────────────────────────
interface ExtraMsg { role: "user" | "oracle" | "system"; body: string; agentId?: "Oracle" | AgentId }
interface Conversation { id: string; title: string; agentId: "Oracle" | AgentId; messages: ExtraMsg[]; ts: number; matchCtx?: PendingMatch | null }
type TypingGreeting = { text: string; typed: string; agentId: "Oracle" | AgentId }

const CONV_KEY = "betanalytic_conversations"
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

function loadConvs(): Conversation[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(CONV_KEY) ?? "[]") as Conversation[] }
  catch { return [] }
}
function saveConvs(convs: Conversation[]) {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs.slice(0, 40)))
}

// ── Oracle console (ChatGPT-style) ───────────────────────────
function OracleConsole({ username, ready, pendingMatch, pendingAgent, onMatchConsumed }: {
  username: string
  ready: boolean
  pendingMatch: PendingMatch | null
  pendingAgent: string | null
  onMatchConsumed: () => void
}) {
  const [draft, setDraft] = useState("")
  const [extra, setExtra] = useState<ExtraMsg[]>([])
  const [agent, setAgent] = useState<"Oracle" | AgentId>("Oracle")
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [typingGreeting, setTypingGreeting] = useState<TypingGreeting | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const { lang, t: tl } = useLang()
  const convIdRef = useRef<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const [matchCtx, setMatchCtx] = useState<PendingMatch | null>(null)
  const matchCtxRef = useRef<PendingMatch | null>(null)
  const matchInjectedRef = useRef(false)

  // Keep ref in sync so the save effect never captures a stale value
  useEffect(() => { matchCtxRef.current = matchCtx }, [matchCtx])

  const restoredRef = useRef(false)

  // Inject pending match when ready
  useEffect(() => {
    if (!ready || !pendingMatch || matchInjectedRef.current) return
    matchInjectedRef.current = true
    setMatchCtx(pendingMatch)
    onMatchConsumed()
    // Clear existing chat and start fresh for this match
    convIdRef.current = null
    setAgent("Oracle")
    setShowHistory(false)
    const flag = pendingMatch.status === "live" ? "🔴 LIVE" : pendingMatch.time
    const sys = `─── Match chargé : ${pendingMatch.homeTeam} vs ${pendingMatch.awayTeam} · ${pendingMatch.competition} ───`
    const greeting = `Match **${pendingMatch.homeTeam} vs ${pendingMatch.awayTeam}** (${pendingMatch.competition}) chargé et prêt pour l'analyse ! Je coordonne les 14 agents spécialisés. Quel aspect veux-tu creuser ? (buts, corners, cartons, tactique…) Ou @mentionne directement un agent.`
    setExtra([
      { role: "system", body: sys },
      { role: "oracle", body: greeting, agentId: "Oracle" },
    ])
    setTypingGreeting(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pendingMatch])

  // Pre-select agent when coming from Rapport page
  useEffect(() => {
    if (!ready || !pendingAgent) return
    const id = pendingAgent as "Oracle" | AgentId
    if (id in BY_ID || id === "Oracle") {
      pickAgent(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pendingAgent])

  // Load conversations from localStorage on mount
  useEffect(() => {
    const convs = loadConvs()
    setConversations(convs)

    // Restore last conversation so chat is persistent across tab switches
    if (convs.length > 0 && convs[0]) {
      const last = convs[0]
      convIdRef.current = last.id
      setExtra(last.messages)
      setAgent(last.agentId)
      if (last.matchCtx) { setMatchCtx(last.matchCtx); matchCtxRef.current = last.matchCtx }
      restoredRef.current = true
    }
  }, [])

  // Start greeting only after intro is done, and only if no restored conversation
  useEffect(() => {
    if (!ready) return
    if (restoredRef.current) return
    setTypingGreeting({ text: agentGreeting("Oracle", username, lang), typed: "", agentId: "Oracle" })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Typewriter character-by-character
  useEffect(() => {
    if (!typingGreeting || typingGreeting.typed.length >= typingGreeting.text.length) return
    const t = setTimeout(() => {
      setTypingGreeting((prev) => prev ? { ...prev, typed: prev.text.slice(0, prev.typed.length + 1) } : null)
    }, 16)
    return () => clearTimeout(t)
  }, [typingGreeting])

  // Commit completed greeting to messages
  useEffect(() => {
    if (!typingGreeting || typingGreeting.typed.length < typingGreeting.text.length) return
    const t = setTimeout(() => {
      setExtra((e) => [...e, { role: "oracle", body: typingGreeting.text, agentId: typingGreeting.agentId }])
      setTypingGreeting(null)
    }, 300)
    return () => clearTimeout(t)
  }, [typingGreeting])

  // Persist conversation on every message change
  useEffect(() => {
    if (extra.length === 0) return
    const id = convIdRef.current ?? genId()
    convIdRef.current = id
    const mc = matchCtxRef.current
    const title = mc
      ? `⚽ ${mc.homeTeam} vs ${mc.awayTeam}`
      : (extra.find((m) => m.role === "user")?.body.slice(0, 45) ?? "Conversation")
    const conv: Conversation = { id, title, agentId: agent, messages: extra, ts: Date.now(), matchCtx: mc }
    setConversations((prev) => {
      const next = [conv, ...prev.filter((c) => c.id !== id)]
      saveConvs(next)
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extra])

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [extra, typingGreeting])

  const isOracle = agent === "Oracle"
  const cur = isOracle ? null : BY_ID[agent as AgentId]

  const pickAgent = (id: "Oracle" | AgentId) => {
    // Agent already active — do nothing, don't reset interface
    if (id === agent) { setOpen(false); return }

    const label = id === "Oracle" ? "Oracle" : `@${id}`
    const alreadySeen = extra.some((m) => m.agentId === id)

    setAgent(id)
    setOpen(false)

    if (alreadySeen) {
      setExtra((e) => [...e, { role: "system", body: `— ${label} ${tl.oracle.agentActive} —` }])
      setTypingGreeting(null)
    } else {
      if (extra.length > 0 || typingGreeting) {
        setExtra((e) => [...e, { role: "system", body: `─── ${label} ${tl.oracle.agentActivated} ───` }])
      }
      const base = agentGreeting(id, username, lang)
      const withMatch = matchCtx && id !== "Oracle"
        ? base + (lang === "EN"
            ? ` I'm analyzing **${matchCtx.homeTeam} vs ${matchCtx.awayTeam}** (${matchCtx.competition}).`
            : ` J'analyse **${matchCtx.homeTeam} vs ${matchCtx.awayTeam}** (${matchCtx.competition}).`)
        : base
      setTypingGreeting({ text: withMatch, typed: "", agentId: id })
    }
  }

  const submit = () => {
    if (!draft.trim()) return
    const body = draft.trim()
    setExtra((e) => [...e, { role: "user", body }])
    setDraft("")
    if (taRef.current) taRef.current.style.height = "auto"
    const matchSuffix = matchCtx ? ` [${matchCtx.homeTeam} vs ${matchCtx.awayTeam} · ${matchCtx.competition}]` : ""
    setTimeout(() => {
      setExtra((e) => [...e, {
        role: "oracle",
        body: isOracle
          ? `${tl.oracle.analyzingVia}${matchSuffix}`
          : `@${agent} ${tl.oracle.processing}${matchSuffix}`,
        agentId: agent,
      }])
    }, 600)
  }

  const loadConversation = (conv: Conversation) => {
    convIdRef.current = conv.id
    setExtra(conv.messages)
    setAgent(conv.agentId)
    const mc = conv.matchCtx ?? null
    setMatchCtx(mc)
    matchCtxRef.current = mc
    setShowHistory(false)
    setTypingGreeting(null)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const startRename = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditingTitle(conv.title)
  }

  const commitRename = (id: string) => {
    const title = editingTitle.trim()
    if (!title) { setEditingId(null); return }
    setConversations((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, title } : c)
      saveConvs(next)
      return next
    })
    setEditingId(null)
  }

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveConvs(next)
      return next
    })
    // If we deleted the active conversation, reset the chat
    if (convIdRef.current === id) {
      convIdRef.current = null
      setExtra([])
      setAgent("Oracle")
      setMatchCtx(null)
      matchCtxRef.current = null
      setTypingGreeting({ text: agentGreeting("Oracle", username, lang), typed: "", agentId: "Oracle" })
      setShowHistory(false)
    }
  }

  const clearChat = () => {
    convIdRef.current = null
    setExtra([])
    setAgent("Oracle")
    setMatchCtx(null)
    matchCtxRef.current = null
    setShowHistory(false)
    setTypingGreeting({ text: agentGreeting("Oracle", username, lang), typed: "", agentId: "Oracle" })
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }

  const ddHeader = tl.oracle.agentSelector
  const placeholder = tl.oracle.messagePlaceholder
  const historyTitle = tl.oracle.history
  const historyEmpty = tl.oracle.noHistory

  return (
    <div className="console">
      <div className="console-corner tl" /><div className="console-corner tr" />
      <div className="console-corner bl" /><div className="console-corner br" />

      {/* ── Header ── */}
      <div className="gpt-header">
        {/* Left: selector + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <button className="gpt-model-btn" onClick={() => { setOpen((o) => !o); setShowHistory(false) }} aria-label={ddHeader} aria-expanded={open}>
            <AgentFace id={agent} size={22} />
            <span className="gpt-model-name">{isOracle ? "Oracle" : cur!.id}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ color: "#6b7280", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <span style={{ fontSize: 9, color: "#444e5e", fontFamily: "var(--font-jetbrains-mono,monospace)", letterSpacing: "0.04em", paddingLeft: 2 }}>
            {tl.oracle.agentsReady}
          </span>
        </div>

        {/* Dropdown — child of gpt-header (position:relative) so left:0/right:0 spans full width */}
        {open && (
          <div className="agent-dd" style={{ left: 0, right: 0 }}>
            <div className="agent-dd-h">{ddHeader}</div>
            <div className={`agent-opt${isOracle ? " sel" : ""}`} onClick={() => pickAgent("Oracle")}>
              <AgentFace id="Oracle" size={28} />
              <div className="ao-info">
                <div className="ao-name">Oracle</div>
                <div className="ao-cat">{tl.oracle.generalAgent}</div>
              </div>
            </div>
            {AGENTS.map((a) => (
              <div key={a.id} className={`agent-opt${agent === a.id ? " sel" : ""}`} onClick={() => pickAgent(a.id)}>
                <AgentFace id={a.id} size={28} />
                <div className="ao-info"><div className="ao-name">@{a.id}</div><div className="ao-cat">{a.cat}</div></div>
                <div className="ao-role">{a.role}</div>
              </div>
            ))}
            <div style={{ padding: "8px 14px 6px", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#545e71", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
              {tl.oracle.agentsReadyLong}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button className={`gpt-icon-btn${showHistory ? " active" : ""}`} onClick={() => { setShowHistory((h) => !h); setOpen(false) }} title={historyTitle} aria-label={historyTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
          </svg>
        </button>
        <button className="gpt-icon-btn" onClick={clearChat} title={tl.oracle.newConversation} aria-label={tl.oracle.newConversation}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="gpt-messages" ref={bodyRef}>
        {showHistory ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="gpt-history-title" style={{ marginBottom: 12 }}>{historyTitle}</div>
            {conversations.length === 0 ? (
              <div className="gpt-history-empty">{historyEmpty}</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => editingId !== conv.id && loadConversation(conv)}
                  style={{ padding: "10px 12px", borderRadius: 8, cursor: editingId === conv.id ? "default" : "pointer", background: conv.id === convIdRef.current ? "rgba(0,240,255,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${conv.id === convIdRef.current ? "rgba(0,240,255,0.2)" : "rgba(255,255,255,0.06)"}`, marginBottom: 6 }}
                >
                  {/* Title row */}
                  {editingId === conv.id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(conv.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      onBlur={() => commitRename(conv.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: "100%", fontSize: 13, color: "#d4dae5", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 4, padding: "2px 6px", outline: "none", fontFamily: "var(--font-body)" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 13, color: "#d4dae5", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {conv.title}
                      </span>
                      {/* Action buttons — always visible on mobile */}
                      <button
                        onClick={(e) => startRename(e, conv)}
                        style={{ color: "#545e71", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                        title="Renommer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => deleteConversation(e, conv.id)}
                        style={{ color: "#545e71", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                        title="Supprimer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  )}
                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    {conv.matchCtx && (
                      <span style={{ fontSize: 10, color: "#00D4FF", background: "rgba(0,212,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>
                        {conv.matchCtx.competition}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: "#545e71", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.05em" }}>
                      {new Date(conv.ts).toLocaleDateString(lang === "EN" ? "en-US" : "fr-FR", { day: "2-digit", month: "short" })} · {new Date(conv.ts).toLocaleTimeString(lang === "EN" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {extra.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="gpt-msg-user"><div className="gpt-user-bubble">{m.body}</div></div>
              ) : m.role === "system" ? (
                <div key={i} className="gpt-msg-system">{m.body}</div>
              ) : (
                <div key={i} className="gpt-msg-assistant">
                  <AgentFace id={m.agentId ?? "Oracle"} size={34} />
                  <div className="gpt-msg-text">{m.body}</div>
                </div>
              )
            )}
            {typingGreeting && (
              <div className="gpt-msg-assistant">
                <AgentFace id={typingGreeting.agentId} size={34} />
                <div className="gpt-msg-text">{typingGreeting.typed}<span className="tw-caret" /></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div className="gpt-input-area" style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Match context banner */}
        {matchCtx && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px 5px 12px",
            background: "rgba(0,212,255,0.07)",
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: 10, marginBottom: 8,
          }}>
            <span style={{ fontSize: 13 }}>⚽</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#a8c8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {matchCtx.homeTeam} vs {matchCtx.awayTeam}
            </span>
            <span style={{ fontSize: 10, color: "#00D4FF", flexShrink: 0 }}>
              {matchCtx.status === "live" ? "🔴 LIVE" : matchCtx.time}
            </span>
            <span style={{ fontSize: 10, color: "#546070", flexShrink: 0, marginLeft: 4 }}>
              {matchCtx.competition}
            </span>
            <button
              onClick={() => setMatchCtx(null)}
              style={{ color: "#546070", fontSize: 16, lineHeight: 1, marginLeft: 4, background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}
              aria-label="Retirer le match"
            >×</button>
          </div>
        )}
        <div className="gpt-input-box">
          <textarea ref={taRef} rows={1} value={draft} onChange={handleInput}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder={placeholder}
          />
          <button className="gpt-send-btn" onClick={submit} disabled={!draft.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const [intro, setIntro] = useState(() => !introShownThisSession())
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null)
  const [pendingAgent, setPendingAgent] = useState<string | null>(null)

  // Safety net: if SSR gave intro=true but client knows it was already shown, hide immediately
  useEffect(() => {
    if (intro && introShownThisSession()) setIntro(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Read match pushed by Matchs page or Rapport page
    const raw = sessionStorage.getItem("pending_match")
    if (raw) {
      try { setPendingMatch(JSON.parse(raw) as PendingMatch) } catch { /* ignore */ }
      sessionStorage.removeItem("pending_match")
    }
    // Read agent pre-selection pushed by Rapport page
    const agent = sessionStorage.getItem("pending_agent")
    if (agent) {
      setPendingAgent(agent)
      sessionStorage.removeItem("pending_agent")
    }
  }, [])

  const handleIntroDone = () => {
    _introShownInMemory = true
    sessionStorage.setItem(INTRO_KEY, "1")
    setIntro(false)
  }

  const username =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    "Player"

  return (
    <>
      <div
        id="tactical-hud"
        style={{ position: "fixed", inset: 0, background: "#030509", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {intro && <IntroSplash onDone={handleIntroDone} />}
        <div aria-hidden style={{ height: "var(--header-h)", flexShrink: 0 }} />
        <OracleConsole
          username={username}
          ready={!intro}
          pendingMatch={pendingMatch}
          pendingAgent={pendingAgent}
          onMatchConsumed={() => { setPendingMatch(null); setPendingAgent(null) }}
        />
      </div>
    </>
  )
}
