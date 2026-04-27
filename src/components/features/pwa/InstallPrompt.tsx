"use client"

import * as React from "react"
import { Download, X, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [isManual, setIsManual] = React.useState(false) // no beforeinstallprompt — show manual guide
  const deferredRef = React.useRef<BeforeInstallPromptEvent | null>(null)

  React.useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    if (localStorage.getItem("pwa-install-dismissed") === "true") return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const ev = e as BeforeInstallPromptEvent
      deferredRef.current = ev
      setDeferredPrompt(ev)
      setIsManual(false)
      setShowBanner(true)
      clearTimeout(fallbackTimer)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Fallback for Samsung Internet / Firefox / other browsers that never fire beforeinstallprompt
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)
    let fallbackTimer: ReturnType<typeof setTimeout>
    if (isMobile) {
      fallbackTimer = setTimeout(() => {
        if (!deferredRef.current && !window.matchMedia("(display-mode: standalone)").matches) {
          setIsManual(true)
          setShowBanner(true)
        }
      }, 4000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
      deferredRef.current = null
      localStorage.setItem("pwa-installed", "true")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setShowBanner(false)
    setDeferredPrompt(null)
    deferredRef.current = null
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !showBanner) return null

  // Detect iOS for specific instructions
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isSamsungOrAndroid = /Android|Samsung/i.test(navigator.userAgent)

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-linear-to-br from-accent-cyan/10 to-accent-purple/10 border-2 border-accent-cyan/30 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 w-12 h-12 bg-accent-cyan/20 rounded-xl flex items-center justify-center">
            {isManual ? <Share className="w-6 h-6 text-accent-cyan" /> : <Download className="w-6 h-6 text-accent-cyan" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-text-primary mb-1">
              Installer BetAnalytic
            </h3>

            {isManual ? (
              <p className="text-sm text-text-secondary mb-3">
                {isIOS
                  ? "Appuyez sur le bouton Partager puis « Sur l'écran d'accueil »"
                  : isSamsungOrAndroid
                  ? "Ouvrez le menu du navigateur (⋮) puis « Ajouter à l'écran d'accueil »"
                  : "Ouvrez le menu de votre navigateur et choisissez « Installer » ou « Ajouter à l'écran d'accueil »"}
              </p>
            ) : (
              <>
                <p className="text-sm text-text-secondary mb-3">
                  Accédez rapidement à vos analyses depuis votre écran d&apos;accueil
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors text-sm min-h-10"
                  >
                    Installer
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-xl font-semibold hover:bg-bg-tertiary/80 transition-colors text-sm min-h-10"
                  >
                    Plus tard
                  </button>
                </div>
              </>
            )}

            {isManual && (
              <button
                onClick={handleDismiss}
                className="mt-2 text-xs text-text-tertiary hover:text-text-secondary underline"
              >
                Fermer
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-bg-tertiary">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>✓</span><span>Accès instantané</span>
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
