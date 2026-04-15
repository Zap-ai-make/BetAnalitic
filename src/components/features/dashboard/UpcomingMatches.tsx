"use client"

/**
 * Story 7.16: Upcoming Matches Widget
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Calendar, ChevronRight, Star } from "lucide-react"

interface UpcomingMatch {
  id: string
  homeTeam: string
  awayTeam: string
  competition: string
  startTime: Date
  isFavorite?: boolean
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[]
  onMatchClick?: (matchId: string) => void
  onToggleFavorite?: (matchId: string) => void
  maxItems?: number
  className?: string
}

export function UpcomingMatches({
  matches,
  onMatchClick,
  onToggleFavorite,
  maxItems = 5,
  className,
}: UpcomingMatchesProps) {
  const displayedMatches = matches.slice(0, maxItems)

  // Group by date
  const groupedMatches = React.useMemo(() => {
    const groups: Record<string, UpcomingMatch[]> = {}
    displayedMatches.forEach((match) => {
      const dateKey = match.startTime.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(match)
    })
    return groups
  }, [displayedMatches])

  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-display font-semibold text-text-primary">
            Prochains matchs
          </h3>
        </div>
      </div>

      {Object.keys(groupedMatches).length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-text-tertiary text-sm">
            Aucun match programmé
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date}>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                {date}
              </p>
              <div className="space-y-2">
                {dateMatches.map((match) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    onClick={() => onMatchClick?.(match.id)}
                    onToggleFavorite={() => onToggleFavorite?.(match.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchRow({
  match,
  onClick,
  onToggleFavorite,
}: {
  match: UpcomingMatch
  onClick?: () => void
  onToggleFavorite?: () => void
}) {
  const time = match.startTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-xl">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite?.()
        }}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          match.isFavorite
            ? "text-yellow-500"
            : "text-text-tertiary hover:text-yellow-500"
        )}
      >
        <Star
          className="w-4 h-4"
          fill={match.isFavorite ? "currentColor" : "none"}
        />
      </button>

      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex items-center justify-between min-w-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary truncate">
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <p className="text-xs text-text-tertiary">{match.competition}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-text-secondary">{time}</span>
          <ChevronRight className="w-4 h-4 text-text-tertiary" />
        </div>
      </button>
    </div>
  )
}
