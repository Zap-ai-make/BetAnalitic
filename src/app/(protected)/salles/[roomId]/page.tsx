"use client"

/**
 * Room Chat Page
 * Story 6.9: Full-featured chat interface with real-time messaging
 */

import * as React from "react"
import { api } from "~/trpc/react"
import { useParams, useRouter } from "next/navigation"
import { Send, Users, Settings, ArrowLeft, Crown, Share2 } from "lucide-react"
import { cn } from "~/lib/utils"
import { useChannel, useEnterPresence, usePublish } from "~/lib/realtime/context"
import type { RealtimeMessage, PresenceData } from "~/lib/realtime/types"
import { TicketShareCard } from "~/components/features/rooms/TicketShareCard"
import { InviteUserModal } from "~/components/features/rooms/InviteUserModal"

interface ChatMessage {
  id: string
  roomId: string
  userId: string
  userName: string
  userAvatar: string | null
  type: "TEXT" | "AGENT" | "SYSTEM"
  content: string
  agentId: string | null
  replyToId: string | null
  reactions: unknown
  createdAt: Date
  editedAt: Date | null
  metadata?: {
    ticketId?: string
    matches?: Array<{
      homeTeam: string
      awayTeam: string
      prediction: string
      odds: number
    }>
    totalOdds?: number
  }
}

export default function RoomChatPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [messageInput, setMessageInput] = React.useState("")
  const [onlineMembers, setOnlineMembers] = React.useState<PresenceData[]>([])
  const [showShareTicket, setShowShareTicket] = React.useState(false)
  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const { data: room } = api.room.getById.useQuery({ roomId })
  const { data: messagesData } = api.room.getMessages.useQuery({ roomId, limit: 100 })
  const { data: members } = api.room.getMembers.useQuery({ roomId })
  const sendMessageMutation = api.room.sendMessage.useMutation()

  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])

  const publish = usePublish(`room:${roomId}`)
  useEnterPresence(`room:${roomId}`, {
    userId: "me",
    userName: "Moi",
    userAvatar: undefined,
    status: "online",
  })

  const handlePresenceUpdate = React.useCallback((presenceMembers: PresenceData[]) => {
    setOnlineMembers(presenceMembers)
  }, [])

  const handleRealtimeMessage = React.useCallback((msg: RealtimeMessage) => {
    if (msg.type === "ROOM_MESSAGE" && msg.payload) {
      setOptimisticMessages((prev) => [...prev, msg.payload as ChatMessage])
    }
  }, [])

  useChannel(`room:${roomId}`, handleRealtimeMessage, handlePresenceUpdate)

  const allMessages = React.useMemo<ChatMessage[]>(() => {
    const dbMessages = (messagesData?.messages ?? []) as ChatMessage[]
    return [...dbMessages, ...optimisticMessages]
  }, [messagesData?.messages, optimisticMessages])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages])

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      roomId,
      userId: "me",
      userName: "Vous",
      userAvatar: null,
      type: "TEXT" as const,
      content: messageInput,
      agentId: null,
      replyToId: null,
      reactions: null,
      createdAt: new Date(),
      editedAt: null,
    }

    setOptimisticMessages((prev) => [...prev, tempMessage])
    setMessageInput("")

    try {
      const result = await sendMessageMutation.mutateAsync({
        roomId,
        content: messageInput,
        type: "TEXT",
      })

      // Broadcast to room
      void publish({
        type: "ROOM_MESSAGE",
        userId: result.userId,
        payload: result as unknown,
      })

      // Remove optimistic, real message will come via query refetch
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
    } catch (error) {
      console.error("Failed to send message:", error)
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
      alert("Impossible d'envoyer le message")
    }
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-text-tertiary">Chargement...</div>
      </div>
    )
  }

  const onlineMemberIds = new Set(onlineMembers.map((m) => m.userId))

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => router.push("/salles")} className="shrink-0">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {room.badge && <span className="text-lg">{room.badge}</span>}
                <h1 className="font-display text-base font-bold text-text-primary truncate">
                  {room.name}
                </h1>
                {room.type === "OFFICIAL" && (
                  <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan text-xs rounded-full shrink-0">
                    Officiel
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary">
                {room.memberCount} membre{room.memberCount > 1 ? "s" : ""} · {onlineMembers.length} en ligne
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
              title="Inviter un utilisateur"
            >
              <Users className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              onClick={() => alert("Paramètres - Story 6.6")}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl">💬</div>
            <p className="text-text-tertiary text-center">
              Aucun message. Soyez le premier à écrire !
            </p>
          </div>
        )}

        {allMessages.map((msg) => {
          const member = members?.find((m) => m.userId === msg.userId)
          const isOnline = onlineMemberIds.has(msg.userId)

          return (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                  {msg.userAvatar ? (
                    <img src={msg.userAvatar} alt={msg.userName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="text-text-secondary text-sm font-semibold">
                      {msg.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-primary rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-text-primary">{msg.userName}</span>
                  {member?.role === "OWNER" && <Crown className="w-3 h-3 text-accent-gold" />}
                  <span className="text-xs text-text-tertiary">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.metadata?.ticketId ? (
                  <TicketShareCard
                    matches={msg.metadata.matches ?? []}
                    totalOdds={msg.metadata.totalOdds ?? 1.0}
                    userName={msg.userName}
                    compact
                  />
                ) : (
                  <div className="bg-bg-secondary rounded-lg px-3 py-2 text-sm text-text-primary wrap-break-word">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-bg-secondary border-t border-bg-tertiary p-4">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowShareTicket(!showShareTicket)}
            className="p-3 bg-bg-tertiary hover:bg-bg-tertiary/70 rounded-lg transition-colors shrink-0"
            title="Partager un ticket"
          >
            <Share2 className="w-5 h-5 text-text-secondary" />
          </button>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSendMessage()
              }
            }}
            placeholder="Écrivez un message..."
            className={cn(
              "flex-1 bg-bg-tertiary text-text-primary rounded-lg px-4 py-3",
              "resize-none outline-none focus:ring-2 focus:ring-accent-cyan",
              "placeholder:text-text-tertiary text-sm max-h-32"
            )}
            rows={1}
          />
          <button
            onClick={() => void handleSendMessage()}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className={cn(
              "p-3 rounded-lg transition-colors shrink-0",
              messageInput.trim()
                ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
                : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {showShareTicket && (
          <div className="mt-3 p-3 bg-bg-tertiary rounded-lg text-sm text-text-secondary">
            Fonctionnalité de partage de ticket à venir...
          </div>
        )}
      </div>

      {/* Modals */}
      {showInviteModal && <InviteUserModal roomId={roomId} onClose={() => setShowInviteModal(false)} />}
    </div>
  )
}
