"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { Header } from "~/components/shared/Header"

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
const agentGrad = (h: number) =>
  `radial-gradient(circle at 30% 25%, oklch(0.85 0.18 ${h}), oklch(0.58 0.22 ${h}) 55%, oklch(0.30 0.15 ${h}) 100%)`

// ── Pitch background ─────────────────────────────────────────
const DOT_PLAYERS = [
  { top: 42, left: 30, dx: 18, dy: -12 },
  { top: 48, left: 58, dx: -14, dy: 10 },
  { top: 62, left: 22, dx: 20, dy: -8 },
  { top: 58, left: 78, dx: -22, dy: 14 },
  { top: 78, left: 42, dx: -12, dy: -18 },
  { top: 72, left: 64, dx: 16, dy: -6 },
  { top: 35, left: 45, dx: 10, dy: 14 },
  { top: 40, left: 72, dx: -10, dy: -10 },
]

function PitchStage() {
  return (
    <div className="pitch-stage">
      <div className="pitch-plane" />
      {DOT_PLAYERS.map((d, i) => (
        <div
          key={i}
          className="dot-player"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            ["--dx" as string]: `${d.dx}px`,
            ["--dy" as string]: `${d.dy}px`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${6 + (i % 3)}s`,
          }}
        />
      ))}
      <div className="pitch-scanline" />
      <div className="pitch-glow-bottom" />
    </div>
  )
}

// ── Intro splash typewriter ──────────────────────────────────
interface IntroSplashProps { onDone: () => void }

function IntroSplash({ onDone }: IntroSplashProps) {
  const [step, setStep] = useState(0)
  const [t1, setT1] = useState("")
  const [t2, setT2] = useState("")
  const [t3, setT3] = useState("")
  const [fade, setFade] = useState(false)

  const type = useCallback(
    (text: string, set: (v: string) => void, speed: number, cb: () => void) => {
      let i = 0
      const id = setInterval(() => {
        i++
        set(text.slice(0, i))
        if (i >= text.length) { clearInterval(id); setTimeout(cb, 380) }
      }, speed)
      return () => clearInterval(id)
    },
    []
  )

  useEffect(() => {
    if (step === 0) return type("READ THE", setT1, 55, () => setStep(1))
    if (step === 1) return type("GAME.", setT2, 65, () => setStep(2))
    if (step === 2) return type("DECODE IT.", setT3, 50, () => setStep(3))
    if (step === 3) {
      const ta = setTimeout(() => setFade(true), 500)
      const tb = setTimeout(onDone, 1100)
      return () => { clearTimeout(ta); clearTimeout(tb) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <div className={`intro-splash${fade ? " fade-out" : ""}`}>
      <h1 className="intro-mega">
        <div><span className="fill">{t1}</span>{step === 0 && <span className="intro-caret" />}</div>
        <div><span className="accent">{t2}</span>{step === 1 && <span className="intro-caret" />}</div>
        <div><span className="outline">{t3}</span>{step === 2 && <span className="intro-caret" />}</div>
      </h1>
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

// ── Chat persistence helpers ──────────────────────────────────
interface ExtraMsg { role: "user" | "oracle" | "system"; body: string; agentId?: "Oracle" | AgentId }
interface Conversation { id: string; title: string; agentId: "Oracle" | AgentId; messages: ExtraMsg[]; ts: number }
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
function OracleConsole({ username, ready }: { username: string; ready: boolean }) {
  const [draft, setDraft] = useState("")
  const [extra, setExtra] = useState<ExtraMsg[]>([])
  const [agent, setAgent] = useState<"Oracle" | AgentId>("Oracle")
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [typingGreeting, setTypingGreeting] = useState<TypingGreeting | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [lang, setLang] = useState<"FR" | "EN">("FR")
  const convIdRef = useRef<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const restoredRef = useRef(false)

  // Load lang + conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("betanalytic_lang")
    if (stored === "FR" || stored === "EN") setLang(stored)

    const convs = loadConvs()
    setConversations(convs)

    // Restore last conversation so chat is persistent across tab switches
    if (convs.length > 0 && convs[0]) {
      const last = convs[0]
      convIdRef.current = last.id
      setExtra(last.messages)
      setAgent(last.agentId)
      restoredRef.current = true
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "betanalytic_lang" && (e.newValue === "FR" || e.newValue === "EN")) setLang(e.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
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
    const title = extra.find((m) => m.role === "user")?.body.slice(0, 45) ?? (lang === "EN" ? "Conversation" : "Conversation")
    const conv: Conversation = { id, title, agentId: agent, messages: extra, ts: Date.now() }
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
  const agentBg = cur ? agentGrad(cur.hue) : "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))"
  const avatarBg = (id?: "Oracle" | AgentId) =>
    !id || id === "Oracle" ? "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))" : agentGrad(BY_ID[id as AgentId]?.hue ?? 200)

  const pickAgent = (id: "Oracle" | AgentId) => {
    // Agent already active — do nothing, don't reset interface
    if (id === agent) { setOpen(false); return }

    const label = id === "Oracle" ? "Oracle" : `@${id}`
    const alreadySeen = extra.some((m) => m.agentId === id)

    setAgent(id)
    setOpen(false)

    if (alreadySeen) {
      // Agent was already introduced — just mark as active, no re-greeting
      setExtra((e) => [...e, { role: "system", body: `— ${label} ${lang === "EN" ? "active" : "actif"} —` }])
      setTypingGreeting(null)
    } else {
      // First time this agent appears — add separator if mid-conversation then full greeting
      if (extra.length > 0 || typingGreeting) {
        setExtra((e) => [...e, { role: "system", body: `─── ${label} ${lang === "EN" ? "activated" : "activé"} ───` }])
      }
      setTypingGreeting({ text: agentGreeting(id, username, lang), typed: "", agentId: id })
    }
  }

  const submit = () => {
    if (!draft.trim()) return
    const body = draft.trim()
    setExtra((e) => [...e, { role: "user", body }])
    setDraft("")
    if (taRef.current) taRef.current.style.height = "auto"
    setTimeout(() => {
      setExtra((e) => [...e, {
        role: "oracle",
        body: isOracle
          ? (lang === "EN" ? "Analyzing via @GoalMaster + @TacticMaster…" : "Analyse en cours via @GoalMaster + @TacticMaster…")
          : (lang === "EN" ? `@${agent} processing your query — conf 78%` : `@${agent} traite ta requête — conf 78%`),
        agentId: agent,
      }])
    }, 600)
  }

  const loadConversation = (conv: Conversation) => {
    convIdRef.current = conv.id
    setExtra(conv.messages)
    setAgent(conv.agentId)
    setShowHistory(false)
    setTypingGreeting(null)
  }

  const clearChat = () => {
    convIdRef.current = null
    setExtra([])
    setAgent("Oracle")
    setShowHistory(false)
    setTypingGreeting({ text: agentGreeting("Oracle", username, lang), typed: "", agentId: "Oracle" })
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }

  const ddHeader = lang === "EN" ? "CHOOSE AN AGENT" : "CHOISIR UN AGENT"
  const placeholder = lang === "EN" ? "Type your message here…" : "Tape ton message ici…"
  const historyTitle = lang === "EN" ? "Conversation History" : "Historique des conversations"
  const historyEmpty = lang === "EN" ? "No recent conversations." : "Aucune conversation récente."

  return (
    <div className="console">
      <div className="console-corner tl" /><div className="console-corner tr" />
      <div className="console-corner bl" /><div className="console-corner br" />

      {/* ── Header ── */}
      <div className="gpt-header">
        {/* Left: selector + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <button className="gpt-model-btn" onClick={() => { setOpen((o) => !o); setShowHistory(false) }} aria-label={open ? (lang === "EN" ? "Close agent selector" : "Fermer la sélection d'agent") : (lang === "EN" ? "Open agent selector" : "Ouvrir la sélection d'agent")} aria-expanded={open}>
            <div className="gpt-model-icon" style={{ background: agentBg }} />
            <span className="gpt-model-name">{isOracle ? "Oracle" : cur!.id}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ color: "#6b7280", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <span style={{ fontSize: 9, color: "#444e5e", fontFamily: "var(--font-jetbrains-mono,monospace)", letterSpacing: "0.04em", paddingLeft: 2 }}>
            {lang === "EN" ? "14 agents ready to analyze" : "14 agents prêts à analyser"}
          </span>
        </div>

        {/* Dropdown — child of gpt-header (position:relative) so left:0/right:0 spans full width */}
        {open && (
          <div className="agent-dd" style={{ left: 0, right: 0 }}>
            <div className="agent-dd-h">{ddHeader}</div>
            <div className={`agent-opt${isOracle ? " sel" : ""}`} onClick={() => pickAgent("Oracle")}>
              <div className="ao-pip" style={{ background: "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))" }}>OR</div>
              <div className="ao-info">
                <div className="ao-name">Oracle</div>
                <div className="ao-cat">{lang === "EN" ? "Generalist · auto-routing" : "Généraliste · routage auto"}</div>
              </div>
            </div>
            {AGENTS.map((a) => (
              <div key={a.id} className={`agent-opt${agent === a.id ? " sel" : ""}`} onClick={() => pickAgent(a.id)}>
                <div className="ao-pip" style={{ background: agentGrad(a.hue) }}>{a.glyph}</div>
                <div className="ao-info"><div className="ao-name">@{a.id}</div><div className="ao-cat">{a.cat}</div></div>
                <div className="ao-role">{a.role}</div>
              </div>
            ))}
            <div style={{ padding: "8px 14px 6px", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, color: "#545e71", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
              {lang === "EN" ? "14 agents ready to analyze the match for you" : "14 agents prêts à analyser le match pour vous"}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button className={`gpt-icon-btn${showHistory ? " active" : ""}`} onClick={() => { setShowHistory((h) => !h); setOpen(false) }} title={historyTitle} aria-label={historyTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
          </svg>
        </button>
        <button className="gpt-icon-btn" onClick={clearChat} title={lang === "EN" ? "New conversation" : "Nouvelle conversation"} aria-label={lang === "EN" ? "New conversation" : "Nouvelle conversation"}>
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
                  onClick={() => loadConversation(conv)}
                  style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", background: conv.id === convIdRef.current ? "rgba(0,240,255,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${conv.id === convIdRef.current ? "rgba(0,240,255,0.2)" : "rgba(255,255,255,0.06)"}`, marginBottom: 6 }}
                >
                  <div style={{ fontSize: 13, color: "#d4dae5", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.title}</div>
                  <div style={{ fontSize: 10, color: "#545e71", fontFamily: "var(--font-jetbrains-mono, monospace)", letterSpacing: "0.05em", marginTop: 3 }}>
                    {new Date(conv.ts).toLocaleDateString(lang === "EN" ? "en-US" : "fr-FR", { day: "2-digit", month: "short" })} · {new Date(conv.ts).toLocaleTimeString(lang === "EN" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
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
                  <div className="gpt-avatar-sm" style={{ background: avatarBg(m.agentId) }} />
                  <div className="gpt-msg-text">{m.body}</div>
                </div>
              )
            )}
            {typingGreeting && (
              <div className="gpt-msg-assistant">
                <div className="gpt-avatar-sm" style={{ background: avatarBg(typingGreeting.agentId) }} />
                <div className="gpt-msg-text">{typingGreeting.typed}<span className="tw-caret" /></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input ── */}
      <div className="gpt-input-area" style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
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
  // Intro plays only once per browser session
  const [intro, setIntro] = useState(true)
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("betanalytic_intro_done")) {
      setIntro(false)
    }
  }, [])

  const handleIntroDone = () => {
    sessionStorage.setItem("betanalytic_intro_done", "1")
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
        <Header />
        <OracleConsole username={username} ready={!intro} />
      </div>
      <DashboardNav />
    </>
  )
}
