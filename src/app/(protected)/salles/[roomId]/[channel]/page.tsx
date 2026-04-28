"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import {
  Send, Pin, Reply, Pencil, Trash2, Search, X, Smile, Lock,
  Ticket, Plus, ChevronLeft, Archive, Hash, Clock, MessageSquare,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { useChannel, usePublish } from "~/lib/realtime/context"
import type { RealtimeMessage } from "~/lib/realtime/types"

// ── Types ──────────────────────────────────────────────────────────────────
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
  reactions: Record<string, string[]> | null
  mentions: string[]
  isPinned: boolean
  createdAt: Date
  editedAt: Date | null
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🔥", "👏"]

// ── Reaction Bar ───────────────────────────────────────────────────────────
function ReactionBar({ reactions, currentUserId, onToggle }: {
  reactions: Record<string, string[]>
  currentUserId: string
  onToggle: (emoji: string) => void
}) {
  const entries = Object.entries(reactions).filter(([, u]) => u.length > 0)
  if (!entries.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entries.map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all",
            users.includes(currentUserId)
              ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
              : "bg-bg-tertiary border-bg-tertiary text-text-secondary hover:border-bg-tertiary/60"
          )}
        >
          <span>{emoji}</span>
          <span>{users.length}</span>
        </button>
      ))}
    </div>
  )
}

// ── Message Item ───────────────────────────────────────────────────────────
function MessageItem({
  msg,
  isOwn,
  currentUserId,
  canModerate,
  onReply,
  onReact,
  onPin,
  onEdit,
  onDelete,
}: {
  msg: ChatMessage
  isOwn: boolean
  currentUserId: string
  canModerate: boolean
  onReply: (m: ChatMessage) => void
  onReact: (id: string, emoji: string) => void
  onPin: (id: string) => void
  onEdit: (m: ChatMessage) => void
  onDelete: (id: string) => void
}) {
  const [showActions, setShowActions] = React.useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  if (msg.type === "SYSTEM") {
    return (
      <div className="px-4 py-1 flex justify-center">
        <span className="text-xs text-text-tertiary italic">{msg.content}</span>
      </div>
    )
  }

  const initials = msg.userName.slice(0, 2).toUpperCase()

  return (
    <div
      className={cn("group relative flex gap-2 px-4 py-1", isOwn ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false) }}
    >
      {/* Avatar — only for others */}
      {!isOwn && (
        <div className="shrink-0 mt-0.5">
          {msg.userAvatar ? (
            <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-bold text-accent-cyan">
              {initials}
            </div>
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {/* Name + time */}
        {!isOwn && (
          <div className="flex items-baseline gap-2 mb-0.5 px-1">
            <span className="text-xs font-semibold text-text-primary">{msg.userName}</span>
            <span className="text-[10px] text-text-tertiary">
              {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words",
            isOwn
              ? "bg-accent-cyan text-bg-primary rounded-br-sm"
              : "bg-bg-secondary border border-bg-tertiary text-text-primary rounded-bl-sm"
          )}
        >
          {msg.content}
          {msg.editedAt && (
            <span className={cn("text-[10px] ml-1.5 opacity-60")}>modifié</span>
          )}
        </div>

        {/* Time for own messages */}
        {isOwn && (
          <span className="text-[10px] text-text-tertiary mt-0.5 px-1">
            {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}

        {/* Reactions */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <ReactionBar
            reactions={msg.reactions as Record<string, string[]>}
            currentUserId={currentUserId}
            onToggle={(emoji) => onReact(msg.id, emoji)}
          />
        )}
      </div>

      {/* Action toolbar */}
      {showActions && (
        <div
          className={cn(
            "absolute top-0 flex items-center gap-0.5 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-lg px-1 py-0.5 z-10",
            isOwn ? "left-2" : "right-2"
          )}
        >
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors"
            title="Réagir"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onReply(msg)}
            className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors"
            title="Répondre"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          {canModerate && (
            <button
              onClick={() => onPin(msg.id)}
              className="p-1 text-text-tertiary hover:text-accent-cyan rounded transition-colors"
              title="Épingler"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}
          {isOwn && (
            <button
              onClick={() => onEdit(msg)}
              className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors"
              title="Modifier"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {(isOwn || canModerate) && (
            <button
              onClick={() => onDelete(msg.id)}
              className="p-1 text-text-tertiary hover:text-red-400 rounded transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute top-7 left-0 bg-bg-secondary border border-bg-tertiary rounded-lg p-1.5 flex gap-1 z-20 shadow-xl">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact(msg.id, emoji); setShowEmojiPicker(false) }}
                  className="text-base hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Chat Input ─────────────────────────────────────────────────────────────
function ChatInput({
  onSend,
  disabled,
  disabledMsg,
  replyTo,
  onCancelReply,
  editValue,
  onCancelEdit,
}: {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  disabledMsg?: string
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  editValue?: string
  onCancelEdit?: () => void
}) {
  const [value, setValue] = React.useState(editValue ?? "")
  const [sending, setSending] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (editValue !== undefined) setValue(editValue)
  }, [editValue])

  async function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || sending || disabled) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue("")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  if (disabled) {
    return (
      <div className="px-4 py-3 border-t border-bg-tertiary">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-secondary border border-bg-tertiary text-text-tertiary text-sm">
          <Lock className="w-4 h-4 shrink-0" />
          {disabledMsg ?? "Lecture seule"}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-bg-tertiary">
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-bg-secondary rounded-lg border-l-2 border-accent-cyan">
          <Reply className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="text-xs text-text-secondary truncate flex-1">
            Répondre à <strong>{replyTo.userName}</strong>: {replyTo.content}
          </span>
          <button onClick={onCancelReply} className="text-text-tertiary hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {editValue !== undefined && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-bg-secondary rounded-lg border-l-2 border-yellow-500">
          <Pencil className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span className="text-xs text-text-secondary flex-1">Mode édition</span>
          <button onClick={onCancelEdit} className="text-text-tertiary hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Écrire un message..."
          className="flex-1 resize-none bg-bg-secondary border border-bg-tertiary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/50 transition-colors max-h-32 overflow-y-auto"
          style={{ height: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = "auto"
            el.style.height = Math.min(el.scrollHeight, 128) + "px"
          }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending}
          className="shrink-0 p-2.5 rounded-xl bg-accent-cyan text-bg-primary disabled:opacity-40 hover:bg-accent-cyan/80 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Channel Chat (General / Annonce) ────────────────────────────────────────
function ChannelChat({
  roomId,
  channelId,
  channelName,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  myRole,
  ownerId,
  readOnly,
}: {
  roomId: string
  channelId: string
  channelName: string
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  myRole: string | null
  ownerId: string
  readOnly: boolean
}) {
  const utils = api.useUtils()
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null)
  const [editingMsg, setEditingMsg] = React.useState<ChatMessage | null>(null)

  const { data, refetch } = api.room.getMessages.useQuery(
    { roomId, channelId, limit: 50 },
    { refetchInterval: 2000, refetchIntervalInBackground: false }
  )

  const sendMutation = api.room.sendMessage.useMutation()
  const editMutation = api.room.editMessage.useMutation()
  const deleteMutation = api.room.deleteMessage.useMutation()
  const reactionMutation = api.room.toggleReaction.useMutation()
  const pinMutation = api.room.pinMessage.useMutation()

  // Publish realtime typing / message events
  usePublish(channelId)
  useChannel(channelId, (msg: RealtimeMessage) => {
    if (msg.userId !== currentUserId) void refetch()
  })

  const dbMessages = (data?.messages ?? []) as ChatMessage[]
  const dbIds = React.useMemo(() => new Set(dbMessages.map((m) => m.id)), [dbMessages])
  const allMessages = React.useMemo(
    () => [...dbMessages, ...optimisticMessages.filter((m) => !dbIds.has(m.id))],
    [dbMessages, optimisticMessages, dbIds]
  )

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages.length])

  const canModerate = currentUserId === ownerId || myRole === "OWNER" || myRole === "ADMIN"

  async function handleSend(content: string) {
    if (editingMsg) {
      await editMutation.mutateAsync({ messageId: editingMsg.id, content })
      setEditingMsg(null)
      void refetch()
      return
    }
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      roomId,
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar ?? null,
      type: "TEXT",
      content,
      agentId: null,
      replyToId: replyTo?.id ?? null,
      reactions: null,
      mentions: [],
      isPinned: false,
      createdAt: new Date(),
      editedAt: null,
    }
    setOptimisticMessages((prev) => [...prev, optimistic])
    setReplyTo(null)
    try {
      await sendMutation.mutateAsync({
        roomId,
        channelId,
        content,
        replyToId: replyTo?.id,
      })
    } finally {
      void refetch()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-tertiary shrink-0">
        <Hash className="w-4 h-4 text-text-tertiary" />
        <h2 className="font-semibold text-text-primary text-sm">{channelName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {allMessages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            isOwn={msg.userId === currentUserId}
            currentUserId={currentUserId}
            canModerate={canModerate}
            onReply={setReplyTo}
            onReact={(id, emoji) => {
              void reactionMutation.mutateAsync({ messageId: id, emoji }).then(() => refetch())
            }}
            onPin={(id) => {
              void pinMutation.mutateAsync({ messageId: id, pin: true }).then(() => refetch())
            }}
            onEdit={setEditingMsg}
            onDelete={(id) => {
              void deleteMutation.mutateAsync({ roomId, messageId: id }).then(() => refetch())
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={readOnly}
        disabledMsg="Seul le créateur peut écrire dans ce canal"
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editValue={editingMsg?.content}
        onCancelEdit={() => setEditingMsg(null)}
      />
    </div>
  )
}

// ── Analyse: Ticket List ───────────────────────────────────────────────────
function TicketList({
  channelId,
  roomId,
  currentUserId,
  onSelect,
}: {
  channelId: string
  roomId: string
  currentUserId: string
  onSelect: (ticket: { id: string; title: string; status: string }) => void
}) {
  const [showCreate, setShowCreate] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const utils = api.useUtils()

  const { data: tickets } = api.room.getTickets.useQuery(
    { channelId },
    { refetchInterval: 3000 }
  )

  const createMutation = api.room.createTicket.useMutation({
    onSuccess: () => {
      setNewTitle("")
      setShowCreate(false)
      void utils.room.getTickets.invalidate({ channelId })
    },
  })

  const openTickets = (tickets ?? []).filter((t) => t.status === "OPEN")
  const archivedTickets = (tickets ?? []).filter((t) => t.status === "ARCHIVED")

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-text-tertiary" />
          <h2 className="font-semibold text-text-primary text-sm">Analyse — Tickets</h2>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="px-4 py-3 border-b border-bg-tertiary bg-bg-secondary/50 shrink-0">
          <p className="text-xs font-semibold text-text-secondary mb-2">Titre du ticket</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (newTitle.trim()) {
                    createMutation.mutate({ roomId, channelId, title: newTitle.trim() })
                  }
                }
                if (e.key === "Escape") setShowCreate(false)
              }}
              placeholder="Ex: Match PSG vs Lyon - Analyse"
              className="flex-1 bg-bg-tertiary border border-bg-tertiary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/50"
            />
            <button
              disabled={!newTitle.trim() || createMutation.isPending}
              onClick={() => {
                if (newTitle.trim()) createMutation.mutate({ roomId, channelId, title: newTitle.trim() })
              }}
              className="px-3 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-medium disabled:opacity-40"
            >
              Créer
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="p-2 text-text-tertiary hover:text-text-primary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ticket list */}
      <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-2">
        {openTickets.length === 0 && archivedTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
            <Ticket className="w-8 h-8 text-text-tertiary/50" />
            <div>
              <p className="text-sm font-medium text-text-secondary">Aucun ticket</p>
              <p className="text-xs text-text-tertiary mt-0.5">Ouvre un ticket pour démarrer une analyse</p>
            </div>
          </div>
        )}

        {openTickets.length > 0 && (
          <>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">Ouverts</p>
            {openTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onSelect={onSelect} />
            ))}
          </>
        )}

        {archivedTickets.length > 0 && (
          <>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1 mt-3">Archivés</p>
            {archivedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onSelect={onSelect} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function TicketCard({
  ticket,
  onSelect,
}: {
  ticket: {
    id: string
    title: string
    status: string
    createdAt: Date
    author: { displayName: string | null; username: string; avatarUrl: string | null }
    _count: { messages: number }
  }
  onSelect: (ticket: { id: string; title: string; status: string }) => void
}) {
  const isOpen = ticket.status === "OPEN"
  return (
    <button
      onClick={() => onSelect(ticket)}
      className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-bg-tertiary hover:border-accent-cyan/30 hover:bg-bg-tertiary transition-all group"
    >
      <div className={cn(
        "mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
        isOpen ? "bg-accent-cyan/10" : "bg-bg-tertiary"
      )}>
        {isOpen
          ? <Ticket className="w-3.5 h-3.5 text-accent-cyan" />
          : <Archive className="w-3.5 h-3.5 text-text-tertiary" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">
          {ticket.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-tertiary">
            {ticket.author.displayName ?? ticket.author.username}
          </span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <MessageSquare className="w-3 h-3" />
            {ticket._count.messages}
          </span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">
            {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>
      {!isOpen && (
        <span className="shrink-0 text-[10px] font-medium text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">
          Archivé
        </span>
      )}
    </button>
  )
}

// ── Analyse: Ticket Chat ───────────────────────────────────────────────────
function TicketChat({
  roomId,
  channelId,
  ticket,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onBack,
}: {
  roomId: string
  channelId: string
  ticket: { id: string; title: string; status: string }
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  onBack: () => void
}) {
  const utils = api.useUtils()
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])

  const { data, refetch } = api.room.getMessages.useQuery(
    { roomId, channelId, ticketId: ticket.id, limit: 100 },
    { refetchInterval: 2000, refetchIntervalInBackground: false }
  )

  const sendMutation = api.room.sendMessage.useMutation()
  const closeMutation = api.room.closeTicket.useMutation({
    onSuccess: () => {
      void utils.room.getTickets.invalidate({ channelId })
      onBack()
    },
  })

  useChannel(channelId, (msg: RealtimeMessage) => {
    if (msg.userId !== currentUserId) void refetch()
  })

  const dbMessages = (data?.messages ?? []) as ChatMessage[]
  const dbIds = React.useMemo(() => new Set(dbMessages.map((m) => m.id)), [dbMessages])
  const allMessages = React.useMemo(
    () => [...dbMessages, ...optimisticMessages.filter((m) => !dbIds.has(m.id))],
    [dbMessages, optimisticMessages, dbIds]
  )

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages.length])

  const isArchived = ticket.status === "ARCHIVED"

  async function handleSend(content: string) {
    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      roomId,
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar ?? null,
      type: "TEXT",
      content,
      agentId: null,
      replyToId: null,
      reactions: null,
      mentions: [],
      isPinned: false,
      createdAt: new Date(),
      editedAt: null,
    }
    setOptimisticMessages((prev) => [...prev, optimistic])
    try {
      await sendMutation.mutateAsync({ roomId, channelId, ticketId: ticket.id, content })
    } finally {
      void refetch()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-tertiary shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm truncate">{ticket.title}</h2>
        </div>
        {isArchived ? (
          <span className="text-xs font-medium text-text-tertiary bg-bg-tertiary px-2 py-1 rounded-full">
            Archivé
          </span>
        ) : (
          <button
            onClick={() => closeMutation.mutate({ ticketId: ticket.id })}
            disabled={closeMutation.isPending}
            className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-red-400 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            Fermer
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {allMessages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            isOwn={msg.userId === currentUserId}
            currentUserId={currentUserId}
            canModerate={false}
            onReply={() => {}}
            onReact={() => {}}
            onPin={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isArchived}
        disabledMsg="Ce ticket est archivé — lecture seule"
      />
    </div>
  )
}

// ── Analyse Channel ────────────────────────────────────────────────────────
function AnalyseChannel({
  roomId,
  channelId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: {
  roomId: string
  channelId: string
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
}) {
  const [activeTicket, setActiveTicket] = React.useState<{ id: string; title: string; status: string } | null>(null)

  if (activeTicket) {
    return (
      <TicketChat
        roomId={roomId}
        channelId={channelId}
        ticket={activeTicket}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        onBack={() => setActiveTicket(null)}
      />
    )
  }

  return (
    <TicketList
      channelId={channelId}
      roomId={roomId}
      currentUserId={currentUserId}
      onSelect={setActiveTicket}
    />
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ChannelPage() {
  const params = useParams<{ roomId: string; channel: string }>()
  const { roomId, channel } = params
  const router = useRouter()
  const { data: session, status } = useSession()

  const { data: room } = api.room.getById.useQuery(
    { roomId },
    { enabled: !!roomId }
  )

  const { data: channels } = api.room.getChannels.useQuery(
    { roomId },
    { enabled: !!roomId }
  )

  if (status === "loading") {
    return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Chargement...</div>
  }

  const currentUserId = session?.user?.id ?? ""
  const currentUserName = session?.user?.name ?? "Anonyme"
  const currentUserAvatar = session?.user?.image ?? undefined

  if (!room) {
    return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Salle introuvable</div>
  }

  if (!room.isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <Lock className="w-10 h-10 text-text-tertiary/50" />
        <div>
          <p className="font-semibold text-text-primary">Accès restreint</p>
          <p className="text-sm text-text-tertiary mt-1">Tu dois rejoindre cette salle pour accéder aux canaux</p>
        </div>
        <button
          onClick={() => router.push("/salles")}
          className="text-sm text-accent-cyan hover:underline"
        >
          Retour aux salles
        </button>
      </div>
    )
  }

  const activeChannel = channels?.find((ch) => ch.slug === channel)
  const myRole = room.myRole

  if (!activeChannel) {
    return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Canal introuvable</div>
  }

  // Analyse channel
  if (activeChannel.type === "ANALYSE") {
    return (
      <AnalyseChannel
        roomId={roomId}
        channelId={activeChannel.id}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />
    )
  }

  // General / Annonce — read-only for members
  const isReadOnly = myRole === "MEMBER"

  return (
    <ChannelChat
      roomId={roomId}
      channelId={activeChannel.id}
      channelName={activeChannel.name}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      currentUserAvatar={currentUserAvatar}
      myRole={myRole}
      ownerId={room.ownerId}
      readOnly={isReadOnly}
    />
  )
}
