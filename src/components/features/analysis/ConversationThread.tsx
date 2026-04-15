"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { AgentMessage } from "../agents/AgentMessage"
import type { AgentMetadata } from "~/lib/agents/types"
import type { Citation } from "../agents/CitationLink"

export interface ThreadMessage {
  id: string
  type: "user" | "agent"
  content: string
  agent?: AgentMetadata
  citations?: Citation[]
  timestamp: Date
  isStreaming?: boolean
  isComplete?: boolean
}

interface ConversationThreadProps {
  messages: ThreadMessage[]
  onStopStreaming?: () => void
  className?: string
}

function UserMessage({ content, timestamp }: { content: string; timestamp: Date }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bg-accent-cyan/20 rounded-lg p-4">
        <p className="text-text-primary text-sm">{content}</p>
        <span className="text-xs text-text-tertiary mt-2 block text-right">
          {timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

export function ConversationThread({
  messages,
  onStopStreaming,
  className,
}: ConversationThreadProps) {
  const endRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <div className="text-4xl mb-4">💬</div>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
          Commencez l&apos;analyse
        </h3>
        <p className="text-text-secondary text-sm max-w-xs">
          Tapez @NomAgent pour invoquer un agent ou lancez l&apos;analyse
          complète.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {messages.map((message) => {
        if (message.type === "user") {
          return (
            <UserMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
            />
          )
        }

        if (message.agent) {
          return (
            <AgentMessage
              key={message.id}
              agentId={message.agent.id}
              agentName={message.agent.name}
              agentEmoji={message.agent.emoji}
              message={message.content}
              responseId={message.id}
              citations={message.citations}
              timestamp={message.timestamp}
              isStreaming={message.isStreaming}
              isComplete={message.isComplete}
              onStop={message.isStreaming ? onStopStreaming : undefined}
            />
          )
        }

        return null
      })}

      {/* Scroll anchor */}
      <div ref={endRef} />
    </div>
  )
}
