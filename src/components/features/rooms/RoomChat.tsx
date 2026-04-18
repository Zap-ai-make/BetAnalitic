"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Send } from "lucide-react"
import type { RoomMessage } from "~/lib/realtime/types"
import { VerifiedExpertBadge } from "~/components/features/expert/VerifiedExpertBadge"

interface RoomChatProps {
  messages: RoomMessage[]
  currentUserId: string
  onSendMessage: (content: string) => void
  isDataOnly?: boolean
  disabled?: boolean
  className?: string
  expertsMap?: Record<string, boolean>
}

function MessageBubble({
  message,
  isOwn,
  isExpert = false,
}: {
  message: RoomMessage
  isOwn: boolean
  isExpert?: boolean
}) {
  const isAgent = message.type === "agent"
  const isSystem = message.type === "system"

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="px-3 py-1 bg-bg-tertiary rounded-full text-xs text-text-tertiary">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm flex-shrink-0">
          {message.userAvatar ?? message.userName.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-accent-cyan text-bg-primary rounded-br-md"
            : isAgent
              ? "bg-bg-secondary border-l-4 border-accent-cyan rounded-bl-md"
              : isExpert
                ? "bg-bg-secondary border-l-4 border-accent-gold rounded-bl-md"
                : "bg-bg-tertiary rounded-bl-md"
        )}
      >
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1">
            <p
              className={cn(
                "text-xs font-medium",
                isAgent ? "text-accent-cyan" : isExpert ? "text-accent-gold" : "text-text-secondary"
              )}
            >
              {message.userName}
              {isAgent && " 🤖"}
            </p>
            {isExpert && <VerifiedExpertBadge size="sm" />}
          </div>
        )}

        <p className={cn("text-sm", isOwn ? "text-bg-primary" : "text-text-primary")}>
          {message.content}
        </p>

        <p
          className={cn(
            "text-xs mt-1",
            isOwn ? "text-bg-primary/70" : "text-text-tertiary"
          )}
        >
          {message.createdAt.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

export function RoomChat({
  messages,
  currentUserId,
  onSendMessage,
  isDataOnly = false,
  disabled = false,
  className,
  expertsMap = {},
}: RoomChatProps) {
  const [input, setInput] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-text-secondary text-sm">
              {isDataOnly
                ? "Les réponses des agents apparaîtront ici."
                : "Soyez le premier à envoyer un message !"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.userId === currentUserId}
              isExpert={expertsMap[message.userId] ?? false}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isDataOnly && (
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-bg-tertiary bg-bg-secondary"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Envoyer un message..."
              disabled={disabled}
              className={cn(
                "flex-1 px-4 py-3 bg-bg-tertiary rounded-full",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50",
                "min-h-[44px]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />

            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={cn(
                "p-3 rounded-full bg-accent-cyan text-bg-primary",
                "min-w-[44px] min-h-[44px] flex items-center justify-center",
                "transition-colors",
                !input.trim() || disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-accent-cyan/80"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
