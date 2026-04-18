/**
 * Live Refresh Hook
 * Story 7.2: Auto-refresh match data every 30s in Live Mode
 */

import * as React from "react"
import { useLiveModeStore } from "~/stores/liveMode"

interface UseLiveRefreshOptions {
  matchId: string
  onRefresh: () => void | Promise<void>
  enabled?: boolean
}

const LIVE_INTERVAL = 30_000 // 30s
const HALFTIME_INTERVAL = 60_000 // 60s during half-time

export function useLiveRefresh({
  matchId,
  onRefresh,
  enabled = true,
}: UseLiveRefreshOptions) {
  const { isMatchLive, isBatterySaverOn } = useLiveModeStore()
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [matchPeriod, setMatchPeriod] = React.useState<"live" | "halftime" | "ended">("live")

  const isActive = isMatchLive(matchId)
  const interval = matchPeriod === "halftime" ? HALFTIME_INTERVAL : LIVE_INTERVAL
  const adjustedInterval = isBatterySaverOn ? interval * 2 : interval

  React.useEffect(() => {
    if (!enabled || !isActive) {
      return
    }

    const refresh = async () => {
      if (isRefreshing) return

      setIsRefreshing(true)
      try {
        await onRefresh()
        setLastRefresh(new Date())
      } catch (error) {
        console.error("Live refresh failed:", error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Initial refresh
    void refresh()

    // Set up interval
    const timer = setInterval(() => {
      void refresh()
    }, adjustedInterval)

    return () => {
      clearInterval(timer)
    }
  }, [enabled, isActive, onRefresh, adjustedInterval, isRefreshing])

  const manualRefresh = React.useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Manual refresh failed:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, onRefresh])

  // Story 7.9: Auto-deactivate when match ends
  React.useEffect(() => {
    if (matchPeriod === "ended" && isActive) {
      const { deactivateLiveMode } = useLiveModeStore.getState()
      deactivateLiveMode(matchId)
    }
  }, [matchPeriod, isActive, matchId])

  return {
    isRefreshing,
    lastRefresh,
    manualRefresh,
    setMatchPeriod,
    nextRefreshIn: lastRefresh
      ? adjustedInterval - (Date.now() - lastRefresh.getTime())
      : adjustedInterval,
  }
}
