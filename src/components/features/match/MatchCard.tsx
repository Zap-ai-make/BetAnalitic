"use client"

import * as React from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { StatusIndicator } from "./StatusIndicator"
import { cn } from "~/lib/utils"
import { useCouponStore } from "~/lib/stores/couponStore"
import { Check } from "lucide-react"

export interface MatchCardProps {
  match: {
    id: string
    status: "live" | "upcoming" | "finished"
    time: string
    homeTeam: string
    awayTeam: string
    league: string
    homeScore?: number
    awayScore?: number
    tags?: string[]
    analysisCount: number
  }
}

export function MatchCard({ match }: MatchCardProps) {
  const [animating, setAnimating] = React.useState(false)
  const [shaking, setShaking] = React.useState(false)
  const [showMaxMessage, setShowMaxMessage] = React.useState(false)
  const { addMatch, removeMatch, isSelected } = useCouponStore()

  const selected = isSelected(match.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (selected) {
      removeMatch(match.id)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)
    } else {
      const added = addMatch({
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        league: match.league,
        time: match.time,
        addedAt: new Date()
      })

      if (added) {
        setAnimating(true)
        setTimeout(() => setAnimating(false), 300)
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      } else {
        // Max limit reached
        setShaking(true)
        setShowMaxMessage(true)
        setTimeout(() => setShaking(false), 500)
        setTimeout(() => setShowMaxMessage(false), 3000)
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      }
    }
  }

  return (
    <div className="relative">
      {/* Max Limit Toast */}
      {showMaxMessage && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-accent-red text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Max 10 matchs
          </div>
        </div>
      )}

      <div
        className={cn(
          "bg-bg-secondary rounded-lg p-4 border-2 transition-all duration-300 space-y-3",
          "hover:border-accent-cyan/20",
          selected && "border-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.3)]",
          !selected && "border-transparent",
          animating && "scale-[0.98]",
          shaking && "animate-shake"
        )}
      >
      {/* Header */}
      <div className="flex justify-between items-center">
        <StatusIndicator status={match.status} />
        <span className="text-text-secondary text-sm font-mono">
          {match.time}
        </span>
      </div>

      {/* Teams Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-text-primary">
            {match.homeTeam}
          </span>
          {match.homeScore !== undefined && (
            <span className="font-mono font-bold text-lg text-text-primary">
              {match.homeScore}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-text-primary">
            {match.awayTeam}
          </span>
          {match.awayScore !== undefined && (
            <span className="font-mono font-bold text-lg text-text-primary">
              {match.awayScore}
            </span>
          )}
        </div>
        <p className="text-text-tertiary text-sm">{match.league}</p>
      </div>

      {/* Tags Row */}
      {match.tags && match.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {match.tags.map((tag, index) => (
            <React.Fragment key={tag}>
              {index > 0 && <span className="text-text-tertiary">•</span>}
              <Badge variant="secondary">{tag}</Badge>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-text-secondary text-sm">
          {match.analysisCount} analysent ce match
        </span>
        <Button
          variant={selected ? "default" : "secondary"}
          size="sm"
          onClick={handleToggle}
          className={cn(
            "min-w-[44px] min-h-[44px] transition-all",
            selected && "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
          )}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Ajouté
            </>
          ) : (
            "+ Ajouter"
          )}
        </Button>
      </div>
      </div>
    </div>
  )
}
