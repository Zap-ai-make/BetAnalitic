"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import { useSession } from "next-auth/react"
import { Hash, Menu, X, ArrowLeft, Settings, Ticket } from "lucide-react"
import { cn } from "~/lib/utils"

type Channel = {
  id: string
  slug: string
  name: string
  type: string
  latestMessageAt: Date | null
  openTicketCount: number
}

function useChannelUnread(channels: Channel[] | undefined, activeSlug: string | undefined) {
  const [lastVisited, setLastVisited] = React.useState<Record<string, number>>({})

  // Load from localStorage on mount
  React.useEffect(() => {
    if (!channels) return
    const stored: Record<string, number> = {}
    channels.forEach((ch) => {
      const val = localStorage.getItem(`lv_${ch.id}`)
      if (val) stored[ch.id] = parseInt(val, 10)
    })
    setLastVisited(stored)
  }, [channels])

  // Mark active channel as read
  React.useEffect(() => {
    const activeChannel = channels?.find((ch) => ch.slug === activeSlug)
    if (!activeChannel) return
    const now = Date.now()
    localStorage.setItem(`lv_${activeChannel.id}`, String(now))
    setLastVisited((prev) => ({ ...prev, [activeChannel.id]: now }))
  }, [activeSlug, channels])

  const hasUnread = React.useCallback(
    (ch: Channel) => {
      if (!ch.latestMessageAt) return false
      const lv = lastVisited[ch.id]
      if (!lv) return true
      return new Date(ch.latestMessageAt).getTime() > lv
    },
    [lastVisited]
  )

  return hasUnread
}

function Sidebar({
  roomId,
  onClose,
}: {
  roomId: string
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const { data: room } = api.room.getById.useQuery({ roomId })
  const { data: channels } = api.room.getChannels.useQuery(
    { roomId },
    { refetchInterval: 5000 }
  )

  const activeSlug = pathname.split("/").pop()
  const hasUnread = useChannelUnread(channels, activeSlug)

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-bg-tertiary w-60 shrink-0">
      {/* Room header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary"
        style={{ borderLeftColor: room?.color ?? "#00D4FF", borderLeftWidth: 3 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {room?.badge && <span className="text-lg shrink-0">{room.badge}</span>}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{room?.name ?? "..."}</p>
            <p className="text-xs text-text-tertiary">{room?.memberCount ?? 0} membres</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary ml-2 shrink-0 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-2 mb-1">Canaux</p>
        <nav className="flex flex-col gap-0.5">
          {channels?.map((ch) => {
            const active = activeSlug === ch.slug
            const unread = !active && hasUnread(ch)
            const showTicketBadge = ch.type === "ANALYSE" && ch.openTicketCount > 0

            return (
              <Link
                key={ch.id}
                href={`/salles/${roomId}/${ch.slug}`}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-cyan/15 text-accent-cyan"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                )}
              >
                <Hash className="w-4 h-4 shrink-0 opacity-70" />
                <span className="flex-1 truncate">{ch.name}</span>
                {unread && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                )}
                {showTicketBadge && (
                  <span className="text-[10px] font-bold bg-accent-cyan/20 text-accent-cyan rounded-full px-1.5 py-0.5 leading-none shrink-0">
                    {ch.openTicketCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-bg-tertiary px-3 py-2 flex items-center gap-2">
        <button
          onClick={() => router.push("/salles")}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Salles
        </button>
        <div className="flex-1" />
        {session?.user && room?.ownerId === session.user.id && (
          <Link
            href={`/salles/${roomId}/settings`}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            onClick={onClose}
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar roomId={roomId} />
      </div>

      {/* Mobile overlay with slide animation */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Drawer */}
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar roomId={roomId} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-bg-tertiary bg-bg-primary shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Hash className="w-4 h-4 text-text-tertiary" />
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
