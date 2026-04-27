"use client"

/**
 * Epic 12 Story 12.1: PWA Installation & App Shell
 * Install prompt component (A2HS - Add to Home Screen)
 */

import * as React from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check if user has permanently dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed === "true") {
      return
    }

    // Listen for beforeinstallprompt event — show immediately
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
      localStorage.setItem("pwa-installed", "true")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
      setShowBanner(false)
    } else {
      console.log("User dismissed the install prompt")
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border-2 border-accent-cyan/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-accent-cyan" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-text-primary mb-1">
              Installer BetAnalytic
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Accédez rapidement à vos analyses avec l&apos;application installée sur votre appareil
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors text-sm min-h-[40px]"
              >
                Installer
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

        <div className="mt-3 pt-3 border-t border-bg-tertiary">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>✓</span>
            <span>Accès instantané</span>
            <span className="text-bg-tertiary">•</span>
            <span>Mode hors-ligne</span>
            <span className="text-bg-tertiary">•</span>
            <span>Notifications</span>
          </div>
        </div>
      </div>
    </div>
  )
}
