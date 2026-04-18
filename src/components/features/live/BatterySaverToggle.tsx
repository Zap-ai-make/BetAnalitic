"use client"

/**
 * Battery Saver Toggle Component
 * Story 7.8: Toggle to enable battery saver mode (slower refresh)
 */

import * as React from "react"
import { Battery, BatteryCharging } from "lucide-react"
import { cn } from "~/lib/utils"
import { useLiveModeStore } from "~/stores/liveMode"

interface BatterySaverToggleProps {
  className?: string
}

export function BatterySaverToggle({ className }: BatterySaverToggleProps) {
  const { isBatterySaverOn, setBatterySaver } = useLiveModeStore()

  return (
    <button
      onClick={() => setBatterySaver(!isBatterySaverOn)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
        isBatterySaverOn
          ? "bg-accent-gold/20 text-accent-gold"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/70",
        className
      )}
    >
      {isBatterySaverOn ? (
        <Battery className="w-4 h-4" />
      ) : (
        <BatteryCharging className="w-4 h-4" />
      )}
      <span>{isBatterySaverOn ? "Éco. activé" : "Mode Éco."}</span>
    </button>
  )
}
