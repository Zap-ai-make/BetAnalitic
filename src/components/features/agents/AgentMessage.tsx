"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { TypewriterText } from "./TypewriterText"
import { X } from "lucide-react"
import { CitationLink, type Citation } from "./CitationLink"
import { AgentFeedback, type FeedbackType } from "./AgentFeedback"
import { AgentResponseActions } from "./AgentResponseActions"

interface AgentMessageProps {
  agentId: string
  agentName: string
  agentEmoji: string
  message: string
  responseId?: string
  citations?: Citation[]
  matchContext?: {
    homeTeam: string
    awayTeam: string
  }
  isStreaming?: boolean
  isComplete?: boolean
  timestamp?: Date
  onStop?: () => void
  onFeedback?: (responseId: string, type: FeedbackType, details?: string) => void
  className?: string
}

export function AgentMessage({
  agentId,
  agentName,
  agentEmoji,
  message,
  responseId,
  citations = [],
  matchContext,
  isStreaming = false,
  isComplete = false,
  timestamp,
  onStop,
  onFeedback,
  className,
}: AgentMessageProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-lg p-4",
        "border-l-4",
        className
      )}
      style={{
        borderLeftColor: `var(--color-agent-${agentId})`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Agent Avatar */}
          <span className="text-2xl">{agentEmoji}</span>

          {/* Agent Info */}
          <div>
            <h4 className="font-display font-semibold text-text-primary">
              {agentName}
            </h4>
            {timestamp && (
              <span className="text-xs text-text-tertiary">
                {timestamp.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Stop button (only during streaming) */}
        {isStreaming && onStop && (
          <button
            onClick={onStop}
            className={cn(
              "p-2 rounded-full",
              "text-text-secondary hover:text-accent-red hover:bg-accent-red/10",
              "transition-colors",
              "min-w-[44px] min-h-[44px]"
            )}
            aria-label="Arrêter la génération"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Message Content */}
      <div className="text-text-primary prose prose-invert max-w-none">
        <TypewriterText
          text={message}
          isComplete={isComplete}
          showCursor={isStreaming}
          renderCitation={(citationNumber) => {
            const citation = citations[citationNumber - 1]
            return citation ? (
              <CitationLink citationNumber={citationNumber} citation={citation} />
            ) : null
          }}
        />
      </div>

      {/* Citations List (at bottom if any) */}
      {isComplete && citations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-bg-tertiary">
          <h5 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
            Sources ({citations.length})
          </h5>
          <div className="space-y-2">
            {citations.map((citation, idx) => (
              <div
                key={citation.id}
                className="text-sm text-text-tertiary flex gap-2 items-start"
              >
                <span className="font-mono text-accent-cyan shrink-0">[{idx + 1}]</span>
                <div className="flex-1 min-w-0">
                  <span className="text-text-primary">{citation.label}</span>
                  {citation.timestamp && (
                    <span className="text-xs ml-2">
                      ({citation.timestamp.toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })})
                    </span>
                  )}
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:underline ml-2"
                    >
                      ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Indicator + Actions */}
      {isComplete && (
        <div className="mt-3 pt-3 border-t border-bg-tertiary flex items-center justify-between">
          <span className="text-xs text-text-tertiary flex items-center gap-1">
            ✓ Réponse complète
          </span>
          <div className="flex items-center gap-2">
            <AgentResponseActions
              responseText={message}
              agentName={agentName}
              matchContext={matchContext}
            />
            {responseId && (
              <AgentFeedback
                responseId={responseId}
                onFeedback={onFeedback}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
