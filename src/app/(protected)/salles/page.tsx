"use client"

import * as React from "react"
import { api } from "~/trpc/react"
import { Users, MessageSquare, Clock, Crown, Plus, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { Header } from "~/components/shared/Header"

type ViewMode = "my-rooms" | "explore"

// ── Create Room Modal ─────────────────────────────────────────
function CreateRoomModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [visibility, setVisibility] = React.useState<"PUBLIC" | "PRIVATE" | "INVITE_ONLY">("PUBLIC")
  const [error, setError] = React.useState<string | null>(null)

  const createRoom = api.room.create.useMutation({
    onSuccess: (room) => onCreated(room.id),
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    createRoom.mutate({ name: name.trim(), description: description.trim() || undefined, visibility })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-secondary border border-bg-tertiary rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-text-primary">Créer une salle</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Nom de la salle *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ligue 1 Masters"
              minLength={3}
              maxLength={50}
              required
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-text-primary placeholder:text-text-tertiary transition-colors"
            />
            <p className="text-xs text-text-tertiary text-right">{name.length}/50</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Description <span className="text-text-tertiary">(optionnel)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre salle..."
              maxLength={200}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-bg-tertiary focus:border-accent-cyan focus:outline-none text-text-primary placeholder:text-text-tertiary transition-colors resize-none"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Visibilité</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PUBLIC", "PRIVATE", "INVITE_ONLY"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={cn(
                    "py-2 px-2 rounded-xl text-xs font-medium border transition-all",
                    visibility === v
                      ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
                      : "bg-bg-primary border-bg-tertiary text-text-secondary hover:border-bg-tertiary/80"
                  )}
                >
                  {v === "PUBLIC" ? "🌍 Publique" : v === "PRIVATE" ? "🔒 Privée" : "✉️ Invitation"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={createRoom.isPending || name.trim().length < 3}
            className="w-full py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold text-sm disabled:opacity-50 transition-opacity min-h-11"
          >
            {createRoom.isPending ? "Création..." : "Créer la salle"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function SallesPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<ViewMode>("my-rooms")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showCreate, setShowCreate] = React.useState(false)

  const { data: rooms, isLoading, refetch } = api.room.getMyRooms.useQuery()

  const handleCreated = (id: string) => {
    setShowCreate(false)
    void refetch()
    router.push(`/salles/${id}`)
  }

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
        <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-display text-xl font-bold text-text-primary">Salles</h1>
            <button
              className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm min-h-11 flex items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
              Créer
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
          <div className="text-6xl">💬</div>
          <h2 className="font-display text-xl text-text-primary">Aucune salle</h2>
          <p className="text-text-tertiary text-center max-w-md">
            Rejoignez une salle officielle depuis un match ou créez votre propre salle
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold text-sm min-h-11 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer ma première salle
          </button>
        </div>

        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
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
                className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm min-h-11 flex items-center gap-2"
                onClick={() => setShowCreate(true)}
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

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
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
        (r.description?.toLowerCase().includes(query) ?? false) ||
        (r.owner.displayName?.toLowerCase().includes(query) ?? false) ||
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
