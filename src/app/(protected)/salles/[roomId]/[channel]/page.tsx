"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import {
  Send, Pin, Reply, Pencil, Trash2, X, Smile, Lock,
  Ticket, Plus, ChevronLeft, Archive, Hash, MessageSquare,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { useChannel, usePublish } from "~/lib/realtime/context"
import type { RealtimeMessage } from "~/lib/realtime/types"
import { getEnabledAgents } from "~/lib/agents/config"
import { useMention } from "~/hooks/useAgentMention"
import type { AgentMetadata } from "~/lib/agents/types"

// ── Constants ──────────────────────────────────────────────────────────────
const ENABLED_AGENTS = getEnabledAgents()
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🔥", "👏"]

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

type MentionCandidate = {
  id: string
  name: string
  avatar: string | null
  emoji: string | null
  color: string | null
  description: string | null
  isAgent: boolean
}

// ── Agent mention detection ────────────────────────────────────────────────
function extractAgentMention(text: string): { agent: AgentMetadata; query: string } | null {
  for (const agent of ENABLED_AGENTS) {
    const prefix = `@${agent.name} `
    if (text.toLowerCase().startsWith(prefix.toLowerCase())) {
      return { agent, query: text.slice(prefix.length).trim() }
    }
    if (text.trim().toLowerCase() === `@${agent.name}`.toLowerCase()) {
      return { agent, query: "Donne-moi ton analyse sur ce sujet." }
    }
  }
  return null
}

// ── Typing Indicator ───────────────────────────────────────────────────────
function TypingIndicator({ names }: { names: string[] }) {
  if (!names.length) return null
  const label = names.length === 1
    ? `${names[0]} est en train d'écrire`
    : `${names.join(", ")} écrivent`
  return (
    <div className="flex items-center gap-2 px-4 py-1 h-6 shrink-0">
      <div className="flex gap-1">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
      <span className="text-xs text-text-tertiary italic">{label}…</span>
    </div>
  )
}

// ── Reaction Bar ───────────────────────────────────────────────────────────
function ReactionBar({ reactions, currentUserId, onToggle }: {
  reactions: Record<string, string[]>; currentUserId: string; onToggle: (e: string) => void
}) {
  const entries = Object.entries(reactions).filter(([, u]) => u.length > 0)
  if (!entries.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entries.map(([emoji, users]) => (
        <button key={emoji} onClick={() => onToggle(emoji)}
          className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all",
            users.includes(currentUserId)
              ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
              : "bg-bg-tertiary border-bg-tertiary text-text-secondary hover:border-accent-cyan/40"
          )}>
          <span>{emoji}</span><span>{users.length}</span>
        </button>
      ))}
    </div>
  )
}

// ── Agent Message Card ─────────────────────────────────────────────────────
function AgentMessageCard({ msg }: { msg: ChatMessage }) {
  const agent = ENABLED_AGENTS.find((a) => a.id === msg.agentId)
  const color = agent?.color ?? "#00D4FF"
  return (
    <div className="px-4 py-2">
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${color}50` }}>
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold" style={{ background: `${color}18`, color }}>
          <span className="text-base">{agent?.emoji ?? "🤖"}</span>
          <span>{agent?.name ?? msg.agentId}</span>
          <span className="text-[10px] opacity-60 ml-1">· {agent?.category}</span>
          <span className="ml-auto text-[10px] opacity-60">
            {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="px-3 py-2.5 text-sm text-text-primary bg-bg-secondary whitespace-pre-wrap leading-relaxed">
          {msg.content}
        </div>
      </div>
    </div>
  )
}

// ── Message Item ───────────────────────────────────────────────────────────
function MessageItem({ msg, isOwn, currentUserId, canModerate, onReply, onReact, onPin, onEdit, onDelete }: {
  msg: ChatMessage; isOwn: boolean; currentUserId: string; canModerate: boolean
  onReply: (m: ChatMessage) => void; onReact: (id: string, e: string) => void
  onPin: (id: string) => void; onEdit: (m: ChatMessage) => void; onDelete: (id: string) => void
}) {
  const [showActions, setShowActions] = React.useState(false)
  const [showEmoji, setShowEmoji] = React.useState(false)

  if (msg.type === "AGENT") return <AgentMessageCard msg={msg} />

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
      onMouseLeave={() => { setShowActions(false); setShowEmoji(false) }}
    >
      {!isOwn && (
        <div className="shrink-0 mt-0.5">
          {msg.userAvatar
            ? <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-bold text-accent-cyan">{initials}</div>
          }
        </div>
      )}
      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <div className="flex items-baseline gap-2 mb-0.5 px-1">
            <span className="text-xs font-semibold text-text-primary">{msg.userName}</span>
            <span className="text-[10px] text-text-tertiary">
              {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
        <div className={cn(
          "px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words",
          isOwn ? "bg-accent-cyan text-bg-primary rounded-br-sm" : "bg-bg-secondary border border-bg-tertiary text-text-primary rounded-bl-sm"
        )}>
          {msg.content}
          {msg.editedAt && <span className="text-[10px] ml-1.5 opacity-60">modifié</span>}
        </div>
        {isOwn && (
          <span className="text-[10px] text-text-tertiary mt-0.5 px-1">
            {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <ReactionBar reactions={msg.reactions as Record<string, string[]>} currentUserId={currentUserId} onToggle={(e) => onReact(msg.id, e)} />
        )}
      </div>
      {showActions && (
        <div className={cn(
          "absolute top-0 flex items-center gap-0.5 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-lg px-1 py-0.5 z-10",
          isOwn ? "left-2" : "right-2"
        )}>
          <button onClick={() => setShowEmoji(v => !v)} className="p-1 text-text-tertiary hover:text-text-primary rounded"><Smile className="w-3.5 h-3.5" /></button>
          <button onClick={() => onReply(msg)} className="p-1 text-text-tertiary hover:text-text-primary rounded"><Reply className="w-3.5 h-3.5" /></button>
          {canModerate && <button onClick={() => onPin(msg.id)} className="p-1 text-text-tertiary hover:text-accent-cyan rounded"><Pin className="w-3.5 h-3.5" /></button>}
          {isOwn && <button onClick={() => onEdit(msg)} className="p-1 text-text-tertiary hover:text-text-primary rounded"><Pencil className="w-3.5 h-3.5" /></button>}
          {(isOwn || canModerate) && <button onClick={() => onDelete(msg.id)} className="p-1 text-text-tertiary hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}
          {showEmoji && (
            <div className="absolute top-7 left-0 bg-bg-secondary border border-bg-tertiary rounded-lg p-1.5 flex gap-1 z-20 shadow-xl">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} onClick={() => { onReact(msg.id, e); setShowEmoji(false) }} className="text-base hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Mention Dropdown (agents + members unified) ────────────────────────────
function MentionDropdown({ items, selectedIndex, onSelect }: {
  items: MentionCandidate[]; selectedIndex: number; onSelect: (c: MentionCandidate) => void
}) {
  if (!items.length) return null
  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
      <div className="px-3 py-1.5 border-b border-bg-tertiary">
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Membres & Agents</p>
      </div>
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
            i === selectedIndex ? "bg-accent-cyan/10" : "hover:bg-bg-tertiary"
          )}
        >
          {item.isAgent ? (
            <span className="text-lg shrink-0">{item.emoji ?? "🤖"}</span>
          ) : item.avatar ? (
            <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent-cyan/20 flex items-center justify-center text-xs font-bold text-accent-cyan shrink-0">
              {item.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{item.name}</p>
            {item.isAgent && item.description && (
              <p className="text-xs text-text-tertiary truncate">{item.description}</p>
            )}
          </div>
          {item.isAgent && item.color && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${item.color}20`, color: item.color }}>
              Agent
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Unified Chat Input ─────────────────────────────────────────────────────
function ChatInput({ roomId, onSend, disabled, disabledMsg, replyTo, onCancelReply, editValue, onCancelEdit, onTyping, isInvoking }: {
  roomId: string
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  disabledMsg?: string
  replyTo?: ChatMessage | null
  onCancelReply?: () => void
  editValue?: string
  onCancelEdit?: () => void
  onTyping?: () => void
  isInvoking?: boolean
}) {
  const [value, setValue] = React.useState(editValue ?? "")
  const [sending, setSending] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const lastTypingRef = React.useRef(0)

  React.useEffect(() => { if (editValue !== undefined) setValue(editValue) }, [editValue])

  const { data: members } = api.room.getMembers.useQuery({ roomId })
  const candidates = React.useMemo<MentionCandidate[]>(
    () => (members ?? []).map((m) => ({
      id: m.userId,
      name: m.userName,
      avatar: m.userAvatar,
      emoji: m.agentEmoji ?? null,
      color: m.agentColor ?? null,
      description: m.agentDescription ?? null,
      isAgent: m.isAgent,
    })),
    [members]
  )

  const { isOpen, filteredItems, selectedIndex, handleKeyDown, handleInput, selectItem, closeDropdown } =
    useMention<MentionCandidate>(candidates, (candidate) => {
      const el = textareaRef.current
      if (!el) return
      const text = value
      const cursor = el.selectionStart ?? text.length
      const before = text.substring(0, cursor)
      const atIdx = before.lastIndexOf("@")
      if (atIdx === -1) return
      const newText = text.substring(0, atIdx) + `@${candidate.name} ` + text.substring(cursor)
      setValue(newText)
      setTimeout(() => {
        el.focus()
        const pos = atIdx + candidate.name.length + 2
        el.setSelectionRange(pos, pos)
      }, 0)
    })

  async function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || sending || disabled) return
    setSending(true)
    try {
      await onSend(trimmed)
      setValue("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    } finally {
      setSending(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setValue(v)
    handleInput(v, e.target.selectionStart ?? v.length)
    const now = Date.now()
    if (onTyping && now - lastTypingRef.current > 2000) { lastTypingRef.current = now; onTyping() }
  }

  if (disabled) {
    return (
      <div className="px-4 py-3 border-t border-bg-tertiary shrink-0">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-secondary border border-bg-tertiary text-text-tertiary text-sm">
          <Lock className="w-4 h-4 shrink-0" />
          {disabledMsg ?? "Lecture seule"}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-bg-tertiary shrink-0">
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-bg-secondary rounded-lg border-l-2 border-accent-cyan">
          <Reply className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="text-xs text-text-secondary truncate flex-1">Répondre à <strong>{replyTo.userName}</strong>: {replyTo.content}</span>
          <button onClick={onCancelReply} className="text-text-tertiary hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {editValue !== undefined && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-bg-secondary rounded-lg border-l-2 border-yellow-500">
          <Pencil className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span className="text-xs text-text-secondary flex-1">Mode édition</span>
          <button onClick={onCancelEdit} className="text-text-tertiary hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <div className="relative flex items-end gap-2">
        {isOpen && filteredItems.length > 0 && (
          <MentionDropdown items={filteredItems} selectedIndex={selectedIndex} onSelect={selectItem} />
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (isOpen) {
              handleKeyDown(e)
              if (["ArrowUp", "ArrowDown", "Tab"].includes(e.key)) return
            }
            if (e.key === "Escape" && isOpen) { closeDropdown(); return }
            if (e.key === "Enter" && !e.shiftKey && !isOpen) { e.preventDefault(); void handleSend() }
          }}
          rows={1}
          placeholder="Écrire un message… tapez @ pour mentionner"
          className="flex-1 resize-none bg-bg-secondary border border-bg-tertiary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/50 transition-colors max-h-32 overflow-y-auto"
          onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 128) + "px" }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || isInvoking}
          className="shrink-0 p-2.5 rounded-xl bg-accent-cyan text-bg-primary disabled:opacity-40 hover:bg-accent-cyan/80 transition-colors"
        >
          {isInvoking ? (
            <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

// ── Typing users hook ──────────────────────────────────────────────────────
function useTypingUsers(currentUserId: string) {
  const [typingUsers, setTypingUsers] = React.useState<Map<string, { name: string; at: number }>>(new Map())
  React.useEffect(() => {
    const t = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now(); const next = new Map(prev)
        for (const [id, data] of next) { if (now - data.at > 3000) next.delete(id) }
        return next.size !== prev.size ? next : prev
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const addTyping = React.useCallback((userId: string, name: string) => {
    if (userId === currentUserId) return
    setTypingUsers((prev) => { const next = new Map(prev); next.set(userId, { name, at: Date.now() }); return next })
  }, [currentUserId])
  const names = React.useMemo(() => [...typingUsers.values()].map((u) => u.name), [typingUsers])
  return { names, addTyping }
}

// ── Channel Chat (General / Annonce) ────────────────────────────────────────
function ChannelChat({ roomId, channelId, channelName, currentUserId, currentUserName, currentUserAvatar, myRole, ownerId, readOnly }: {
  roomId: string; channelId: string; channelName: string
  currentUserId: string; currentUserName: string; currentUserAvatar?: string
  myRole: string | null; ownerId: string; readOnly: boolean
}) {
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null)
  const [editingMsg, setEditingMsg] = React.useState<ChatMessage | null>(null)
  const { names: typingNames, addTyping } = useTypingUsers(currentUserId)
  const publish = usePublish(channelId)

  const { data, refetch } = api.room.getMessages.useQuery(
    { roomId, channelId, limit: 50 },
    { refetchInterval: 1000, refetchIntervalInBackground: false, staleTime: 0 }
  )
  const sendMutation = api.room.sendMessage.useMutation()
  const editMutation = api.room.editMessage.useMutation()
  const deleteMutation = api.room.deleteMessage.useMutation()
  const reactionMutation = api.room.toggleReaction.useMutation()
  const pinMutation = api.room.pinMessage.useMutation()
  const invokeAgentMutation = api.room.invokeAgentInRoom.useMutation()

  useChannel(channelId, (msg: RealtimeMessage) => {
    if (msg.type === "TYPING") { addTyping(msg.userId, msg.content ?? msg.userId); return }
    if (msg.userId !== currentUserId) void refetch()
  })

  const dbMessages = (data?.messages ?? []) as ChatMessage[]
  const dbIds = React.useMemo(() => new Set(dbMessages.map((m) => m.id)), [dbMessages])
  const allMessages = React.useMemo(
    () => [...dbMessages, ...optimisticMessages.filter((m) => !dbIds.has(m.id))],
    [dbMessages, optimisticMessages, dbIds]
  )
  const prevLen = React.useRef(0)
  React.useEffect(() => {
    if (allMessages.length > prevLen.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    prevLen.current = allMessages.length
  }, [allMessages.length])

  const canModerate = currentUserId === ownerId || myRole === "OWNER" || myRole === "ADMIN"

  async function handleSend(content: string) {
    if (editingMsg) {
      await editMutation.mutateAsync({ messageId: editingMsg.id, content })
      setEditingMsg(null); void refetch(); return
    }
    const optId = `opt-${Date.now()}`
    setOptimisticMessages((prev) => [...prev, {
      id: optId, roomId, userId: currentUserId, userName: currentUserName,
      userAvatar: currentUserAvatar ?? null, type: "TEXT", content,
      agentId: null, replyToId: replyTo?.id ?? null,
      reactions: null, mentions: [], isPinned: false, createdAt: new Date(), editedAt: null,
    }])
    setReplyTo(null)
    try {
      await sendMutation.mutateAsync({ roomId, channelId, content, replyToId: replyTo?.id })
      await refetch(); setOptimisticMessages([])
      const mention = extractAgentMention(content)
      if (mention) {
        await invokeAgentMutation.mutateAsync({ roomId, channelId, agentId: mention.agent.id, query: mention.query })
        await refetch()
      }
    } catch { setOptimisticMessages((prev) => prev.filter((m) => m.id !== optId)) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-tertiary shrink-0">
        <Hash className="w-4 h-4 text-text-tertiary" />
        <h2 className="font-semibold text-text-primary text-sm">{channelName}</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {allMessages.map((msg) => (
          <MessageItem key={msg.id} msg={msg} isOwn={msg.userId === currentUserId}
            currentUserId={currentUserId} canModerate={canModerate} onReply={setReplyTo}
            onReact={(id, e) => void reactionMutation.mutateAsync({ messageId: id, emoji: e }).then(() => refetch())}
            onPin={(id) => void pinMutation.mutateAsync({ messageId: id, pin: true }).then(() => refetch())}
            onEdit={setEditingMsg}
            onDelete={(id) => void deleteMutation.mutateAsync({ roomId, messageId: id }).then(() => refetch())}
          />
        ))}
        {invokeAgentMutation.isPending && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <span className="text-xs text-text-tertiary italic">L'agent analyse…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <TypingIndicator names={typingNames} />
      <ChatInput
        roomId={roomId}
        onSend={handleSend}
        disabled={readOnly}
        disabledMsg="Seul le créateur peut écrire dans ce canal"
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editValue={editingMsg?.content}
        onCancelEdit={() => setEditingMsg(null)}
        onTyping={() => publish({ userId: currentUserId, type: "TYPING", content: currentUserName })}
        isInvoking={invokeAgentMutation.isPending}
      />
    </div>
  )
}

// ── Ticket Card ────────────────────────────────────────────────────────────
function TicketCard({ ticket, onSelect }: {
  ticket: { id: string; title: string; status: string; createdAt: Date
    author: { displayName: string | null; username: string; avatarUrl: string | null }
    _count: { messages: number } }
  onSelect: (t: { id: string; title: string; status: string }) => void
}) {
  const isOpen = ticket.status === "OPEN"
  return (
    <button onClick={() => onSelect(ticket)}
      className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-bg-tertiary hover:border-accent-cyan/30 hover:bg-bg-tertiary transition-all group">
      <div className={cn("mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
        isOpen ? "bg-accent-cyan/10" : "bg-bg-tertiary")}>
        {isOpen ? <Ticket className="w-3.5 h-3.5 text-accent-cyan" /> : <Archive className="w-3.5 h-3.5 text-text-tertiary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">{ticket.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-tertiary">{ticket.author.displayName ?? ticket.author.username}</span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="flex items-center gap-1 text-xs text-text-tertiary"><MessageSquare className="w-3 h-3" />{ticket._count.messages}</span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</span>
        </div>
      </div>
      {!isOpen && <span className="shrink-0 text-[10px] font-medium text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">Archivé</span>}
    </button>
  )
}

// ── Ticket List ────────────────────────────────────────────────────────────
function TicketList({ channelId, roomId, onSelect }: {
  channelId: string; roomId: string
  onSelect: (t: { id: string; title: string; status: string }) => void
}) {
  const utils = api.useUtils()
  const [showCreate, setShowCreate] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")

  const { data: tickets } = api.room.getTickets.useQuery({ channelId }, { refetchInterval: 3000, staleTime: 0 })
  const createMutation = api.room.createTicket.useMutation({
    onSuccess: (ticket) => {
      setNewTitle(""); setShowCreate(false)
      void utils.room.getTickets.invalidate({ channelId })
      onSelect(ticket)
    },
  })

  const open = (tickets ?? []).filter((t) => t.status === "OPEN")
  const archived = (tickets ?? []).filter((t) => t.status === "ARCHIVED")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary shrink-0">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-text-tertiary" />
          <h2 className="font-semibold text-text-primary text-sm">Analyse — Tickets</h2>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors">
          <Plus className="w-4 h-4" />Nouveau
        </button>
      </div>

      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out shrink-0",
        showCreate ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
        <div className="px-4 py-3 border-b border-bg-tertiary bg-bg-secondary/50">
          <div className="flex gap-2">
            <input autoFocus={showCreate} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) createMutation.mutate({ roomId, channelId, title: newTitle.trim() })
                if (e.key === "Escape") setShowCreate(false)
              }}
              placeholder="Titre du ticket…"
              className="flex-1 bg-bg-tertiary border border-bg-tertiary rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan/50" />
            <button disabled={!newTitle.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate({ roomId, channelId, title: newTitle.trim() })}
              className="px-3 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-medium disabled:opacity-40">
              Créer
            </button>
            <button onClick={() => setShowCreate(false)} className="p-2 text-text-tertiary hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-2">
        {open.length === 0 && archived.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
            <Ticket className="w-8 h-8 text-text-tertiary/50" />
            <div>
              <p className="text-sm font-medium text-text-secondary">Aucun ticket</p>
              <p className="text-xs text-text-tertiary mt-0.5">Ouvre un ticket pour commencer une analyse</p>
            </div>
          </div>
        )}
        {open.length > 0 && (
          <><p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1">Ouverts</p>
            {open.map((t) => <TicketCard key={t.id} ticket={t} onSelect={onSelect} />)}
          </>
        )}
        {archived.length > 0 && (
          <><p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-1 mt-3">Archivés</p>
            {archived.map((t) => <TicketCard key={t.id} ticket={t} onSelect={onSelect} />)}
          </>
        )}
      </div>
    </div>
  )
}

// ── Ticket Chat ────────────────────────────────────────────────────────────
function TicketChat({ roomId, channelId, ticket, currentUserId, currentUserName, currentUserAvatar, onBack }: {
  roomId: string; channelId: string; ticket: { id: string; title: string; status: string }
  currentUserId: string; currentUserName: string; currentUserAvatar?: string; onBack: () => void
}) {
  const utils = api.useUtils()
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = React.useState<ChatMessage[]>([])
  const { names: typingNames, addTyping } = useTypingUsers(currentUserId)
  const publish = usePublish(channelId)

  const { data, refetch } = api.room.getMessages.useQuery(
    { roomId, channelId, ticketId: ticket.id, limit: 100 },
    { refetchInterval: 1000, refetchIntervalInBackground: false, staleTime: 0 }
  )
  const sendMutation = api.room.sendMessage.useMutation()
  const invokeAgentMutation = api.room.invokeAgentInRoom.useMutation()
  const closeMutation = api.room.closeTicket.useMutation({
    onSuccess: () => { void utils.room.getTickets.invalidate({ channelId }); onBack() },
  })

  useChannel(channelId, (msg: RealtimeMessage) => {
    if (msg.type === "TYPING") { addTyping(msg.userId, msg.content ?? msg.userId); return }
    if (msg.userId !== currentUserId) void refetch()
  })

  const dbMessages = (data?.messages ?? []) as ChatMessage[]
  const dbIds = React.useMemo(() => new Set(dbMessages.map((m) => m.id)), [dbMessages])
  const allMessages = React.useMemo(
    () => [...dbMessages, ...optimisticMessages.filter((m) => !dbIds.has(m.id))],
    [dbMessages, optimisticMessages, dbIds]
  )
  const prevLen = React.useRef(0)
  React.useEffect(() => {
    if (allMessages.length > prevLen.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    prevLen.current = allMessages.length
  }, [allMessages.length])

  const isArchived = ticket.status === "ARCHIVED"

  async function handleSend(content: string) {
    const optId = `opt-${Date.now()}`
    setOptimisticMessages((prev) => [...prev, {
      id: optId, roomId, userId: currentUserId, userName: currentUserName,
      userAvatar: currentUserAvatar ?? null, type: "TEXT", content,
      agentId: null, replyToId: null, reactions: null, mentions: [], isPinned: false,
      createdAt: new Date(), editedAt: null,
    }])
    const mention = extractAgentMention(content)
    try {
      await sendMutation.mutateAsync({ roomId, channelId, ticketId: ticket.id, content })
      await refetch()
      setOptimisticMessages([])
      if (mention) {
        await invokeAgentMutation.mutateAsync({
          roomId, channelId, ticketId: ticket.id,
          agentId: mention.agent.id, query: mention.query,
        })
        await refetch()
      }
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optId))
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-tertiary shrink-0">
        <button onClick={onBack} className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm truncate">{ticket.title}</h2>
        </div>
        {isArchived
          ? <span className="text-xs font-medium text-text-tertiary bg-bg-tertiary px-2 py-1 rounded-full">Archivé</span>
          : <button onClick={() => closeMutation.mutate({ ticketId: ticket.id })} disabled={closeMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-red-400 transition-colors">
              <Archive className="w-3.5 h-3.5" />Fermer
            </button>
        }
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-6">
            <p className="text-xs text-text-tertiary">Tapez <strong className="text-accent-cyan">@NomAgent</strong> pour appeler un agent d'analyse</p>
          </div>
        )}
        {allMessages.map((msg) => (
          <MessageItem key={msg.id} msg={msg} isOwn={msg.userId === currentUserId}
            currentUserId={currentUserId} canModerate={false}
            onReply={() => {}} onReact={() => {}} onPin={() => {}} onEdit={() => {}} onDelete={() => {}}
          />
        ))}
        {invokeAgentMutation.isPending && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary border border-bg-tertiary">
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <span className="text-xs text-text-tertiary italic">L'agent analyse…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator names={typingNames} />
      <ChatInput
        roomId={roomId}
        onSend={handleSend}
        disabled={isArchived}
        disabledMsg="Ce ticket est archivé — lecture seule"
        onTyping={() => void publish({ userId: currentUserId, type: "TYPING", content: currentUserName })}
        isInvoking={invokeAgentMutation.isPending}
      />
    </div>
  )
}

// ── Analyse Channel ────────────────────────────────────────────────────────
function AnalyseChannel({ roomId, channelId, currentUserId, currentUserName, currentUserAvatar }: {
  roomId: string; channelId: string
  currentUserId: string; currentUserName: string; currentUserAvatar?: string
}) {
  const [activeTicket, setActiveTicket] = React.useState<{ id: string; title: string; status: string } | null>(null)

  if (activeTicket) {
    return (
      <TicketChat
        roomId={roomId} channelId={channelId} ticket={activeTicket}
        currentUserId={currentUserId} currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar} onBack={() => setActiveTicket(null)}
      />
    )
  }

  return (
    <TicketList
      channelId={channelId} roomId={roomId}
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

  const { data: room } = api.room.getById.useQuery({ roomId }, { enabled: !!roomId })
  const { data: channels } = api.room.getChannels.useQuery({ roomId }, { enabled: !!roomId })

  if (status === "loading") return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Chargement…</div>

  const currentUserId = session?.user?.id ?? ""
  const currentUserName = session?.user?.name ?? "Anonyme"
  const currentUserAvatar = session?.user?.image ?? undefined

  if (!room) return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Salle introuvable</div>

  if (!room.isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <Lock className="w-10 h-10 text-text-tertiary/50" />
        <p className="font-semibold text-text-primary">Accès restreint</p>
        <p className="text-sm text-text-tertiary">Tu dois rejoindre cette salle pour accéder aux canaux</p>
        <button onClick={() => router.push("/salles")} className="text-sm text-accent-cyan hover:underline">Retour aux salles</button>
      </div>
    )
  }

  const activeChannel = channels?.find((ch) => ch.slug === channel)
  if (!activeChannel) return <div className="flex items-center justify-center h-full text-text-tertiary text-sm">Canal introuvable</div>

  if (activeChannel.type === "ANALYSE") {
    return (
      <AnalyseChannel
        roomId={roomId} channelId={activeChannel.id}
        currentUserId={currentUserId} currentUserName={currentUserName} currentUserAvatar={currentUserAvatar}
      />
    )
  }

  return (
    <ChannelChat
      roomId={roomId} channelId={activeChannel.id} channelName={activeChannel.name}
      currentUserId={currentUserId} currentUserName={currentUserName} currentUserAvatar={currentUserAvatar}
      myRole={room.myRole} ownerId={room.ownerId} readOnly={room.myRole === "MEMBER"}
    />
  )
}
