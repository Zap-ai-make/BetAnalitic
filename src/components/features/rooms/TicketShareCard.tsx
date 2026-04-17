"use client"

/**
 * Ticket Share Card Component
 * Story 6.10: Display shared tickets in room chat
 */

import * as React from "react"
import { Trophy, TrendingUp } from "lucide-react"

interface Match {
  homeTeam: string
  awayTeam: string
  prediction: string
  odds: number
}

interface TicketShareCardProps {
  matches: Match[]
  totalOdds: number
  userName: string
  compact?: boolean
}

export function TicketShareCard({ matches, totalOdds, userName, compact = false }: TicketShareCardProps) {
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent-cyan" />
          <span className="font-semibold text-sm text-text-primary">Ticket de {userName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">{matches.length} match{matches.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1 text-accent-cyan font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>{totalOdds.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-cyan" />
          <span className="font-display font-bold text-base text-text-primary">Ticket de {userName}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-accent-cyan/20 px-3 py-1 rounded-full">
          <TrendingUp className="w-4 h-4 text-accent-cyan" />
          <span className="font-bold text-accent-cyan">{totalOdds.toFixed(2)}</span>
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-2">
        {matches.map((match, idx) => (
          <div key={idx} className="bg-bg-secondary/50 rounded-lg p-2.5 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">
                {match.homeTeam} vs {match.awayTeam}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">{match.prediction}</div>
            </div>
            <div className="shrink-0 text-sm font-bold text-accent-cyan">{match.odds.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-accent-cyan/20 text-xs text-text-tertiary text-center">
        Cliquez pour copier ce ticket
      </div>
    </div>
  )
}
