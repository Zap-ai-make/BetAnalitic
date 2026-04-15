"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { ExternalLink, Clock } from "lucide-react"

export interface Citation {
  id: string
  type: "sportmonks" | "odds" | "weather" | "stats" | "h2h"
  label: string
  timestamp?: Date
  url?: string
  data?: Record<string, unknown>
}

interface CitationLinkProps {
  citationNumber: number
  citation: Citation
  className?: string
}

const citationEmojis: Record<string, string> = {
  sportmonks: "🗃️",
  odds: "💰",
  weather: "🌤️",
  stats: "📊",
  h2h: "⚔️",
}

export function CitationLink({ citationNumber, citation, className }: CitationLinkProps) {
  const [expanded, setExpanded] = React.useState(false)

  const emoji = citationEmojis[citation.type] ?? "📎"

  return (
    <span className={cn("inline-block", className)}>
      {/* Citation Number */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "inline-flex items-center justify-center",
          "w-5 h-5 text-xs font-mono font-bold",
          "rounded-full",
          "bg-accent-cyan/20 text-accent-cyan",
          "hover:bg-accent-cyan hover:text-bg-primary",
          "transition-colors",
          "align-super",
          "ml-0.5"
        )}
        aria-label={`Citation ${citationNumber}: ${citation.label}`}
      >
        {citationNumber}
      </button>

      {/* Expanded Details (inline tooltip) */}
      {expanded && (
        <span
          className={cn(
            "inline-block ml-2 px-3 py-2 rounded-lg",
            "bg-bg-tertiary border border-accent-cyan/30",
            "text-sm animate-in fade-in-0 slide-in-from-left-2 duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            {/* Icon */}
            <span className="text-lg flex-shrink-0">
              {emoji}
            </span>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary">{citation.label}</div>

              {citation.timestamp && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary mt-1">
                  <Clock className="w-3 h-3" />
                  {citation.timestamp.toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              )}

              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-accent-cyan hover:underline mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Voir la source
                </a>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => setExpanded(false)}
              className="text-text-tertiary hover:text-text-primary"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </span>
      )}
    </span>
  )
}
