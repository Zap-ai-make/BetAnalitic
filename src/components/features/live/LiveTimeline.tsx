"use client"

/**
 * Live Timeline Component
 * Story 7.5: Display recent match events in timeline format
 */

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "~/lib/utils"

export interface MatchEvent {
  id: string
  minute: number
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var"
  team: "home" | "away"
  player?: string
  description: string
}

interface LiveTimelineProps {
  events: MatchEvent[]
  className?: string
}

const EVENT_ICONS = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
  var: "📺",
}

export function LiveTimeline({ events, className }: LiveTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("text-center py-6", className)}>
        <Clock className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
        <p className="text-sm text-text-tertiary">
          Aucun événement pour le moment
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {events.map((event, idx) => (
        <div
          key={event.id}
          className="flex items-start gap-3 animate-in slide-in-from-left duration-300"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          {/* Timeline */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                event.type === "goal"
                  ? "bg-accent-cyan/20"
                  : event.type === "yellow_card"
                  ? "bg-accent-gold/20"
                  : event.type === "red_card"
                  ? "bg-red-500/20"
                  : "bg-bg-tertiary"
              )}
            >
              {EVENT_ICONS[event.type]}
            </div>
            {idx < events.length - 1 && (
              <div className="w-0.5 h-full bg-bg-tertiary flex-1 min-h-[20px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-accent-cyan">
                {event.minute}&apos;
              </span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  event.team === "home"
                    ? "bg-accent-cyan/20 text-accent-cyan"
                    : "bg-accent-purple/20 text-accent-purple"
                )}
              >
                {event.team === "home" ? "Domicile" : "Extérieur"}
              </span>
            </div>
            <p className="text-sm text-text-primary font-medium">
              {event.description}
            </p>
            {event.player && (
              <p className="text-xs text-text-tertiary mt-1">{event.player}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
