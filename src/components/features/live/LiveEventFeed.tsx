"use client"

/**
 * Story 7.5: Live Event Feed
 * Real-time match events (goals, cards, substitutions)
 */

import * as React from "react"
import { cn } from "~/lib/utils"

type EventType =
  | "goal"
  | "own_goal"
  | "penalty"
  | "penalty_missed"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "var"
  | "kickoff"
  | "halftime"
  | "fulltime"

interface MatchEvent {
  id: string
  type: EventType
  minute: number
  playerName?: string
  assistName?: string
  teamSide: "home" | "away"
  description?: string
}

interface LiveEventFeedProps {
  events: MatchEvent[]
  homeTeamName: string
  awayTeamName: string
  className?: string
}

const eventConfig: Record<EventType, { icon: string; color: string; label: string }> = {
  goal: { icon: "⚽", color: "bg-accent-green/20 border-accent-green", label: "But" },
  own_goal: { icon: "⚽", color: "bg-accent-red/20 border-accent-red", label: "But CSC" },
  penalty: { icon: "⚽", color: "bg-accent-green/20 border-accent-green", label: "Penalty" },
  penalty_missed: { icon: "❌", color: "bg-accent-orange/20 border-accent-orange", label: "Penalty manqué" },
  yellow_card: { icon: "🟨", color: "bg-yellow-500/20 border-yellow-500", label: "Carton jaune" },
  red_card: { icon: "🟥", color: "bg-accent-red/20 border-accent-red", label: "Carton rouge" },
  substitution: { icon: "🔄", color: "bg-bg-tertiary border-bg-tertiary", label: "Changement" },
  var: { icon: "📺", color: "bg-accent-cyan/20 border-accent-cyan", label: "VAR" },
  kickoff: { icon: "🏁", color: "bg-bg-tertiary border-bg-tertiary", label: "Coup d'envoi" },
  halftime: { icon: "⏸️", color: "bg-bg-tertiary border-bg-tertiary", label: "Mi-temps" },
  fulltime: { icon: "🏁", color: "bg-bg-tertiary border-bg-tertiary", label: "Fin du match" },
}

export function LiveEventFeed({
  events,
  homeTeamName,
  awayTeamName,
  className,
}: LiveEventFeedProps) {
  const sortedEvents = React.useMemo(
    () => [...events].sort((a, b) => b.minute - a.minute),
    [events]
  )

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-text-primary mb-3">
        Événements du match
      </h4>

      {sortedEvents.length === 0 ? (
        <div className="p-6 text-center bg-bg-secondary rounded-xl border border-bg-tertiary">
          <p className="text-text-tertiary text-sm">
            Aucun événement pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              teamName={event.teamSide === "home" ? homeTeamName : awayTeamName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, teamName }: { event: MatchEvent; teamName: string }) {
  const config = eventConfig[event.type]

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border",
        config.color
      )}
    >
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-lg">{config.icon}</span>
        <span className="text-xs font-mono text-text-tertiary mt-0.5">
          {event.minute}&apos;
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {config.label}
          </span>
          <span className="text-xs text-text-tertiary">• {teamName}</span>
        </div>

        {event.playerName && (
          <p className="text-sm text-text-secondary mt-0.5">
            {event.playerName}
            {event.assistName && (
              <span className="text-text-tertiary">
                {" "}
                (Passe de {event.assistName})
              </span>
            )}
          </p>
        )}

        {event.description && (
          <p className="text-xs text-text-tertiary mt-1">{event.description}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Story 7.6: Compact Event Timeline
 */
interface EventTimelineProps {
  events: MatchEvent[]
  currentMinute: number
  className?: string
}

export function EventTimeline({
  events,
  currentMinute,
  className,
}: EventTimelineProps) {
  const significantEvents = events.filter((e) =>
    ["goal", "own_goal", "penalty", "red_card", "var"].includes(e.type)
  )

  return (
    <div className={cn("relative h-8", className)}>
      {/* Timeline bar */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-bg-tertiary rounded-full">
        {/* Progress */}
        <div
          className="h-full bg-accent-cyan rounded-full transition-all"
          style={{ width: `${Math.min(100, (currentMinute / 90) * 100)}%` }}
        />
      </div>

      {/* Half-time marker */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2 h-2 bg-bg-tertiary border-2 border-text-tertiary rounded-full" />

      {/* Events */}
      {significantEvents.map((event) => {
        const position = (event.minute / 90) * 100
        const config = eventConfig[event.type]

        return (
          <div
            key={event.id}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
              "w-5 h-5 rounded-full flex items-center justify-center text-xs",
              event.teamSide === "home" ? "-mt-4" : "mt-4"
            )}
            style={{ left: `${Math.min(98, Math.max(2, position))}%` }}
            title={`${event.minute}' - ${config.label}`}
          >
            {config.icon}
          </div>
        )
      })}

      {/* Current position */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-accent-cyan rounded-full shadow-lg shadow-accent-cyan/50"
        style={{ left: `${Math.min(100, (currentMinute / 90) * 100)}%` }}
      />
    </div>
  )
}
