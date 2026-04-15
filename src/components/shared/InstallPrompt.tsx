"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { usePWAInstall } from "~/hooks/usePWAInstall"

export interface InstallPromptProps {
  className?: string
  onInstalled?: () => void
  onDismissed?: () => void
}

export function InstallPrompt({
  className,
  onInstalled,
  onDismissed,
}: InstallPromptProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()
  const [dismissed, setDismissed] = React.useState(false)
  const [showIOSGuide, setShowIOSGuide] = React.useState(false)

  // Check localStorage for dismissal
  React.useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10)
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - dismissedAt < 7 * dayInMs) {
        setDismissed(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    onDismissed?.()
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      onInstalled?.()
    }
  }

  // Don't show if already installed, dismissed, or not installable (except iOS)
  if (isInstalled || dismissed || (!isInstallable && !isIOS)) {
    return null
  }

  // iOS specific guide
  if (isIOS) {
    return (
      <>
        <div
          className={cn(
            "fixed bottom-20 left-4 right-4 z-40",
            "bg-bg-secondary rounded-lg p-4 shadow-lg border border-bg-tertiary",
            className
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-text-primary text-base">
                Installer BetAnalytic
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Ajoutez l&apos;app à votre écran d&apos;accueil pour un accès
                rapide
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-text-tertiary hover:text-text-primary p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowIOSGuide(true)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg font-semibold text-sm",
                "bg-accent-cyan text-bg-primary",
                "min-h-[44px]"
              )}
            >
              Comment faire ?
            </button>
            <button
              onClick={handleDismiss}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm",
                "bg-bg-tertiary text-text-secondary",
                "min-h-[44px]"
              )}
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* iOS Installation Guide Modal */}
        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="bg-bg-secondary rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-xl text-text-primary mb-4">
                Installer sur iOS
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-cyan/20 text-accent-cyan font-bold">
                    1
                  </span>
                  <p className="text-text-secondary text-sm pt-1">
                    Appuyez sur le bouton{" "}
                    <span className="text-text-primary">Partager</span> (⬆️) en
                    bas de Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-cyan/20 text-accent-cyan font-bold">
                    2
                  </span>
                  <p className="text-text-secondary text-sm pt-1">
                    Faites défiler et appuyez sur{" "}
                    <span className="text-text-primary">
                      Sur l&apos;écran d&apos;accueil
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-cyan/20 text-accent-cyan font-bold">
                    3
                  </span>
                  <p className="text-text-secondary text-sm pt-1">
                    Appuyez sur{" "}
                    <span className="text-text-primary">Ajouter</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowIOSGuide(false)
                  handleDismiss()
                }}
                className={cn(
                  "w-full mt-6 px-4 py-3 rounded-lg font-semibold",
                  "bg-accent-cyan text-bg-primary",
                  "min-h-[44px]"
                )}
              >
                Compris !
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Standard install prompt (Android, Desktop)
  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-40",
        "bg-bg-secondary rounded-lg p-4 shadow-lg border border-bg-tertiary",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-text-primary text-base">
            Installer BetAnalytic
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            Accédez à l&apos;app directement depuis votre écran d&apos;accueil
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-tertiary hover:text-text-primary p-1"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className={cn(
            "flex-1 px-4 py-2 rounded-lg font-semibold text-sm",
            "bg-accent-cyan text-bg-primary",
            "min-h-[44px]"
          )}
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className={cn(
            "px-4 py-2 rounded-lg font-semibold text-sm",
            "bg-bg-tertiary text-text-secondary",
            "min-h-[44px]"
          )}
        >
          Plus tard
        </button>
      </div>
    </div>
  )
}
