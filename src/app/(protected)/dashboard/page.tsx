"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"

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

// ── Top HUD ──────────────────────────────────────────────────
interface TopHudProps {
  username: string
  couponCount: number
  lang: "FR" | "EN"
  onToggleLang: () => void
  notifCount?: number
}

function TopHud({ username, couponCount, lang, onToggleLang, notifCount = 0 }: TopHudProps) {
  const router = useRouter()
  const initials = username.slice(0, 1).toUpperCase()

  return (
    <div className="top-hud">
      <div className="brand" style={{ flex: 1, minWidth: 0 }}>
        <div className="brand-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Bet<em>Analytic</em></div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        {/* Search */}
        <button
          onClick={() => router.push("/matches")}
          style={{ background: "none", border: "none", padding: "7px", cursor: "pointer", color: "#a0aaba", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34, minHeight: 34 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        {/* Coupon badge */}
        <button
          onClick={() => router.push("/analysis")}
          style={{ background: "none", border: "none", padding: "7px", cursor: "pointer", color: "#a0aaba", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minWidth: 34, minHeight: 34 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {couponCount > 0 && (
            <span style={{ position: "absolute", top: 3, right: 3, background: "#00f0ff", color: "#030509", borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
              {couponCount > 9 ? "9+" : couponCount}
            </span>
          )}
        </button>

        {/* Lang toggle FR/EN */}
        <button
          onClick={onToggleLang}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "3px 6px", cursor: "pointer", color: "#00f0ff", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {lang}
        </button>

        {/* Bell / notifications */}
        <button
          style={{ background: "none", border: "none", padding: "7px", cursor: "pointer", color: "#a0aaba", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minWidth: 34, minHeight: 34 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {notifCount > 0 && (
            <span style={{ position: "absolute", top: 3, right: 3, background: "oklch(0.66 0.26 22)", borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div
          style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-archivo, sans-serif)", fontWeight: 700, fontSize: 12, color: "#030509", cursor: "pointer", flexShrink: 0, marginLeft: 2 }}
          onClick={() => router.push("/profile")}
        >
          {initials}
        </div>
      </div>
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
function agentGreeting(id: "Oracle" | AgentId, username: string): string {
  if (id === "Oracle") {
    return `Salut ${username} ! Je suis Oracle, ton assistant analytique IA. Je coordonne les 14 agents spécialisés pour t'offrir une analyse complète de chaque match. Pose ta question ou sélectionne un expert.`
  }
  const a = BY_ID[id as AgentId]!
  const descs: Partial<Record<AgentId, string>> = {
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
  return `Salut ${username} ! Je suis @${id}, spécialiste en ${a.cat}. Je vais t'aider dans ton analyse en ${descs[id as AgentId] ?? `couvrant ${a.cat}`}. Quelle est ta question ?`
}

// ── Oracle console (ChatGPT-style) ───────────────────────────
interface ExtraMsg { role: "user" | "oracle" | "system"; body: string; agentId?: "Oracle" | AgentId }
type TypingGreeting = { text: string; typed: string; agentId: "Oracle" | AgentId }

function OracleConsole({ username }: { username: string }) {
  const [draft, setDraft] = useState("")
  const [extra, setExtra] = useState<ExtraMsg[]>([])
  const [agent, setAgent] = useState<"Oracle" | AgentId>("Oracle")
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [typingGreeting, setTypingGreeting] = useState<TypingGreeting | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Start Oracle greeting on mount
  useEffect(() => {
    const text = agentGreeting("Oracle", username)
    setTypingGreeting({ text, typed: "", agentId: "Oracle" })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!typingGreeting || typingGreeting.typed.length >= typingGreeting.text.length) return
    const t = setTimeout(() => {
      setTypingGreeting((prev) => prev ? { ...prev, typed: prev.text.slice(0, prev.typed.length + 1) } : null)
    }, 16)
    return () => clearTimeout(t)
  }, [typingGreeting])

  // Move completed greeting to extra
  useEffect(() => {
    if (!typingGreeting || typingGreeting.typed.length < typingGreeting.text.length) return
    const t = setTimeout(() => {
      setExtra((e) => [...e, { role: "oracle", body: typingGreeting.text, agentId: typingGreeting.agentId }])
      setTypingGreeting(null)
    }, 300)
    return () => clearTimeout(t)
  }, [typingGreeting])

  const isOracle = agent === "Oracle"
  const cur = isOracle ? null : BY_ID[agent as AgentId]
  const agentBg = cur ? agentGrad(cur.hue) : "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))"

  const msgAvatarBg = (agentId?: "Oracle" | AgentId) =>
    !agentId || agentId === "Oracle"
      ? "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))"
      : agentGrad(BY_ID[agentId as AgentId]?.hue ?? 200)

  const pickAgent = (id: "Oracle" | AgentId) => {
    const wasInConversation = extra.length > 0 || !!typingGreeting
    setAgent(id)
    setOpen(false)
    if (wasInConversation) {
      const label = id === "Oracle" ? "Oracle" : `@${id}`
      setExtra((e) => [...e, { role: "system", body: `─── ${label} activé ───` }])
    }
    setTypingGreeting({ text: agentGreeting(id, username), typed: "", agentId: id })
  }

  const submit = () => {
    if (!draft.trim()) return
    setExtra((e) => [...e, { role: "user", body: draft }])
    setDraft("")
    if (taRef.current) { taRef.current.style.height = "auto" }
    setTimeout(() => {
      setExtra((e) => [...e, {
        role: "oracle",
        body: isOracle
          ? "Analyse en cours via @GoalMaster + @TacticMaster…"
          : `@${agent} traite ta requête — conf 78%`,
        agentId: agent,
      }])
    }, 600)
  }

  const clearChat = () => {
    setExtra([])
    setAgent("Oracle")
    setShowHistory(false)
    setTypingGreeting({ text: agentGreeting("Oracle", username), typed: "", agentId: "Oracle" })
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [extra, typingGreeting])

  return (
    <div className="console">
      <div className="console-corner tl" /><div className="console-corner tr" />
      <div className="console-corner bl" /><div className="console-corner br" />

      {/* ── Header — ChatGPT model-selector style ── */}
      <div className="gpt-header">
        <button className="gpt-model-btn" onClick={() => { setOpen((o) => !o); setShowHistory(false) }}>
          <div className="gpt-model-icon" style={{ background: agentBg }} />
          <span className="gpt-model-name">{isOracle ? "Oracle" : cur!.id}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ color: "#6b7280", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="agent-dd" style={{ left: 0, right: 0 }}>
            <div className="agent-dd-h">CHOISIR UN AGENT</div>
            <div className={`agent-opt${isOracle ? " sel" : ""}`} onClick={() => pickAgent("Oracle")}>
              <div className="ao-pip" style={{ background: "linear-gradient(135deg,#00f0ff,oklch(0.68 0.28 330))" }}>OR</div>
              <div className="ao-info"><div className="ao-name">Oracle</div><div className="ao-cat">Généraliste · routage auto</div></div>
            </div>
            {AGENTS.map((a) => (
              <div key={a.id} className={`agent-opt${agent === a.id ? " sel" : ""}`} onClick={() => pickAgent(a.id)}>
                <div className="ao-pip" style={{ background: agentGrad(a.hue) }}>{a.glyph}</div>
                <div className="ao-info"><div className="ao-name">@{a.id}</div><div className="ao-cat">{a.cat}</div></div>
                <div className="ao-role">{a.role}</div>
              </div>
            ))}
            <div style={{ padding: "8px 14px 6px", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a4455", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4 }}>
              14 AGENTS SPÉCIALISÉS · ORACLE ROUTAGE AUTO
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* History icon */}
        <button
          className={`gpt-icon-btn${showHistory ? " active" : ""}`}
          onClick={() => { setShowHistory((h) => !h); setOpen(false) }}
          title="Historique"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
          </svg>
        </button>

        {/* New chat icon */}
        <button className="gpt-icon-btn" onClick={clearChat} title="Nouvelle conversation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="gpt-messages" ref={bodyRef}>
        {showHistory ? (
          <>
            <div className="gpt-history-title">Historique des conversations</div>
            <div className="gpt-history-empty">Aucune conversation récente.</div>
          </>
        ) : (
          <>
            {/* Conversation history */}
            {extra.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="gpt-msg-user">
                  <div className="gpt-user-bubble">{m.body}</div>
                </div>
              ) : m.role === "system" ? (
                <div key={i} className="gpt-msg-system">{m.body}</div>
              ) : (
                <div key={i} className="gpt-msg-assistant">
                  <div className="gpt-avatar-sm" style={{ background: msgAvatarBg(m.agentId) }} />
                  <div className="gpt-msg-text">{m.body}</div>
                </div>
              )
            )}
            {/* Active typewriter greeting */}
            {typingGreeting && (
              <div className="gpt-msg-assistant">
                <div className="gpt-avatar-sm" style={{ background: msgAvatarBg(typingGreeting.agentId) }} />
                <div className="gpt-msg-text">{typingGreeting.typed}<span className="tw-caret" /></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ChatGPT-style input ── */}
      <div className="gpt-input-area" style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="gpt-input-box">
          <textarea
            ref={taRef}
            rows={1}
            value={draft}
            onChange={handleInput}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Tape ton message ici…"
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
  const [intro, setIntro] = useState(true)
  const [lang, setLang] = useState<"FR" | "EN">("FR")
  const couponCount = useCouponStore((state) => state.count())

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
        {intro && <IntroSplash onDone={() => setIntro(false)} />}
        <TopHud
          username={username}
          couponCount={couponCount}
          lang={lang}
          onToggleLang={() => setLang((l) => (l === "FR" ? "EN" : "FR"))}
        />
        <OracleConsole username={username} />
      </div>
      <DashboardNav />
    </>
  )
}
