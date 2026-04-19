"use client"

/**
 * Salles Page
 * Story 6.3+: List of joined rooms with real data
 */

import * as React from "react"
import { api } from "~/trpc/react"
import { Users, MessageSquare, Clock, Crown, Plus, Search, X, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { Header } from "~/components/shared/Header"

type ViewMode = "my-rooms" | "explore"

export default function SallesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<ViewMode>("my-rooms")
  const [searchQuery, setSearchQuery] = React.useState("")

  const { data: rooms, isLoading } = api.room.getMyRooms.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-text-tertiary">Chargement...</div>
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-display text-xl font-bold text-text-primary">Salles</h1>
            <button
              className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm min-h-[44px] flex items-center gap-2"
              onClick={() => {
                alert("Fonctionnalité Premium - Story 6.4")
              }}
            >
              <Plus className="w-4 h-4" />
              Créer
            </button>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <div className="text-6xl">💬</div>
          <h2 className="font-display text-xl text-text-primary">Aucune salle</h2>
          <p className="text-text-tertiary text-center max-w-md">
            Rejoignez une salle officielle depuis un match ou créez votre propre salle privée
          </p>
        </div>

        <DashboardNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Tabs & Search */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="px-4 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-text-primary">Salles</h1>
            {viewMode === "my-rooms" && (
              <button
                className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm min-h-[44px] flex items-center gap-2"
                onClick={() => {
                  alert("Fonctionnalité Premium - Story 6.4")
                }}
              >
                <Plus className="w-4 h-4" />
                Créer
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 pb-3">
            <button
              onClick={() => setViewMode("my-rooms")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                viewMode === "my-rooms"
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Mes Salles
            </button>
            <button
              onClick={() => setViewMode("explore")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                viewMode === "explore"
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Explorer
            </button>
          </div>

          {/* Search Bar (Explorer mode only) */}
          {viewMode === "explore" && (
            <div className="relative pb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une salle..."
                className={cn(
                  "w-full pl-10 pr-10 py-3 rounded-xl bg-bg-secondary",
                  "text-text-primary placeholder:text-text-tertiary",
                  "border border-bg-tertiary focus:border-accent-cyan",
                  "focus:outline-none transition-colors"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 space-y-3 overflow-y-auto">
        {viewMode === "my-rooms" ? (
          /* My Rooms List */
          rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-6xl">💬</div>
              <h2 className="font-display text-xl text-text-primary">Aucune salle</h2>
              <p className="text-text-tertiary text-center max-w-md">
                Rejoignez une salle depuis l&apos;onglet Explorer
              </p>
              <button
                onClick={() => setViewMode("explore")}
                className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm"
              >
                Explorer les salles
              </button>
            </div>
          ) : (
            rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => router.push(`/salles/${room.id}`)}
            className={cn(
              "bg-bg-secondary rounded-xl p-4 space-y-3",
              "border border-bg-tertiary",
              "hover:border-accent-cyan transition-colors cursor-pointer"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {room.badge && <span className="text-xl">{room.badge}</span>}
                  <h3 className="font-display text-base font-semibold text-text-primary truncate">
                    {room.name}
                  </h3>
                  {room.type === "OFFICIAL" && (
                    <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan text-xs rounded-full">
                      Officiel
                    </span>
                  )}
                </div>
                {room.description && (
                  <p className="text-sm text-text-tertiary line-clamp-2 mt-1">
                    {room.description}
                  </p>
                )}
              </div>
              {room.myRole === "OWNER" && (
                <Crown className="w-5 h-5 text-accent-gold flex-shrink-0" />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{room.memberCount} membre{room.memberCount > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{room.messageCount} message{room.messageCount > 1 ? "s" : ""}</span>
              </div>
              {room.match && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(room.match.kickoffTime).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Match Info (if applicable) */}
            {room.match && (
              <div className="pt-2 border-t border-bg-tertiary">
                <div className="text-sm text-text-secondary">
                  {room.match.homeTeam.shortName} vs {room.match.awayTeam.shortName}
                </div>
              </div>
            )}
          </div>
            ))
          )
        ) : (
          /* Explorer View */
          <div className="space-y-6">
            <ExploreRoomsContent searchQuery={searchQuery} />
          </div>
        )}
      </main>

      <DashboardNav />
    </div>
  )
}

/**
 * Epic 13 Story 13.3: Room Discovery & Search
 */
function ExploreRoomsContent({ searchQuery }: { searchQuery: string }) {
  const router = useRouter()
  const { data: publicRooms, isLoading } = api.room.getPublicRooms.useQuery()

  const filteredRooms = React.useMemo(() => {
    if (!publicRooms) return []
    if (!searchQuery.trim()) return publicRooms

    const query = searchQuery.toLowerCase()
    return publicRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.owner.displayName?.toLowerCase().includes(query) ||
        r.owner.username.toLowerCase().includes(query)
    )
  }, [publicRooms, searchQuery])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-secondary rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (!filteredRooms || filteredRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="font-display text-xl text-text-primary">
          {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucune salle publique"}
        </h2>
        <p className="text-text-tertiary text-center max-w-md">
          {searchQuery
            ? "Essayez un autre terme de recherche"
            : "Les salles publiques apparaîtront ici"}
        </p>
      </div>
    )
  }

  // Group rooms by type
  const officialRooms = filteredRooms.filter((r) => r.type === "OFFICIAL")
  const privateRooms = filteredRooms.filter((r) => r.type === "PRIVATE")

  return (
    <div className="space-y-6">
      {/* Trending/Official Rooms */}
      {officialRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-text-primary">
            Salles Officielles
          </h2>
          {officialRooms.map((room) => (
            <RoomDiscoveryCard key={room.id} room={room} onClick={() => router.push(`/salles/${room.id}`)} />
          ))}
        </div>
      )}

      {/* Community Rooms */}
      {privateRooms.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-text-primary">
            Salles Communautaires
          </h2>
          {privateRooms.map((room) => (
            <RoomDiscoveryCard key={room.id} room={room} onClick={() => router.push(`/salles/${room.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function RoomDiscoveryCard({
  room,
  onClick,
}: {
  room: {
    id: string
    name: string
    description: string | null
    type: string
    badge: string | null
    memberCount: number
    messageCount: number
    owner: { displayName: string | null; username: string }
  }
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-bg-secondary rounded-xl p-4 space-y-3",
        "border border-bg-tertiary",
        "hover:border-accent-cyan transition-colors cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {room.badge && <span className="text-xl">{room.badge}</span>}
            <h3 className="font-display text-base font-semibold text-text-primary truncate">
              {room.name}
            </h3>
            {room.type === "OFFICIAL" && (
              <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan text-xs rounded-full">
                Officiel
              </span>
            )}
          </div>
          {room.description && (
            <p className="text-sm text-text-tertiary line-clamp-2 mt-1">
              {room.description}
            </p>
          )}
          <p className="text-xs text-text-tertiary mt-2">
            Créé par {room.owner.displayName ?? room.owner.username}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{room.memberCount} membre{room.memberCount > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          <span>{room.messageCount} message{room.messageCount > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  )
}
