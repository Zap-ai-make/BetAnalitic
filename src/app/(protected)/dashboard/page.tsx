"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { MatchCard } from "~/components/features/match/MatchCard"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

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

  const { data: matches, isLoading } = api.match.getTodaysMatches.useQuery()

  // Transform matches to MatchCard format
  const transformMatch = (match: NonNullable<typeof matches>[number]) => {
    const status =
      match.status === "LIVE" || match.status === "HALFTIME"
        ? ("live" as const)
        : match.status === "SCHEDULED"
          ? ("upcoming" as const)
          : ("finished" as const)

    const time =
      match.status === "LIVE" || match.status === "HALFTIME"
        ? "LIVE"
        : new Date(match.kickoffTime).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })

    return {
      id: match.id,
      status,
      time,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      league: match.competition.name,
      homeScore: match.homeScore ?? undefined,
      awayScore: match.awayScore ?? undefined,
      tags: match.tags.map((t) => t.tag),
      analysisCount: match.analysisCount,
    }
  }

  const liveMatches = matches?.filter((m) => m.status === "LIVE" || m.status === "HALFTIME").map(transformMatch) ?? []
  const upcomingMatches = matches?.filter((m) => m.status === "SCHEDULED").map(transformMatch) ?? []

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="space-y-6">
          {/* Quick Access — Paris */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/paris")}
              className="bg-bg-secondary rounded-xl p-4 flex items-center gap-3 hover:bg-bg-tertiary transition-colors text-left"
            >
              <span className="text-2xl">🎰</span>
              <div>
                <p className="font-semibold text-text-primary text-sm">Paris Virtuels</p>
                <p className="text-xs text-text-tertiary">Parier sur les matchs</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/coupons")}
              className="bg-bg-secondary rounded-xl p-4 flex items-center gap-3 hover:bg-bg-tertiary transition-colors text-left"
            >
              <span className="text-2xl">🎫</span>
              <div>
                <p className="font-semibold text-text-primary text-sm">Mes Coupons</p>
                <p className="text-xs text-text-tertiary">Historique des paris</p>
              </div>
            </button>
          </div>

          {/* Live Matches Section */}
          {(isLoading || liveMatches.length > 0) && (
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

              {isLoading ? (
                <MatchCardSkeleton />
              ) : (
                liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              )}
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
                  {matches?.length ?? 0}
                </span>
              </div>
              <button
                onClick={() => router.push("/matches")}
                className="text-sm text-accent-cyan hover:underline"
              >
                Voir tout →
              </button>
            </div>

            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))
            ) : (
              <div className="text-center py-8 text-text-tertiary">
                Aucun match aujourd&apos;hui
              </div>
            )}
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

// Skeleton Loading Component
function MatchCardSkeleton() {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 border-2 border-transparent space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 bg-bg-tertiary rounded" />
        <div className="h-4 w-12 bg-bg-tertiary rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-32 bg-bg-tertiary rounded" />
        <div className="h-5 w-32 bg-bg-tertiary rounded" />
        <div className="h-4 w-24 bg-bg-tertiary rounded" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-40 bg-bg-tertiary rounded" />
        <div className="h-9 w-24 bg-bg-tertiary rounded" />
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
