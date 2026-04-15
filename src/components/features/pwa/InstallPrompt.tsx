"use client"

/**
 * Story 12.1: PWA Install Prompt
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface InstallPromptProps {
  onDismiss?: () => void
  className?: string
}

export function InstallPrompt({ onDismiss, className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice

    if (result.outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || isInstalled) return null

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50",
        "p-4 bg-bg-secondary rounded-2xl shadow-xl",
        "border border-bg-tertiary",
        "animate-in slide-in-from-bottom duration-300",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-2 text-text-tertiary hover:text-text-primary"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-accent-cyan/20 rounded-xl">
          <Smartphone className="w-6 h-6 text-accent-cyan" />
        </div>

        <div className="flex-1">
          <h3 className="font-display font-semibold text-text-primary">
            Installer l&apos;application
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Accédez à BetAnalytic directement depuis votre écran d&apos;accueil
          </p>

          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-medium text-sm hover:bg-accent-cyan/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Installer
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Story 12.2: Offline Indicator
 */
export function OfflineIndicator({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "py-2 px-4 bg-accent-orange text-bg-primary text-center text-sm font-medium",
        className
      )}
    >
      Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
    </div>
  )
}

/**
 * Story 12.3: Update Available Banner
 */
interface UpdateBannerProps {
  onUpdate: () => void
  onDismiss: () => void
  className?: string
}

export function UpdateBanner({ onUpdate, onDismiss, className }: UpdateBannerProps) {
  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50",
        "p-4 bg-accent-green text-bg-primary rounded-2xl shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Nouvelle version disponible</p>
          <p className="text-sm opacity-80">
            Mettez à jour pour profiter des dernières fonctionnalités
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm hover:bg-white/10 rounded-lg transition-colors"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={onUpdate}
            className="px-3 py-1.5 bg-white text-accent-green text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  )
}
