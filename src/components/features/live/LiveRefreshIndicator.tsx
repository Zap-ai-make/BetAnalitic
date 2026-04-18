"use client"

/**
 * Live Refresh Indicator
 * Story 7.2: Visual indicator for auto-refresh status
 */

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "~/lib/utils"

interface LiveRefreshIndicatorProps {
  isRefreshing: boolean
  lastRefresh: Date | null
  nextRefreshIn: number
  className?: string
}

export function LiveRefreshIndicator({
  isRefreshing,
  lastRefresh,
  nextRefreshIn,
  className,
}: LiveRefreshIndicatorProps) {
  const [countdown, setCountdown] = React.useState(nextRefreshIn)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    setCountdown(nextRefreshIn)
  }, [nextRefreshIn])

  const seconds = Math.ceil(countdown / 1000)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-tertiary/50 backdrop-blur-sm border border-accent-cyan/20",
        className
      )}
    >
      <RefreshCw
        className={cn(
          "w-3 h-3 text-accent-cyan transition-transform",
          isRefreshing && "animate-spin"
        )}
      />
      <span className="text-xs font-medium text-text-secondary">
        {isRefreshing ? (
          "Actualisation..."
        ) : lastRefresh ? (
          <>
            Prochain refresh dans <span className="text-accent-cyan font-bold">{seconds}s</span>
          </>
        ) : (
          "En attente..."
        )}
      </span>
    </div>
  )
}
