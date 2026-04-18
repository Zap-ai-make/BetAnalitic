"use client"

/**
 * Epic 12 Story 12.2: Service Worker & Caching Strategy
 * Update prompt for new service worker versions
 */

import * as React from "react"
import { RefreshCw, X } from "lucide-react"

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Listen for service worker updates
    void navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      // Check for updates periodically (every 1 hour)
      setInterval(() => {
        void reg.update()
      }, 60 * 60 * 1000)

      // Listen for waiting service worker
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing

        if (!newWorker) return

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker available
            setShowPrompt(true)
          }
        })
      })
    })

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Reload the page to use the new service worker
      window.location.reload()
    })
  }, [])

  const handleUpdate = () => {
    if (!registration?.waiting) return

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: "SKIP_WAITING" })
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-br from-accent-green/10 to-accent-cyan/10 border-2 border-accent-green/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-accent-green" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-text-primary mb-1">
              Mise à jour disponible
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Une nouvelle version de BetAnalytic est disponible. Actualisez pour profiter des dernières améliorations.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-accent-green text-bg-primary rounded-xl font-semibold hover:bg-accent-green/90 transition-colors text-sm min-h-[40px] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-xl font-semibold hover:bg-bg-tertiary/80 transition-colors text-sm min-h-[40px]"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
