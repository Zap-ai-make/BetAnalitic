"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { ChevronDown } from "lucide-react"
import type { AgentMetadata } from "~/lib/agents/types"

export interface HistoryEntry {
  id: string
  agent: AgentMetadata
  query: string
  response: string
  matchContext?: {
    homeTeam: string
    awayTeam: string
    competition: string
  }
  createdAt: Date
}

interface AgentHistoryItemProps {
  entry: HistoryEntry
  className?: string
}

export function AgentHistoryItem({ entry, className }: AgentHistoryItemProps) {
  const [expanded, setExpanded] = React.useState(false)

  const queryPreview =
    entry.query.length > 80 ? entry.query.slice(0, 80) + "..." : entry.query

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-lg overflow-hidden",
        "border-l-4 transition-all duration-200",
        className
      )}
      style={{ borderLeftColor: entry.agent.color }}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full p-4 flex items-center gap-3",
          "text-left min-h-[64px]",
          "hover:bg-bg-tertiary/50 transition-colors"
        )}
      >
        {/* Agent Avatar */}
        <span className="text-2xl flex-shrink-0">{entry.agent.emoji}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-display font-semibold text-sm"
              style={{ color: entry.agent.color }}
            >
              {entry.agent.name}
            </span>
            {entry.matchContext && (
              <span className="text-xs text-text-tertiary">
                • {entry.matchContext.homeTeam} vs {entry.matchContext.awayTeam}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary truncate">{queryPreview}</p>
        </div>

        {/* Timestamp + Expand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-text-tertiary">
            {entry.createdAt.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-text-tertiary transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Original Query */}
          <div>
            <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
              Question
            </h5>
            <p className="text-sm text-text-primary bg-bg-tertiary rounded-lg p-3">
              {entry.query}
            </p>
          </div>

          {/* Response */}
          <div>
            <h5 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
              Réponse
            </h5>
            <div className="text-sm text-text-primary bg-bg-tertiary rounded-lg p-3 max-h-[300px] overflow-y-auto">
              {entry.response}
            </div>
          </div>

          {/* Match Context */}
          {entry.matchContext && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span>⚽</span>
              <span>
                {entry.matchContext.homeTeam} vs {entry.matchContext.awayTeam}
              </span>
              <span>•</span>
              <span>{entry.matchContext.competition}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
