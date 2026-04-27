"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { api } from "~/trpc/react"

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
function TopHud() {
  return (
    <div className="top-hud">
      <div className="brand">
        <div className="brand-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2v20M6 5l12 14M18 5L6 19" />
          </svg>
        </div>
        <div className="brand-name">Bet<em>Analytic</em></div>
      </div>
      <div className="hud-pill">
        <span className="live-dot" />
        LIVE · 14 AGENTS
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
    if (step === 0) return type("READ THE", setT1, 70, () => setStep(1))
    if (step === 1) return type("GAME.", setT2, 90, () => setStep(2))
    if (step === 2) return type("DECODE IT.", setT3, 65, () => setStep(3))
    if (step === 3) {
      const ta = setTimeout(() => setFade(true), 700)
      const tb = setTimeout(onDone, 1400)
      return () => { clearTimeout(ta); clearTimeout(tb) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <div className={`intro-splash${fade ? " fade-out" : ""}`}>
      <div className="intro-tag">
        <span className="sq" />
        BRIEFING DU SOIR
        <span className="sep">·</span>
        <span className="num">N°047</span>
      </div>
      <h1 className="intro-mega">
        <div><span className="fill">{t1}</span>{step === 0 && <span className="intro-caret" />}</div>
        <div><span className="accent">{t2}</span>{step === 1 && <span className="intro-caret" />}</div>
        <div><span className="outline">{t3}</span>{step === 2 && <span className="intro-caret" />}</div>
      </h1>
      {step >= 3 && <div className="intro-load">&gt; Initialisation Oracle...</div>}
    </div>
  )
}

// ── Oracle console typewriter ────────────────────────────────
function useTypewriter(username: string) {
  const lines = [
    { cls: "l0", text: "Briefing activé." },
    { cls: "l1", text: `Salut ${username}. Ici Oracle — interface 14 spécialistes.` },
    { cls: "l2", text: "Ce soir : Clasico. 847 data points. 4 agents à l'œuvre." },
    { cls: "l3", text: "Pose ta question. Je route vers le bon agent en <100ms." },
  ]
  const [lineIdx, setLineIdx] = useState(0)
  const [typed, setTyped] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (lineIdx >= lines.length) { setDone(true); return }
    let i = 0
    setTyped("")
    const line = lines[lineIdx]!.text
    const speed = lines[lineIdx]!.cls === "l0" ? 42 : 16
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i++
        setTyped(line.slice(0, i))
        if (i >= line.length) { clearInterval(t); setTimeout(() => setLineIdx((x) => x + 1), 420) }
      }, speed)
      return () => clearInterval(t)
    }, lineIdx === 0 ? 500 : 100)
    return () => clearTimeout(start)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx])

  return { lineIdx, typed, done, lines }
}

// ── Oracle console ───────────────────────────────────────────
interface ExtraMsg { role: "user" | "oracle" | "system"; body: string }

function OracleConsole({ username }: { username: string }) {
  const { lineIdx, typed, lines } = useTypewriter(username)
  const [draft, setDraft] = useState("")
  const [extra, setExtra] = useState<ExtraMsg[]>([])
  const [agent, setAgent] = useState<"Oracle" | AgentId>("Oracle")
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const isOracle = agent === "Oracle"
  const cur = isOracle ? null : BY_ID[agent as AgentId]

  const pickAgent = (id: "Oracle" | AgentId) => {
    setAgent(id)
    setOpen(false)
    if (id !== "Oracle") {
      const a = BY_ID[id as AgentId]!
      setExtra((e) => [...e, { role: "system", body: `↳ Connecté à @${id} · spécialiste ${a.cat}.` }])
    }
  }

  const submit = () => {
    if (!draft.trim()) return
    setExtra((e) => [...e, { role: "user", body: draft }])
    setDraft("")
    setTimeout(() => {
      setExtra((e) => [...e, {
        role: "oracle",
        body: isOracle
          ? "↳ Routage: @GoalMaster + @TacticMaster. Analyse en cours…"
          : `↳ @${agent} traite ta requête… conf 78%`,
      }])
    }, 600)
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [extra, typed, lineIdx])

  const chips = [
    { a: "@CornerKing", t: "CORNERS CLASICO" },
    { a: "@GoalMaster", t: "OVER 2.5" },
    { a: "@Insider", t: "COMPOS" },
    { a: "@DebateArena", t: "DÉBAT LIVE" },
  ]

  return (
    <div className="console">
      <div className="console-corner tl" /><div className="console-corner tr" />
      <div className="console-corner bl" /><div className="console-corner br" />

      <div className="console-head">
        <div style={{ position: "relative" }}>
          <div className="oracle-ring" />
          <div className="oracle" style={cur ? { background: agentGrad(cur.hue) } : undefined} />
        </div>
        <div className="console-title">
          <div className="name" onClick={() => setOpen((o) => !o)}>
            {isOracle ? "Oracle" : cur!.id}
            <span className="tag">{isOracle ? "GÉNÉRALISTE" : cur!.role}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="3"
              style={{ marginLeft: 4, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="meta">
            <span className="online-dot" />
            <span>{isOracle ? "14 agents · 847 data points" : cur!.cat}</span>
          </div>
          {open && (
            <div className="agent-dd">
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
            </div>
          )}
        </div>
        <div className="hud-pill" style={{ marginLeft: 0 }}>
          <span className="live-dot" style={{ background: "#00f0ff", boxShadow: "0 0 8px #00f0ff" }} />
          SYNC
        </div>
      </div>

      <div className="console-body" ref={bodyRef}>
        {!isOracle && <div className="tw-line l0" style={{ marginBottom: 8 }}>@{agent}.</div>}
        {isOracle && lines.slice(0, lineIdx).map((l, i) => (
          <div key={i} className={`tw-line ${l.cls}`}>
            {l.cls === "l1" ? <>Salut <b>{username}</b>. Ici <b>Oracle</b> — interface 14 spécialistes.</> : l.text}
          </div>
        ))}
        {isOracle && lineIdx < lines.length && (
          <div className={`tw-line ${lines[lineIdx]!.cls}`}>{typed}<span className="tw-caret" /></div>
        )}
        {extra.map((m, i) => (
          <div key={`x-${i}`} className={`tw-line ${m.role === "user" ? "user-msg" : "sys"}`}
            style={{ animation: "hudLineIn .3s both" }}>
            {m.role === "user" ? <><span className="prompt">&gt;</span>{m.body}</> : m.body}
          </div>
        ))}
      </div>

      <div className="console-metrics">
        <div className="metric"><div className="lbl">AGENTS ACTIFS</div><div className="val cyan">14<span style={{ fontSize: 12, color: "#545e71", fontWeight: 500 }}>/14</span></div></div>
        <div className="metric"><div className="lbl">DATA POINTS</div><div className="val">847K</div></div>
        <div className="metric"><div className="lbl">PRÉCISION J-30</div><div className="val pitch">72%</div></div>
      </div>

      <div className="console-chips">
        {chips.map((c, i) => (
          <div key={i} className="chip" onClick={() => setDraft(`${c.a} ${c.t.toLowerCase()}`)}>
            <span className="at">{c.a}</span>{c.t}
          </div>
        ))}
      </div>

      <div className="console-input">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="input_query // @mention agent"
        />
        <button className="send" onClick={submit}>
          EXEC
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  )
}

// ── WC26 countdown ───────────────────────────────────────────
function WCBanner() {
  const TARGET = new Date("2026-06-11T18:00:00Z").getTime()
  const [now, setNow] = useState(0)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const d = now > 0 ? Math.max(0, TARGET - now) : TARGET - Date.UTC(2026, 3, 27)
  const pad = (n: number) => String(Math.floor(n)).padStart(2, "0")
  return (
    <div className="wc-banner">
      <div className="flags">🇺🇸🇨🇦🇲🇽</div>
      <div className="ctr"><div className="t1">COUPE DU MONDE</div><div className="t2">KICK-OFF 2026</div></div>
      <div className="cd" suppressHydrationWarning>
        <div suppressHydrationWarning>{pad(d / 86400000)}<span>J</span></div>
        <div suppressHydrationWarning>{pad((d % 86400000) / 3600000)}<span>H</span></div>
        <div suppressHydrationWarning>{pad((d % 3600000) / 60000)}<span>M</span></div>
        <div suppressHydrationWarning style={{ color: "#00f0ff" }}>{pad((d % 60000) / 1000)}<span>S</span></div>
      </div>
    </div>
  )
}

// ── Ticker ───────────────────────────────────────────────────
function Ticker() {
  const items = [
    "[CLASICO] CornerKing projette 11.5 · conf 78%",
    "[MAN CITY vs ARS] TacticMaster: pressing haut attendu",
    "[SERIE A] +12% liquidité Inter-Milan",
    "[WC26] France · Group C · kick-off T-53d",
    "[BAYERN-BVB] GoalMaster: Over 2.5 · conf 82%",
    "[CL] DebateArena en cours: Tactique vs Forme",
  ]
  const track = [...items, ...items]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {track.map((t, i) => (
          <span key={i} className="it">
            <span className="n">●</span>
            <b>{t.split("]")[0]}]</b>
            {t.split("]")[1]}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Quick access (original functionality kept) ───────────────
function QuickAccess() {
  const router = useRouter()
  const items = [
    { path: "/paris", icon: "🎰", label: "Paris Virtuels", sub: "Parier sur les matchs" },
    { path: "/coupons", icon: "🎫", label: "Mes Coupons", sub: "Historique des paris" },
    { path: "/salles", icon: "💬", label: "Salles", sub: "Communauté" },
    { path: "/analysis", icon: "⚡", label: "Analyse IA", sub: "Agents & prédictions" },
  ]
  return (
    <div className="bar-section">
      <div className="bar-head">
        <span className="num">[00]</span>
        <span className="title">ACCÈS RAPIDE</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              background: "rgba(10,15,26,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              padding: "14px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "var(--font-archivo, sans-serif)", fontWeight: 700, fontSize: 13, color: "#f2f5fa", letterSpacing: "-0.01em" }}>{item.label}</div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9, color: "#545e71", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{item.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Live matches section (original data + new style) ─────────
interface MatchCardHudProps {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  status: "live" | "upcoming" | "finished"
  homeScore?: number
  awayScore?: number
}

function MatchCardHud({ homeTeam, awayTeam, league, time, status, homeScore, awayScore }: MatchCardHudProps) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push("/matches")}
      className="match-tile"
      style={{ cursor: "pointer", marginBottom: 8 }}
    >
      <div className="match-meta-row">
        <span className="comp">◆ {league.toUpperCase()}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {status === "live" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.66 0.26 22)", boxShadow: "0 0 8px oklch(0.66 0.26 22)", display: "inline-block" }} />}
          {status === "live" ? "LIVE" : time}
        </span>
      </div>
      <div className="teams-row">
        <div className="team-col">
          <div className="team-name">{homeTeam}</div>
          {homeScore !== undefined && <div style={{ fontFamily: "var(--font-archivo, sans-serif)", fontWeight: 900, fontSize: 28, color: "#f2f5fa" }}>{homeScore}</div>}
        </div>
        <div className="vs-col">
          <div className="vs-big">VS</div>
          <div className="vs-time">{status === "live" ? "LIVE ↓" : status === "finished" ? "FT" : "À VENIR"}</div>
        </div>
        <div className="team-col">
          <div className="team-name">{awayTeam}</div>
          {awayScore !== undefined && <div style={{ fontFamily: "var(--font-archivo, sans-serif)", fontWeight: 900, fontSize: 28, color: "#f2f5fa" }}>{awayScore}</div>}
        </div>
      </div>
    </div>
  )
}

// ── Rooms section (original data + new style) ────────────────
function RoomsSection({ rooms }: { rooms: Array<{ id: string; name: string; type: string; _count: { members: number } }> }) {
  const router = useRouter()
  return (
    <div className="bar-section">
      <div className="bar-head">
        <span className="num">[03]</span>
        <span className="title">SALLES ACTIVES</span>
        <button className="link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => router.push("/salles")}>
          EXPLORER →
        </button>
      </div>
      {rooms.slice(0, 3).map((room) => (
        <div
          key={room.id}
          className="room-tile"
          style={{ ["--room-c" as string]: room.type === "OFFICIAL" ? "#00f0ff" : "oklch(0.82 0.19 78)" }}
          onClick={() => router.push(`/salles/${room.id}`)}
        >
          <div className="rt-main">
            <div className="rt-name">{room.name}</div>
            <div className="rt-meta">
              <span>{room._count.members} MEMBRES</span>
            </div>
            <div className={`badge ${room.type === "OFFICIAL" ? "ana" : "sup"}`}>
              {room.type === "OFFICIAL" ? "◆ ANALYTIQUE" : "⚽ SUPPORTER"}
            </div>
          </div>
        </div>
      ))}
      {rooms.length === 0 && (
        <div style={{ padding: "16px", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "#545e71", textAlign: "center", letterSpacing: "0.1em" }}>
          AUCUNE SALLE ACTIVE
        </div>
      )}
    </div>
  )
}

// ── Demo card ────────────────────────────────────────────────
function DemoCard() {
  const router = useRouter()
  return (
    <div className="bar-section">
      <div className="bar-head">
        <span className="num">[01]</span>
        <span className="title">PAPER TRADING · DEMO</span>
        <button className="link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => router.push("/paris")}>
          LANCER →
        </button>
      </div>
      <div className="demo-card" onClick={() => router.push("/paris")}>
        <div className="demo-bg">DEMO</div>
        <div className="demo-pill"><span className="dot" />ARGENT FICTIF · 0 RISQUE</div>
        <div className="demo-title">APPRENDS À PARIER<br /><span className="grad">SANS PERDRE UN EURO.</span></div>
        <div className="demo-sub">10 000 € fictifs · les 14 agents te coachent en temps réel · stats détaillées de ta progression.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="demo-cta">OUVRIR LE LAB →</div>
          <div style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 9.5, letterSpacing: "0.14em", color: "#545e71", textTransform: "uppercase" }}>2 847 traders en cours</div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const [intro, setIntro] = useState(true)

  // ── Original tRPC data calls preserved ──────────────────────
  const { data: matches, isLoading: matchesLoading } = api.match.getTodaysMatches.useQuery()
  const { data: rooms } = api.room.getPublicRooms.useQuery()

  const username =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    "Player"

  const transformMatch = (match: NonNullable<typeof matches>[number]): MatchCardHudProps => {
    const status =
      match.status === "LIVE" || match.status === "HALFTIME"
        ? ("live" as const)
        : match.status === "SCHEDULED"
          ? ("upcoming" as const)
          : ("finished" as const)
    const time =
      status === "live"
        ? "LIVE"
        : new Date(match.kickoffTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    return {
      id: match.id,
      status,
      time,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      league: match.competition.name,
      homeScore: match.homeScore ?? undefined,
      awayScore: match.awayScore ?? undefined,
    }
  }

  const liveMatches = matches?.filter((m) => m.status === "LIVE" || m.status === "HALFTIME").map(transformMatch) ?? []
  const upcomingMatches = matches?.filter((m) => m.status === "SCHEDULED").map(transformMatch) ?? []

  return (
    <>
      {/* ── Tactical HUD wrapper ── */}
      <div id="tactical-hud" style={{ position: "relative", minHeight: "100svh", background: "#030509" }}>
        <PitchStage />

        {/* Intro splash — pointer-events disabled when fading so nav stays clickable */}
        {intro && <IntroSplash onDone={() => setIntro(false)} />}

        <div className="app" style={{ paddingBottom: 80 }}>
          <TopHud />
          <OracleConsole username={username} />

          {/* Live matches (original data, new style) */}
          {(matchesLoading || liveMatches.length > 0) && (
            <div className="bar-section">
              <div className="bar-head">
                <span className="num" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.66 0.26 22)", boxShadow: "0 0 8px oklch(0.66 0.26 22)", display: "inline-block", animation: "hudPulse 1.2s infinite" }} />
                  LIVE
                </span>
                <span className="title">{liveMatches.length} MATCHS EN DIRECT</span>
              </div>
              {matchesLoading ? (
                <div style={{ height: 80, background: "rgba(10,15,26,0.6)", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
              ) : (
                liveMatches.map((m) => <MatchCardHud key={m.id} {...m} />)
              )}
            </div>
          )}

          {/* Today's matches (original data, new style) */}
          <div className="bar-section">
            <div className="bar-head">
              <span className="num">[02]</span>
              <span className="title">MATCHS DU JOUR · {matches?.length ?? 0}</span>
              <button className="link" style={{ background: "none", border: "none", padding: 0 }} onClick={() => { /* handled by link styling */ }}>
                <a href="/matches" style={{ color: "inherit", textDecoration: "none" }}>VOIR TOUT →</a>
              </button>
            </div>
            {matchesLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={{ height: 80, background: "rgba(10,15,26,0.6)", borderRadius: 6, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
              ))
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.slice(0, 5).map((m) => <MatchCardHud key={m.id} {...m} />)
            ) : (
              <div style={{ padding: "24px 0", fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 11, color: "#545e71", textAlign: "center", letterSpacing: "0.1em" }}>
                AUCUN MATCH AUJOURD&apos;HUI
              </div>
            )}
          </div>

          {/* Rooms (original data, new style) */}
          <RoomsSection rooms={rooms ?? []} />

          {/* Quick access */}
          <QuickAccess />

          {/* Demo card */}
          <DemoCard />

          {/* Ticker */}
          <Ticker />

          {/* WC26 Banner */}
          <WCBanner />
        </div>
      </div>

      {/* ── DashboardNav entirely outside #tactical-hud for clean fixed positioning ── */}
      <DashboardNav />
    </>
  )
}
