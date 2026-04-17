"use client"

/**
 * Salles Page
 * Story 6.3+: List of joined rooms with real data
 */

import * as React from "react"
import { api } from "~/trpc/react"
import { Users, MessageSquare, Clock, Crown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { DashboardNav } from "~/components/shared/DashboardNav"

export default function SallesPage() {
  const router = useRouter()
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
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Mes Salles</h1>
            <p className="text-xs text-text-tertiary">{rooms.length} salle(s) rejointe(s)</p>
          </div>
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

      {/* Rooms List */}
      <main className="flex-1 p-4 pb-24 space-y-3 overflow-y-auto">
        {rooms.map((room) => (
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
        ))}
      </main>

      <DashboardNav />
    </div>
  )
}
