"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { cn } from "~/lib/utils"

// Mock data for the UI
const MOCK_MATCHES = [
  {
    id: "1",
    status: "live" as const,
    time: "67'",
    homeTeam: "PSG",
    awayTeam: "OM",
    homeScore: 2,
    awayScore: 1,
    homeColor: "#004170",
    awayColor: "#2FAEE0",
    league: "Ligue 1",
    tags: ["Derby", "Classico"],
    analysisCount: 234,
  },
  {
    id: "2",
    status: "upcoming" as const,
    time: "20:45",
    homeTeam: "Lyon",
    awayTeam: "Monaco",
    homeColor: "#DA291C",
    awayColor: "#E62333",
    league: "Ligue 1",
    tags: [],
    analysisCount: 89,
  },
  {
    id: "3",
    status: "upcoming" as const,
    time: "21:00",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeColor: "#FFFFFF",
    awayColor: "#A50044",
    league: "La Liga",
    tags: ["El Clasico"],
    analysisCount: 567,
  },
]

const MOCK_ROOMS = [
  {
    id: "1",
    name: "Ligue 1 Masters",
    badge: "📊",
    onlineCount: 45,
    memberCount: 234,
    color: "#00D4FF",
  },
  {
    id: "2",
    name: "Champions League",
    badge: "🏆",
    onlineCount: 78,
    memberCount: 512,
    color: "#FFD93D",
  },
]

const AGENTS = [
  { id: "scout", name: "Scout", color: "var(--color-agent-scout)" },
  { id: "insider", name: "Insider", color: "var(--color-agent-insider)" },
  { id: "tactic", name: "TacticMaster", color: "var(--color-agent-tactic)" },
  { id: "goal", name: "GoalMaster", color: "var(--color-agent-goal)" },
  { id: "momentum", name: "MomentumX", color: "var(--color-agent-momentum)" },
  { id: "context", name: "ContextKing", color: "var(--color-agent-context)" },
]

export default function DashboardPage() {
  useSession() // Verify auth
  const router = useRouter()

  const liveMatches = MOCK_MATCHES.filter((m) => m.status === "live")
  const upcomingMatches = MOCK_MATCHES.filter((m) => m.status === "upcoming")

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="space-y-6">
          {/* Live Matches Section */}
          {liveMatches.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
                  </span>
                  <h2 className="font-display text-base font-semibold text-text-primary">
                    LIVE
                  </h2>
                  <span className="px-2 py-0.5 bg-bg-tertiary rounded-full text-xs text-text-secondary">
                    {liveMatches.length}
                  </span>
                </div>
              </div>

              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} onAnalyze={() => router.push("/analyse")} />
              ))}
            </section>
          )}

          {/* Today's Matches Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Matchs du jour
                </h2>
                <span className="px-2 py-0.5 bg-bg-tertiary rounded-full text-xs text-text-secondary">
                  {MOCK_MATCHES.length}
                </span>
              </div>
              <button className="text-sm text-accent-cyan hover:underline">
                Voir tout →
              </button>
            </div>

            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} onAnalyze={() => router.push("/analyse")} />
            ))}
          </section>

          {/* Active Rooms Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h2 className="font-display text-base font-semibold text-text-primary">
                  Salles actives
                </h2>
              </div>
              <button
                onClick={() => router.push("/salles")}
                className="text-sm text-accent-cyan hover:underline"
              >
                Explorer →
              </button>
            </div>

            {MOCK_ROOMS.map((room) => (
              <RoomCard key={room.id} room={room} onClick={() => router.push("/salles")} />
            ))}
          </section>

          {/* Available Agents Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Agents disponibles
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => router.push("/analyse")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full",
                    "bg-bg-secondary border border-bg-tertiary",
                    "hover:border-current transition-colors",
                    "whitespace-nowrap flex-shrink-0"
                  )}
                  style={{ borderColor: "transparent" }}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {agent.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <DashboardNav />
    </div>
  )
}

// Match Card Component
interface MatchCardProps {
  match: {
    id: string
    status: "live" | "upcoming" | "finished"
    time: string
    homeTeam: string
    awayTeam: string
    homeScore?: number
    awayScore?: number
    homeColor: string
    awayColor: string
    league: string
    tags: string[]
    analysisCount: number
  }
  onAnalyze: () => void
}

function MatchCard({ match, onAnalyze }: MatchCardProps) {
  const isLive = match.status === "live"

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-xl p-4 border transition-all",
        isLive
          ? "border-accent-cyan/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          : "border-transparent hover:border-bg-tertiary"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
              </span>
              <span className="text-xs font-medium text-accent-red">LIVE</span>
            </>
          ) : (
            <span className="text-xs text-text-secondary">Aujourd&apos;hui</span>
          )}
        </div>
        <span className="font-mono text-sm font-medium text-text-primary">
          {match.time}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: match.homeColor }}
          />
          <span className="font-semibold text-text-primary truncate">
            {match.homeTeam}
          </span>
        </div>

        <div className="px-3">
          {match.homeScore !== undefined ? (
            <span className="font-mono font-bold text-text-primary">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-text-tertiary text-sm">vs</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-semibold text-text-primary truncate">
            {match.awayTeam}
          </span>
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: match.awayColor }}
          />
        </div>
      </div>

      {/* Tags */}
      {match.tags.length > 0 && (
        <div className="flex gap-2 mb-3">
          {match.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "px-2 py-1 rounded text-xs",
                tag === "Derby" || tag === "Classico" || tag === "El Clasico"
                  ? "bg-agent-context/20 text-agent-context"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              {tag === "Derby" && "🏆 "}
              {tag === "Classico" && "⚔️ "}
              {tag === "El Clasico" && "🔥 "}
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          {match.analysisCount} analysent ce match
        </span>
        <button
          onClick={onAnalyze}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors",
            "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90",
            "min-h-[36px]"
          )}
        >
          + Analyser
        </button>
      </div>
    </div>
  )
}

// Room Card Component
interface RoomCardProps {
  room: {
    id: string
    name: string
    badge: string
    onlineCount: number
    memberCount: number
    color: string
  }
  onClick: () => void
}

function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-bg-secondary rounded-xl p-4 text-left",
        "border-l-4 hover:bg-bg-tertiary transition-colors"
      )}
      style={{ borderLeftColor: room.color }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-text-primary">{room.name}</span>
        <span className="text-lg">{room.badge}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-accent-green rounded-full" />
          {room.onlineCount} en ligne
        </span>
        <span>{room.memberCount} membres</span>
      </div>
    </button>
  )
}
