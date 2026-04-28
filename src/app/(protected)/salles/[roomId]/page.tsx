"use client"

import * as React from "react"
import { api } from "~/trpc/react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Send, Users, Settings, ArrowLeft, Crown, Share2, Pin, Reply, Pencil,
  Trash2, Search, X, Smile, ChevronDown, Lock,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { useChannel, useEnterPresence, usePublish } from "~/lib/realtime/context"
import type { RealtimeMessage, PresenceData } from "~/lib/realtime/types"
import { InviteUserModal } from "~/components/features/rooms/InviteUserModal"

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

// ── PinnedBanner ───────────────────────────────────────────────────────────
function PinnedBanner({
  message,
  canUnpin,
  onUnpin,
  onClick,
}: {
  message: { id: string; content: string; userName: string }
  canUnpin: boolean
  onUnpin: () => void
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/5 border-b border-accent-cyan/20 cursor-pointer hover:bg-accent-cyan/10 transition-colors"
    >
      <Pin className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-accent-cyan font-medium">Épinglé par {message.userName} · </span>
        <span className="text-xs text-text-secondary truncate">{message.content}</span>
      </div>
      {canUnpin && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnpin() }}
          className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── ReactionBar ────────────────────────────────────────────────────────────
function ReactionBar({
  reactions,
  currentUserId,
  onToggle,
}: {
  reactions: Record<string, string[]>
  currentUserId: string
  onToggle: (emoji: string) => void
}) {
  const entries = Object.entries(reactions).filter(([, users]) => users.length > 0)
  if (entries.length === 0) return null

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

// ── MessageItem ────────────────────────────────────────────────────────────
function MessageItem({
  message,
  replyParent,
  currentUserId,
  isOwner,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReact,
}: {
  message: ChatMessage
  replyParent?: ChatMessage | null
  currentUserId: string
  isOwner: boolean
  isAdmin: boolean
  onReply: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onDelete: (id: string) => void
  onPin: (id: string, pin: boolean) => void
  onReact: (id: string, emoji: string) => void
}) {
  const [showMenu, setShowMenu] = React.useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const isOwn = message.userId === currentUserId
  const canEdit = isOwn
  const canDelete = isOwn || isOwner || isAdmin
  const canPin = isOwner || isAdmin

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setShowEmojiPicker(false)
      }
    }
    if (showMenu || showEmojiPicker) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenu, showEmojiPicker])

  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-1.5 px-4">
        <span className="px-3 py-1 bg-bg-tertiary rounded-full text-xs text-text-tertiary">
          {message.content}
        </span>
      </div>
    )
  }

  const contentWithMentions = message.content.replace(
    /@(\w+)/g,
    '<span class="text-accent-cyan font-semibold">@$1</span>'
  )

  const time = new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  // ── Own message (right-aligned bubble) ──────────────────────────────────
  if (isOwn) {
    return (
      <div className="group flex flex-col items-end px-4 py-1 gap-1">
        {/* Reply parent */}
        {replyParent && (
          <div className="max-w-[75%] mr-1 pl-3 border-l-2 border-accent-cyan/40 text-xs text-text-tertiary line-clamp-1 text-right">
            <span className="font-semibold text-accent-cyan/80">{replyParent.userName}</span>{" "}
            {replyParent.content}
          </div>
        )}

        <div className="flex items-end gap-2 max-w-[80%]">
          {/* Actions (left of own bubble) */}
          <div ref={menuRef} className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => onReply(message)} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Répondre">
              <Reply className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button onClick={() => { setShowEmojiPicker((v) => !v); setShowMenu(false) }} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Réagir">
                <Smile className="w-3.5 h-3.5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute right-0 bottom-8 z-20 flex gap-1 p-2 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-lg">
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} onClick={() => { onReact(message.id, e); setShowEmojiPicker(false) }} className="text-base hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setShowMenu((v) => !v); setShowEmojiPicker(false) }} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Plus">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-8 z-20 w-36 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-lg overflow-hidden">
                  {canEdit && <button onClick={() => { onEdit(message); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-secondary hover:bg-bg-tertiary"><Pencil className="w-3.5 h-3.5" /> Modifier</button>}
                  {canPin && <button onClick={() => { onPin(message.id, !message.isPinned); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-secondary hover:bg-bg-tertiary"><Pin className="w-3.5 h-3.5" /> {message.isPinned ? "Désépingler" : "Épingler"}</button>}
                  {canDelete && <button onClick={() => { onDelete(message.id); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-accent-red hover:bg-accent-red/10"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>}
                </div>
              )}
            </div>
          </div>

          {/* Bubble */}
          <div className="flex flex-col items-end">
            <div className="bg-accent-cyan text-bg-primary rounded-2xl rounded-br-sm px-4 py-2.5 max-w-full">
              <div className="text-sm leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: contentWithMentions.replace(/class="text-accent-cyan/g, 'class="text-bg-primary/70 underline') }} />
            </div>
            <div className="flex items-center gap-1 mt-0.5 pr-1">
              {message.isPinned && <Pin className="w-2.5 h-2.5 text-accent-cyan" />}
              {message.editedAt && <span className="text-[10px] text-text-tertiary">modifié ·</span>}
              <span className="text-[10px] text-text-tertiary">{time}</span>
            </div>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && (
          <div className="mr-1">
            <ReactionBar reactions={message.reactions} currentUserId={currentUserId} onToggle={(e) => onReact(message.id, e)} />
          </div>
        )}
      </div>
    )
  }

  // ── Other's message (left-aligned bubble) ───────────────────────────────
  return (
    <div className="group flex flex-col items-start px-4 py-1 gap-1">
      {/* Reply parent */}
      {replyParent && (
        <div className="max-w-[75%] ml-11 pl-3 border-l-2 border-bg-tertiary text-xs text-text-tertiary line-clamp-1">
          <span className="font-semibold text-text-secondary">{replyParent.userName}</span>{" "}
          {replyParent.content}
        </div>
      )}

      <div className="flex items-end gap-2 max-w-[80%]">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
          {message.userAvatar ? (
            <img src={message.userAvatar} alt={message.userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-text-secondary text-xs font-bold">{message.userName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Bubble + meta */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-text-secondary mb-1 ml-1">{message.userName}</span>
          <div className="bg-bg-secondary border border-bg-tertiary text-text-primary rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-full">
            <div className="text-sm leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: contentWithMentions }} />
          </div>
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            {message.isPinned && <Pin className="w-2.5 h-2.5 text-accent-cyan" />}
            {message.editedAt && <span className="text-[10px] text-text-tertiary">modifié ·</span>}
            <span className="text-[10px] text-text-tertiary">{time}</span>
          </div>
        </div>

        {/* Actions (right of others' bubble) */}
        <div ref={menuRef} className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
          <button onClick={() => onReply(message)} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Répondre">
            <Reply className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button onClick={() => { setShowEmojiPicker((v) => !v); setShowMenu(false) }} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Réagir">
              <Smile className="w-3.5 h-3.5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 bottom-8 z-20 flex gap-1 p-2 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-lg">
                {QUICK_EMOJIS.map((e) => (
                  <button key={e} onClick={() => { onReact(message.id, e); setShowEmojiPicker(false) }} className="text-base hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setShowMenu((v) => !v); setShowEmojiPicker(false) }} className="p-1.5 bg-bg-secondary rounded-lg hover:bg-bg-tertiary text-text-tertiary" title="Plus">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute left-0 bottom-8 z-20 w-36 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-lg overflow-hidden">
                {canPin && <button onClick={() => { onPin(message.id, !message.isPinned); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-secondary hover:bg-bg-tertiary"><Pin className="w-3.5 h-3.5" /> {message.isPinned ? "Désépingler" : "Épingler"}</button>}
                {canDelete && <button onClick={() => { onDelete(message.id); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-accent-red hover:bg-accent-red/10"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reactions */}
      {message.reactions && (
        <div className="ml-10">
          <ReactionBar reactions={message.reactions} currentUserId={currentUserId} onToggle={(e) => onReact(message.id, e)} />
        </div>
      )}
    </div>
  )
}

// ── MentionInput ────────────────────────────────────────────────────────────
function MentionInput({
  value,
  onChange,
  onSend,
  members,
  isPending,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  members: { userId: string; userName: string }[]
  isPending: boolean
  disabled?: boolean
}) {
  const [mentionSearch, setMentionSearch] = React.useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = React.useState(0)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const filteredMembers = mentionSearch !== null
    ? members.filter((m) => m.userName.toLowerCase().includes(mentionSearch.toLowerCase())).slice(0, 5)
    : []

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    onChange(val)

    // Detect @mention
    const match = /@(\w*)$/.exec(val.slice(0, e.target.selectionStart))
    if (match) {
      setMentionSearch(match[1] ?? "")
      setMentionIndex(0)
    } else {
      setMentionSearch(null)
    }
  }

  const insertMention = (userName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const pos = textarea.selectionStart
    const before = value.slice(0, pos).replace(/@\w*$/, `@${userName} `)
    const after = value.slice(pos)
    onChange(before + after)
    setMentionSearch(null)
    textarea.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionSearch !== null && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => (i + 1) % filteredMembers.length) }
      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((i) => (i - 1 + filteredMembers.length) % filteredMembers.length) }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const m = filteredMembers[mentionIndex]
        if (m) insertMention(m.userName)
        return
      }
      if (e.key === "Escape") { setMentionSearch(null); return }
    }
    if (e.key === "Enter" && !e.shiftKey && !mentionSearch) {
      e.preventDefault()
      if (!isPending && value.trim()) onSend()
    }
  }

  return (
    <div className="relative">
      {/* Mention dropdown */}
      {mentionSearch !== null && filteredMembers.length > 0 && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-bg-secondary border border-bg-tertiary rounded-xl overflow-hidden shadow-lg z-10">
          {filteredMembers.map((m, i) => (
            <button
              key={m.userId}
              onClick={() => insertMention(m.userName)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left transition-colors",
                i === mentionIndex ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-semibold text-accent-cyan">
                {m.userName.charAt(0).toUpperCase()}
              </div>
              @{m.userName}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isPending}
          placeholder={disabled ? "Rejoignez la salle pour écrire..." : "Écrivez un message... (@mention)"}
          className={cn(
            "flex-1 bg-bg-tertiary text-text-primary rounded-xl px-4 py-3",
            "resize-none outline-none focus:ring-2 focus:ring-accent-cyan",
            "placeholder:text-text-tertiary text-sm max-h-32",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          rows={1}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || isPending || disabled}
          className={cn(
            "p-3 rounded-xl transition-colors shrink-0",
            value.trim() && !disabled
              ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ── SearchPanel ─────────────────────────────────────────────────────────────
function SearchPanel({
  roomId,
  onClose,
  onJumpTo,
}: {
  roomId: string
  onClose: () => void
  onJumpTo: (id: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { data: results, isLoading } = api.room.searchMessages.useQuery(
    { roomId, query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  )

  return (
    <div className="absolute inset-0 z-30 bg-bg-primary flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-tertiary">
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans la salle..."
            className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-cyan border border-bg-tertiary"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-bg-secondary rounded-xl animate-pulse" />)}
          </div>
        )}
        {results?.map((r) => (
          <button
            key={r.id}
            onClick={() => { onJumpTo(r.id); onClose() }}
            className="w-full text-left px-4 py-3 hover:bg-bg-secondary transition-colors border-b border-bg-tertiary/50"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-text-primary">{r.userName}</span>
              <span className="text-xs text-text-tertiary">
                {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm text-text-secondary line-clamp-2">{r.content}</p>
          </button>
        ))}
        {results?.length === 0 && debouncedQuery.length >= 2 && (
          <div className="flex flex-col items-center py-12 gap-2 text-text-tertiary">
            <Search className="w-8 h-8" />
            <p className="text-sm">Aucun résultat</p>
          </div>
        )}
        {debouncedQuery.length < 2 && (
          <div className="flex flex-col items-center py-12 gap-2 text-text-tertiary">
            <p className="text-sm">Tapez au moins 2 caractères</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function RoomChatPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const { data: session } = useSession()

  const currentUserId = (session?.user as { id?: string })?.id ?? ""
  const currentUserName = session?.user?.name ?? "Vous"
  const currentUserAvatar = session?.user?.image ?? null

  // State
  const [messageInput, setMessageInput] = React.useState("")
  const [replyingTo, setReplyingTo] = React.useState<ChatMessage | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editContent, setEditContent] = React.useState("")
  const [onlineMembers, setOnlineMembers] = React.useState<PresenceData[]>([])
  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])
  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const [showSearch, setShowSearch] = React.useState(false)
  const [highlightId, setHighlightId] = React.useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [typingUsers, setTypingUsers] = React.useState<string[]>([])
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const messagesTopRef = React.useRef<HTMLDivElement>(null)
  const messageRefs = React.useRef<Map<string, HTMLDivElement>>(new Map())

  // Queries
  const { data: room, isLoading: roomLoading } = api.room.getById.useQuery({ roomId })
  const { data: messagesData, refetch: refetchMessages, fetchNextPage, hasNextPage } =
    api.room.getMessages.useQuery({ roomId, limit: 40 }) as {
      data: { messages: ChatMessage[]; nextCursor?: string } | undefined
      refetch: () => void
      fetchNextPage?: () => void
      hasNextPage?: boolean
    }
  const { data: members = [] } = api.room.getMembers.useQuery({ roomId }, { enabled: !!room?.isMember })
  const { data: pinnedMessage, refetch: refetchPinned } = api.room.getPinnedMessage.useQuery({ roomId }, { enabled: !!room?.isMember })

  // Mutations
  const sendMessageMutation = api.room.sendMessage.useMutation({
    onSuccess: () => { void refetchMessages() },
  })
  const editMessageMutation = api.room.editMessage.useMutation({
    onSuccess: () => { void refetchMessages(); setEditingId(null) },
  })
  const toggleReactionMutation = api.room.toggleReaction.useMutation({
    onSuccess: () => void refetchMessages(),
  })
  const pinMessageMutation = api.room.pinMessage.useMutation({
    onSuccess: () => { void refetchMessages(); void refetchPinned() },
  })
  const deleteMessageMutation = api.room.deleteMessage.useMutation({
    onSuccess: () => void refetchMessages(),
  })
  const markAsReadMutation = api.room.markAsRead.useMutation()
  const joinMutation = api.room.joinViaInvite.useMutation({
    onSuccess: () => window.location.reload(),
  })

  // Realtime
  const publish = usePublish(`room:${roomId}`)
  useEnterPresence(`room:${roomId}`, {
    userId: currentUserId,
    userName: currentUserName,
    userAvatar: currentUserAvatar ?? undefined,
    status: "online",
  })

  const handlePresenceUpdate = React.useCallback((pm: PresenceData[]) => setOnlineMembers(pm), [])

  const handleRealtimeMessage = React.useCallback((msg: RealtimeMessage) => {
    if (msg.type === "ROOM_MESSAGE" && msg.payload) {
      setOptimisticMessages((prev) => [...prev, msg.payload as ChatMessage])
    }
    if (msg.type === "TYPING" && msg.userId !== currentUserId) {
      setTypingUsers((prev) => prev.includes(msg.userId) ? prev : [...prev, msg.userId])
      setTimeout(() => setTypingUsers((prev) => prev.filter((id) => id !== msg.userId)), 3000)
    }
  }, [currentUserId])

  useChannel(`room:${roomId}`, handleRealtimeMessage, handlePresenceUpdate)

  // Mark as read on focus
  React.useEffect(() => {
    if (room?.isMember) {
      markAsReadMutation.mutate({ roomId })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, room?.isMember])

  // Scroll to bottom on new messages
  const allMessages = React.useMemo<ChatMessage[]>(() => {
    const db = (messagesData?.messages ?? []) as ChatMessage[]
    return [...db, ...optimisticMessages]
  }, [messagesData?.messages, optimisticMessages])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages.length])

  // Jump to message
  const jumpToMessage = (id: string) => {
    setHighlightId(id)
    const el = messageRefs.current.get(id)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
    setTimeout(() => setHighlightId(null), 2000)
  }

  // Typing indicator
  const broadcastTyping = () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    void publish({ type: "TYPING", userId: currentUserId, payload: null })
    typingTimeout.current = setTimeout(() => { typingTimeout.current = null }, 2500)
  }

  // Send message
  const handleSend = async () => {
    const content = messageInput.trim()
    if (!content) return

    const tempId = `temp-${Date.now()}`
    const tempMsg: ChatMessage = {
      id: tempId,
      roomId,
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      type: "TEXT",
      content,
      agentId: null,
      replyToId: replyingTo?.id ?? null,
      reactions: null,
      mentions: [],
      isPinned: false,
      createdAt: new Date(),
      editedAt: null,
    }

    setOptimisticMessages((prev) => [...prev, tempMsg])
    setMessageInput("")
    setReplyingTo(null)

    try {
      const result = await sendMessageMutation.mutateAsync({
        roomId,
        content,
        type: "TEXT",
        replyToId: replyingTo?.id,
      })
      void publish({ type: "ROOM_MESSAGE", userId: result.userId, payload: result as unknown })
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId))
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  // Edit message
  const handleEdit = async () => {
    if (!editingId || !editContent.trim()) return
    await editMessageMutation.mutateAsync({ messageId: editingId, content: editContent.trim() })
  }

  // Loading state
  if (roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-text-tertiary">Chargement...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary gap-4">
        <p className="text-text-tertiary">Salle introuvable</p>
        <button onClick={() => router.push("/salles")} className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-semibold">
          Retour
        </button>
      </div>
    )
  }

  // Not member — public room: show join gate
  if (!room.isMember) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <header className="sticky top-0 z-20 bg-bg-secondary border-b border-bg-tertiary px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/salles")}><ArrowLeft className="w-5 h-5 text-text-secondary" /></button>
          <h1 className="font-display text-base font-bold text-text-primary truncate">{room.name}</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <Lock className="w-12 h-12 text-text-tertiary" />
          <h2 className="font-display text-xl text-text-primary">Rejoindre la salle</h2>
          <p className="text-text-tertiary text-center max-w-sm">
            {room.visibility === "PUBLIC"
              ? "Rejoignez cette salle pour lire et envoyer des messages."
              : "Cette salle est privée. Vous devez être invité par le créateur."}
          </p>
          {room.visibility === "PUBLIC" && (
            <button
              onClick={() => joinMutation.mutate({ roomId })}
              disabled={joinMutation.isPending}
              className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              {joinMutation.isPending ? "Rejoindre..." : "Rejoindre la salle"}
            </button>
          )}
        </div>
      </div>
    )
  }

  const isOwner = room.myRole === "OWNER"
  const isAdmin = room.myRole === "ADMIN" || isOwner
  const onlineCount = onlineMembers.length
  const typingNames = typingUsers
    .map((id) => members.find((m) => m.userId === id)?.userName)
    .filter(Boolean)

  // Build message map for reply lookup
  const messageMap = new Map(allMessages.map((m) => [m.id, m]))

  return (
    <div className="flex flex-col h-screen bg-bg-primary relative">
      {/* Search overlay */}
      {showSearch && (
        <SearchPanel
          roomId={roomId}
          onClose={() => setShowSearch(false)}
          onJumpTo={jumpToMessage}
        />
      )}

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
                <h1 className="font-display text-base font-bold text-text-primary truncate">{room.name}</h1>
                {room.type === "OFFICIAL" && (
                  <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan text-xs rounded-full shrink-0">Officiel</span>
                )}
              </div>
              <p className="text-xs text-text-tertiary">
                {room.memberCount} membre{room.memberCount > 1 ? "s" : ""}
                {onlineCount > 0 && ` · ${onlineCount} en ligne`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" title="Rechercher">
              <Search className="w-5 h-5 text-text-secondary" />
            </button>
            <button onClick={() => setShowInviteModal(true)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" title="Inviter">
              <Users className="w-5 h-5 text-text-secondary" />
            </button>
            {isAdmin && (
              <button onClick={() => {/* Settings modal TODO */}} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" title="Paramètres">
                <Settings className="w-5 h-5 text-text-secondary" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Pinned message */}
      {pinnedMessage && (
        <PinnedBanner
          message={pinnedMessage}
          canUnpin={isAdmin}
          onUnpin={() => pinMessageMutation.mutate({ messageId: pinnedMessage.id, pin: false })}
          onClick={() => jumpToMessage(pinnedMessage.id)}
        />
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto py-2">
        <div ref={messagesTopRef} />

        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div className="text-5xl">💬</div>
            <p className="text-text-tertiary text-center text-sm">Aucun message. Soyez le premier à écrire !</p>
          </div>
        )}

        {allMessages.map((msg) => (
          <div
            key={msg.id}
            ref={(el) => { if (el) messageRefs.current.set(msg.id, el) }}
            className={cn(
              "transition-colors duration-700",
              highlightId === msg.id && "bg-accent-cyan/10 rounded-xl"
            )}
          >
            {editingId === msg.id ? (
              <div className="px-4 py-2">
                <textarea
                  autoFocus
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-bg-tertiary text-text-primary rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-accent-cyan"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleEdit() }
                    if (e.key === "Escape") setEditingId(null)
                  }}
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={() => void handleEdit()} className="px-3 py-1 bg-accent-cyan text-bg-primary rounded-lg text-xs font-semibold">Sauvegarder</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-bg-tertiary text-text-secondary rounded-lg text-xs">Annuler</button>
                </div>
              </div>
            ) : (
              <MessageItem
                message={msg}
                replyParent={msg.replyToId ? (messageMap.get(msg.replyToId) ?? null) : null}
                currentUserId={currentUserId}
                isOwner={isOwner}
                isAdmin={isAdmin}
                onReply={(m) => setReplyingTo(m)}
                onEdit={(m) => { setEditingId(m.id); setEditContent(m.content) }}
                onDelete={(id) => deleteMessageMutation.mutate({ roomId, messageId: id })}
                onPin={(id, pin) => pinMessageMutation.mutate({ messageId: id, pin })}
                onReact={(id, emoji) => toggleReactionMutation.mutate({ messageId: id, emoji })}
              />
            )}
          </div>
        ))}

        {/* Typing indicator — WhatsApp style */}
        {typingNames.length > 0 && (
          <div className="flex items-end gap-2 px-4 py-1">
            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
              <span className="text-text-tertiary text-xs font-bold">
                {typingNames[0]?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary ml-1">
                {typingNames.join(", ")}
              </span>
              <div className="mt-0.5 bg-bg-secondary border border-bg-tertiary rounded-2xl rounded-bl-sm px-4 py-3 inline-flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Reply bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-bg-secondary border-t border-bg-tertiary flex items-center gap-3">
          <Reply className="w-4 h-4 text-accent-cyan shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-accent-cyan">{replyingTo.userName}</span>
            <p className="text-xs text-text-tertiary truncate">{replyingTo.content}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-text-tertiary hover:text-text-primary shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-bg-secondary border-t border-bg-tertiary px-4 py-3 safe-area-bottom">
        <MentionInput
          value={messageInput}
          onChange={(v) => { setMessageInput(v); broadcastTyping() }}
          onSend={() => void handleSend()}
          members={members.map((m) => ({ userId: m.userId, userName: m.userName }))}
          isPending={sendMessageMutation.isPending}
        />
      </div>

      {/* Modals */}
      {showInviteModal && <InviteUserModal roomId={roomId} onClose={() => setShowInviteModal(false)} />}
    </div>
  )
}
