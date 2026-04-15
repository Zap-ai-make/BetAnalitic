"use client"

/**
 * Story 8.3: Debate Thread
 * Full debate conversation view
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { ThumbsUp, ThumbsDown, MessageSquare, CornerDownRight } from "lucide-react"

interface DebateMessage {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  position: "for" | "against"
  content: string
  replyToId?: string
  timestamp: Date
  upvotes: number
  downvotes: number
  hasVoted?: "up" | "down"
}

interface DebateThreadProps {
  topic: string
  messages: DebateMessage[]
  onVote?: (messageId: string, vote: "up" | "down") => void
  onReply?: (messageId: string) => void
  className?: string
}

export function DebateThread({
  topic,
  messages,
  onVote,
  onReply,
  className,
}: DebateThreadProps) {
  // Group messages by parent
  const rootMessages = messages.filter((m) => !m.replyToId)
  const replies = messages.filter((m) => m.replyToId)

  const getReplies = (messageId: string) =>
    replies.filter((r) => r.replyToId === messageId)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Topic */}
      <div className="p-4 bg-bg-tertiary rounded-xl">
        <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
          Sujet du débat
        </p>
        <h2 className="text-lg font-display font-semibold text-text-primary">
          {topic}
        </h2>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {rootMessages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            replies={getReplies(message.id)}
            onVote={onVote}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  )
}

function MessageCard({
  message,
  replies,
  onVote,
  onReply,
  isReply = false,
}: {
  message: DebateMessage
  replies?: DebateMessage[]
  onVote?: (messageId: string, vote: "up" | "down") => void
  onReply?: (messageId: string) => void
  isReply?: boolean
}) {
  const positionConfig = {
    for: { label: "POUR", color: "border-accent-green", badge: "bg-accent-green/20 text-accent-green" },
    against: { label: "CONTRE", color: "border-accent-red", badge: "bg-accent-red/20 text-accent-red" },
  }

  const config = positionConfig[message.position]
  const netVotes = message.upvotes - message.downvotes

  return (
    <div className={cn(isReply && "ml-8")}>
      <div
        className={cn(
          "p-4 bg-bg-secondary rounded-xl border-l-4",
          config.color
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: message.agentColor }}
          >
            {message.agentName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {message.agentName}
            </p>
            <span className={cn("text-xs px-1.5 py-0.5 rounded", config.badge)}>
              {config.label}
            </span>
          </div>
          <span className="ml-auto text-xs text-text-tertiary">
            {message.timestamp.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Content */}
        <p className="text-text-primary text-sm leading-relaxed mb-3">
          {message.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVote?.(message.id, "up")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                message.hasVoted === "up"
                  ? "bg-accent-green/20 text-accent-green"
                  : "text-text-tertiary hover:text-accent-green hover:bg-accent-green/10"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span
              className={cn(
                "text-sm font-medium",
                netVotes > 0 ? "text-accent-green" : netVotes < 0 ? "text-accent-red" : "text-text-tertiary"
              )}
            >
              {netVotes > 0 ? `+${netVotes}` : netVotes}
            </span>
            <button
              type="button"
              onClick={() => onVote?.(message.id, "down")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                message.hasVoted === "down"
                  ? "bg-accent-red/20 text-accent-red"
                  : "text-text-tertiary hover:text-accent-red hover:bg-accent-red/10"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>

          {!isReply && onReply && (
            <button
              type="button"
              onClick={() => onReply(message.id)}
              className="flex items-center gap-1 text-text-tertiary hover:text-accent-cyan text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Répondre</span>
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2">
              <CornerDownRight className="w-4 h-4 text-text-tertiary mt-4 flex-shrink-0" />
              <div className="flex-1">
                <MessageCard
                  message={reply}
                  onVote={onVote}
                  isReply
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
