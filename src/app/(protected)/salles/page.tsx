"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { ChevronLeft, Settings, MessageSquare, Users, Circle } from "lucide-react"
import { DashboardNav } from "~/components/shared/DashboardNav"

interface Room {
  id: string
  name: string
  badge: string
  onlineCount: number
  memberCount: number
  color: string
}

interface Ticket {
  id: string
  title: string
  author: string
  time: string
  messageCount: number
  participantCount: number
}

// Mock data
const MOCK_ROOMS: Room[] = [
  { id: "1", name: "Ligue 1 Masters", badge: "📊", onlineCount: 45, memberCount: 234, color: "#00D4FF" },
  { id: "2", name: "Champions League", badge: "🏆", onlineCount: 78, memberCount: 512, color: "#FFD93D" },
  { id: "3", name: "Value Bets FR", badge: "💰", onlineCount: 23, memberCount: 156, color: "#10B981" },
]

const MOCK_TICKETS: Ticket[] = [
  { id: "1", title: "📋 Coupon PSG-OM + Lyon-Monaco", author: "@swabo", time: "Il y a 2h", messageCount: 45, participantCount: 12 },
  { id: "2", title: "📋 Analyse Ligue 1 J28", author: "@expert_foot", time: "Il y a 5h", messageCount: 23, participantCount: 8 },
  { id: "3", title: "📋 Monaco vs Lille", author: "@swabo", time: "Hier", messageCount: 67, participantCount: 19 },
]

type ViewMode = "list" | "room"
type TabType = "bienvenue" | "encours" | "archives"

export default function SallesPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("room")
  const [selectedRoom, setSelectedRoom] = React.useState<Room>(MOCK_ROOMS[0]!)
  const [tab, setTab] = React.useState<TabType>("encours")

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setViewMode("room")
  }

  if (viewMode === "list") {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="font-display text-xl font-bold text-text-primary">Salles</h1>
            <button className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm min-h-[44px]">
              + Créer
            </button>
          </div>
        </header>

        {/* Room List */}
        <main className="flex-1 p-4 pb-24 space-y-3">
          {MOCK_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomSelect(room)}
              className="w-full bg-bg-secondary rounded-xl p-4 text-left border-l-4 hover:bg-bg-tertiary transition-colors"
              style={{ borderLeftColor: room.color }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-text-primary">{room.name}</span>
                <span className="text-lg">{room.badge}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Circle className="w-1.5 h-1.5 fill-accent-green text-accent-green" />
                  {room.onlineCount} en ligne
                </span>
                <span>{room.memberCount} membres</span>
              </div>
            </button>
          ))}
        </main>

        <DashboardNav />
      </div>
    )
  }

  // Room Detail View (matching mockup)
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">{selectedRoom.name}</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedRoom.badge}</span>
            <button className="p-2 text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Room Stats Bar */}
        <div className="px-4 py-2 bg-bg-secondary flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Circle className="w-1.5 h-1.5 fill-accent-green text-accent-green" />
            {selectedRoom.onlineCount} en ligne
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {selectedRoom.memberCount} membres
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Tabs */}
        <div className="bg-bg-secondary rounded-xl p-1 flex mb-4">
          <button
            onClick={() => setTab("bienvenue")}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
              tab === "bienvenue"
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            👋 Bienvenue
          </button>
          <button
            onClick={() => setTab("encours")}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
              tab === "encours"
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            🔥 En cours
          </button>
          <button
            onClick={() => setTab("archives")}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
              tab === "archives"
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            📦 Archives
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {MOCK_TICKETS.map((ticket) => (
            <button
              key={ticket.id}
              className="w-full bg-bg-secondary rounded-xl p-4 text-left hover:bg-bg-tertiary transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-text-primary text-sm">{ticket.title}</h3>
              </div>
              <p className="text-xs text-text-tertiary mb-2">
                Par {ticket.author} • {ticket.time}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {ticket.messageCount} messages
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ticket.participantCount} participants
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* My Coupon Section */}
        <div className="mt-6 bg-bg-secondary rounded-xl p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span>📋</span>
              Mon coupon du jour
            </h3>
            <p className="text-xs text-text-secondary">3 matchs sélectionnés</p>
          </div>

          <button
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm mb-2",
              "bg-gradient-to-r from-accent-cyan to-[#0099CC]",
              "text-bg-primary hover:opacity-90 transition-opacity"
            )}
          >
            Partager dans cette salle
          </button>

          <button
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm",
              "bg-bg-tertiary text-text-primary",
              "hover:bg-bg-tertiary/80 transition-colors",
              "flex items-center justify-center gap-2"
            )}
          >
            Partager dans autre salle
            <span className="text-text-secondary">▼</span>
          </button>
        </div>
      </main>

      <DashboardNav />
    </div>
  )
}
