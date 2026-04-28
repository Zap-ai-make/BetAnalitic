"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { api } from "~/trpc/react"
import { useSession } from "next-auth/react"
import { Hash, Menu, X, Users, ArrowLeft, Settings, ChevronDown, Lock } from "lucide-react"
import { cn } from "~/lib/utils"

interface ChannelLinkProps {
  roomId: string
  slug: string
  name: string
  active: boolean
  onClick?: () => void
}

function ChannelLink({ roomId, slug, name, active, onClick }: ChannelLinkProps) {
  return (
    <Link
      href={`/salles/${roomId}/${slug}`}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-accent-cyan/15 text-accent-cyan"
          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
      )}
    >
      <Hash className="w-4 h-4 shrink-0 opacity-70" />
      <span className="truncate">{name}</span>
    </Link>
  )
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
  const { data: channels } = api.room.getChannels.useQuery({ roomId })

  const activeSlug = pathname.split("/").pop()

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-bg-tertiary w-60 shrink-0">
      {/* Room header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary cursor-pointer hover:bg-bg-tertiary transition-colors"
        style={{ borderLeftColor: room?.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {room?.badge && <span className="text-lg shrink-0">{room.badge}</span>}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{room?.name ?? "..."}</p>
            <p className="text-xs text-text-tertiary">{room?.memberCount ?? 0} membres</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-2 mb-1">Canaux</p>
        <nav className="flex flex-col gap-0.5">
          {channels?.map((ch) => (
            <ChannelLink
              key={ch.id}
              roomId={roomId}
              slug={ch.slug}
              name={ch.name}
              active={activeSlug === ch.slug}
              onClick={onClose}
            />
          ))}
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar roomId={roomId} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

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
          <span className="text-sm font-medium text-text-primary">
            {/* Active channel name shown via the page itself */}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
