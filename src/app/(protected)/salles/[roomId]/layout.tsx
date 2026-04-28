"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import { useSession } from "next-auth/react"
import { Hash, ArrowLeft, Settings, ChevronLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import { RoomNavigationContext } from "./room-nav-context"

// ── Types ──────────────────────────────────────────────────────────────────
type Channel = {
  id: string; slug: string; name: string; type: string
  latestMessageAt: Date | null; openTicketCount: number
}

// ── Unread hook ────────────────────────────────────────────────────────────
function useChannelUnread(channels: Channel[] | undefined, activeSlug: string | undefined) {
  const [lastVisited, setLastVisited] = React.useState<Record<string, number>>({})
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (!channels) return
    const stored: Record<string, number> = {}
    channels.forEach((ch) => {
      const val = localStorage.getItem(`lv_${ch.id}`)
      if (val) stored[ch.id] = parseInt(val, 10)
    })
    setLastVisited(stored)
    setLoaded(true)
  }, [channels])

  React.useEffect(() => {
    const active = channels?.find((ch) => ch.slug === activeSlug)
    if (!active) return
    const now = Date.now()
    localStorage.setItem(`lv_${active.id}`, String(now))
    setLastVisited((prev) => ({ ...prev, [active.id]: now }))
  }, [activeSlug, channels])

  const channelsSince = React.useMemo(
    () => (channels ?? []).map((ch) => ({ channelId: ch.id, since: lastVisited[ch.id] ?? 0 })),
    [channels, lastVisited]
  )

  const { data: unreadData } = api.room.getChannelUnreadCounts.useQuery(
    { channels: channelsSince },
    { enabled: loaded && channelsSince.length > 0, refetchInterval: 5000, staleTime: 0 }
  )
  const unreadMap = React.useMemo(
    () => new Map((unreadData ?? []).map((c) => [c.channelId, c.count])),
    [unreadData]
  )

  return { unreadMap, lastVisited }
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({
  roomId, onChannelClick,
}: {
  roomId: string
  onChannelClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { data: room } = api.room.getById.useQuery({ roomId })
  const { data: channels } = api.room.getChannels.useQuery({ roomId }, { refetchInterval: 5000 })

  const activeSlug = pathname.split("/").filter(Boolean).pop()
  const { unreadMap } = useChannelUnread(channels, activeSlug)

  return (
    <div className="flex flex-col h-full bg-bg-secondary w-60 shrink-0 overflow-hidden">

      {/* Cover image / gradient header */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: 96 }}
      >
        {room?.coverImage ? (
          <img src={room.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${room?.color ?? "#00D4FF"}60 0%, ${room?.color ?? "#00D4FF"}10 100%)` }}
          />
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/95 via-bg-secondary/40 to-transparent" />
        {/* Room badge */}
        {room?.badge && (
          <span className="absolute top-3 left-3 text-2xl drop-shadow">{room.badge}</span>
        )}
        {/* Accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: room?.color ?? "#00D4FF" }}
        />
      </div>

      {/* Room title */}
      <div className="px-4 py-2.5 shrink-0 border-b border-bg-tertiary">
        <p className="text-sm font-bold text-text-primary truncate">{room?.name ?? "…"}</p>
        <p className="text-xs text-text-tertiary">{room?.memberCount ?? 0} membres</p>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-2 mb-1.5">Canaux</p>
        <nav className="flex flex-col gap-0.5">
          {channels?.map((ch) => {
            const active = activeSlug === ch.slug
            const unread = active ? 0 : (unreadMap.get(ch.id) ?? 0)
            const ticketBadge = !active && ch.type === "ANALYSE" && ch.openTicketCount > 0

            return (
              <Link
                key={ch.id}
                href={`/salles/${roomId}/${ch.slug}`}
                onClick={onChannelClick}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors group",
                  active
                    ? "bg-accent-cyan/15 text-accent-cyan"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                )}
              >
                <Hash className="w-4 h-4 shrink-0 opacity-70" />
                <span className="flex-1 truncate">{ch.name}</span>
                {unread > 0 && (
                  <span className="min-w-[18px] h-[18px] text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center px-1 shrink-0">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
                {ticketBadge && (
                  <span className="min-w-[18px] h-[18px] text-[10px] font-bold bg-accent-cyan/80 text-bg-primary rounded-full flex items-center justify-center px-1 shrink-0">
                    {ch.openTicketCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-bg-tertiary px-3 py-2 flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push("/salles")}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />Salles
        </button>
        <div className="flex-1" />
        {session?.user && room?.ownerId === session.user.id && (
          <Link
            href={`/salles/${roomId}/settings`}
            onClick={onChannelClick}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────
export default function RoomLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId
  const pathname = usePathname()

  // On mobile: "channels" shows the sidebar full-screen, "content" shows the page
  const [mobilePanel, setMobilePanel] = React.useState<"channels" | "content">("channels")

  // When the URL changes to a channel, auto-show content
  React.useEffect(() => {
    const parts = pathname.split("/").filter(Boolean)
    // /salles/[roomId]/[channel] → parts = ["salles", roomId, channel]
    // /salles/[roomId]/settings → parts = ["salles", roomId, "settings"]
    if (parts.length >= 3) {
      setMobilePanel("content")
    }
  }, [pathname])

  const navCtx = React.useMemo(
    () => ({ goToChannels: () => setMobilePanel("channels") }),
    []
  )

  return (
    <RoomNavigationContext.Provider value={navCtx}>
      <div className="flex h-[calc(100dvh-64px)] overflow-hidden">

        {/* ── Desktop: always side-by-side ── */}
        <div className="hidden md:flex border-r border-bg-tertiary">
          <Sidebar roomId={roomId} />
        </div>

        {/* ── Mobile: sliding panels ── */}
        {/* Sidebar panel */}
        <div
          className={cn(
            "md:hidden absolute inset-0 z-10 transition-transform duration-300 ease-in-out",
            mobilePanel === "channels" ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar
            roomId={roomId}
            onChannelClick={() => setMobilePanel("content")}
          />
        </div>

        {/* Content panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Mobile top bar with back-to-channels */}
          <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-bg-tertiary bg-bg-primary shrink-0">
            <button
              onClick={() => setMobilePanel("channels")}
              className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors py-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <Hash className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>

      </div>
    </RoomNavigationContext.Provider>
  )
}
