"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Zap, Clock } from "lucide-react"

interface BurstModeIndicatorProps {
  isActive: boolean
  matchName?: string
  endsAt?: Date
  className?: string
}

export function BurstModeIndicator({
  isActive,
  matchName,
  endsAt,
  className,
}: BurstModeIndicatorProps) {
  const [timeLeft, setTimeLeft] = React.useState("")

  React.useEffect(() => {
    if (!endsAt || !isActive) return

    const updateTimeLeft = () => {
      const now = new Date()
      const diff = endsAt.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Terminé")
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endsAt, isActive])

  if (!isActive) return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "bg-gradient-to-r from-accent-gold/20 to-accent-cyan/20",
        "border border-accent-gold/30",
        "animate-pulse",
        className
      )}
    >
      <div className="p-2 bg-accent-gold/30 rounded-full">
        <Zap className="w-5 h-5 text-accent-gold" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-accent-gold">
            Burst Mode Actif
          </span>
          <span className="px-2 py-0.5 bg-accent-gold text-bg-primary text-xs font-bold rounded">
            ILLIMITÉ
          </span>
        </div>
        {matchName && (
          <p className="text-sm text-text-secondary">
            Match en cours: {matchName}
          </p>
        )}
      </div>

      {endsAt && (
        <div className="flex items-center gap-1 text-text-tertiary text-sm">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}</span>
        </div>
      )}
    </div>
  )
}

// Premium upsell for non-premium users during live matches
interface BurstModeUpsellProps {
  onUpgrade: () => void
  className?: string
}

export function BurstModeUpsell({ onUpgrade, className }: BurstModeUpsellProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl",
        "bg-gradient-to-r from-accent-gold/10 to-accent-cyan/10",
        "border border-accent-gold/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-accent-gold/20 rounded-full">
          <Zap className="w-5 h-5 text-accent-gold" />
        </div>

        <div className="flex-1">
          <h4 className="font-display font-semibold text-text-primary">
            Match en direct détecté !
          </h4>
          <p className="text-sm text-text-secondary mt-1">
            Passez Premium pour activer le Burst Mode et obtenir des analyses
            illimitées pendant les matchs en direct.
          </p>

          <button
            type="button"
            onClick={onUpgrade}
            className={cn(
              "mt-3 px-4 py-2 rounded-lg",
              "bg-accent-gold text-bg-primary",
              "font-display font-semibold text-sm",
              "min-h-[44px] transition-colors",
              "hover:bg-accent-gold/80"
            )}
          >
            Devenir Premium
          </button>
        </div>
      </div>
    </div>
  )
}
