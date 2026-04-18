"use client"

/**
 * Live Mode Toggle Component
 * Story 7.1: Toggle button to activate/deactivate Live Mode
 */

import * as React from "react"
import { Radio, Battery } from "lucide-react"
import { cn } from "~/lib/utils"
import { useLiveModeStore } from "~/stores/liveMode"

interface LiveModeToggleProps {
  matchId: string
  isMatchLive: boolean
  className?: string
}

export function LiveModeToggle({
  matchId,
  isMatchLive,
  className,
}: LiveModeToggleProps) {
  const { toggleLiveMode, isMatchLive: isActive, isBatterySaverOn } = useLiveModeStore()
  const [showWarning, setShowWarning] = React.useState(false)

  const active = isActive(matchId)

  const handleToggle = () => {
    if (!active && !showWarning && isMatchLive) {
      setShowWarning(true)
      return
    }

    toggleLiveMode(matchId)
    setShowWarning(false)
  }

  if (!isMatchLive) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={handleToggle}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all",
          active
            ? "bg-accent-cyan text-bg-primary shadow-lg shadow-accent-cyan/20"
            : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/70"
        )}
      >
        <div className="relative">
          <Radio
            className={cn("w-4 h-4 transition-all", active && "animate-pulse")}
          />
          {active && (
            <span className="absolute inset-0 animate-ping">
              <Radio className="w-4 h-4 opacity-50" />
            </span>
          )}
        </div>
        <span>{active ? "Mode Live Actif" : "Activer Mode Live"}</span>
        {isBatterySaverOn && active && (
          <Battery className="w-3 h-3 text-accent-gold" />
        )}
      </button>

      {showWarning && !active && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-bg-secondary border border-accent-cyan/30 rounded-lg p-3 shadow-xl z-10 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2 mb-3">
            <Radio className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">
                Mode Live
              </p>
              <p className="text-xs text-text-tertiary leading-relaxed">
                Les données seront actualisées toutes les 30s. Cela consommera
                plus de batterie et de données mobiles.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 px-3 py-2 bg-bg-tertiary text-text-primary rounded-lg text-xs font-semibold hover:bg-bg-tertiary/70 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleToggle}
              className="flex-1 px-3 py-2 bg-accent-cyan text-bg-primary rounded-lg text-xs font-semibold hover:bg-accent-cyan/90 transition-colors"
            >
              Activer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
