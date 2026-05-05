"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, Bell, Users } from "lucide-react"
import { api } from "~/trpc/react"

export default function NotificationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const enabled = !!session?.user?.id

  const { data: unreadCounts } = api.room.getUnreadCounts.useQuery(undefined, {
    enabled,
    staleTime: 20_000,
    refetchInterval: 30_000,
  })
  const { data: myRooms } = api.room.getMyRooms.useQuery(undefined, { enabled })

  const roomMap = React.useMemo(
    () => new Map((myRooms ?? []).map(r => [r.id, r])),
    [myRooms]
  )

  const activeRooms = (unreadCounts ?? [])
    .filter(c => c.openTickets > 0)
    .sort((a, b) => b.openTickets - a.openTickets)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-11"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-28 space-y-4">
        {activeRooms.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="font-semibold text-text-primary">Tout est à jour</p>
            <p className="text-xs text-text-tertiary mt-1">Aucune analyse en attente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeRooms.map(({ roomId, openTickets }) => {
              const room = roomMap.get(roomId)
              if (!room) return null
              return (
                <button
                  key={roomId}
                  onClick={() => router.push(`/salles/${roomId}`)}
                  className="w-full flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-bg-tertiary hover:border-accent-cyan/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary truncate">{room.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {openTickets} analyse{openTickets > 1 ? "s" : ""} en attente
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 ml-3 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {openTickets > 9 ? "9+" : openTickets}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </main>

    </div>
  )
}
