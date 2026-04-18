"use client"

/**
 * Epic 12 Story 12.3 & 12.6: Offline UI States & Indicators
 * Shows offline/online status and pending sync count
 */

import * as React from "react"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { offlineDb } from "~/lib/db/offline"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true)
  const [showBanner, setShowBanner] = React.useState(false)
  const [justReconnected, setJustReconnected] = React.useState(false)

  // Get pending actions count
  const pendingCount = useLiveQuery(
    async () => {
      const count = await offlineDb.pendingActions.count()
      return count
    },
    [],
    0
  )

  React.useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)
    setShowBanner(!navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setJustReconnected(true)
      setShowBanner(true)

      // Auto-dismiss reconnected banner after 3 seconds
      setTimeout(() => {
        setShowBanner(false)
        setJustReconnected(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
      setJustReconnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = () => {
    // Force a connection check
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  if (!showBanner) {
    return null
  }

  const bannerClasses = isOnline
    ? "bg-accent-green/20 border-accent-green/40"
    : "bg-orange-500/20 border-orange-500/40"

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`${bannerClasses} border-b-2 backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-accent-green" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-500" />
              )}

              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {isOnline ? "Connexion rétablie" : "Mode hors-ligne"}
                </span>
                {!isOnline && pendingCount > 0 && (
                  <span className="text-xs text-text-tertiary">
                    {pendingCount} action{pendingCount > 1 ? "s" : ""} en attente
                  </span>
                )}
                {isOnline && justReconnected && pendingCount > 0 && (
                  <span className="text-xs text-text-tertiary flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Synchronisation en cours...
                  </span>
                )}
              </div>
            </div>

            {!isOnline && (
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-sm font-semibold bg-orange-500/30 hover:bg-orange-500/40 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
