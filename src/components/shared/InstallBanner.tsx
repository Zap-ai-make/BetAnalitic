"use client"

import * as React from "react"
import { X, Download, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function getPlatform(): "android" | "ios" | "other" {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return "android"
  if (/iphone|ipad|ipod/.test(ua)) return "ios"
  return "other"
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

export function InstallBanner() {
  const [visible, setVisible] = React.useState(false)
  const [platform, setPlatform] = React.useState<"android" | "ios" | "other">("other")
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)

  React.useEffect(() => {
    if (isStandalone()) return
    if (sessionStorage.getItem("ib_dismissed")) return

    const p = getPlatform()
    setPlatform(p)
    if (p === "other") return

    if (p === "android") {
      const onPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setVisible(true)
      }
      const onInstalled = () => setVisible(false)
      window.addEventListener("beforeinstallprompt", onPrompt)
      window.addEventListener("appinstalled", onInstalled)
      // Show APK option after 4s even without beforeinstallprompt (e.g. already installed PWA criteria)
      const t = setTimeout(() => setVisible(true), 4000)
      return () => {
        window.removeEventListener("beforeinstallprompt", onPrompt)
        window.removeEventListener("appinstalled", onInstalled)
        clearTimeout(t)
      }
    }

    if (p === "ios") {
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem("ib_dismissed", "1")
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") dismiss()
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-bg-secondary/95 backdrop-blur-sm border-t border-bg-tertiary"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="p-4">
        {platform === "ios" ? (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0">
              <Share className="w-4.5 h-4.5 text-accent-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">Installer BetAnalytic</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Appuie sur <Share className="inline w-3 h-3 mx-0.5" /> dans Safari, puis{" "}
                <strong className="text-text-primary">&quot;Sur l&apos;écran d&apos;accueil&quot;</strong>
              </p>
            </div>
            <button onClick={dismiss} className="text-text-tertiary hover:text-text-primary p-1 -mt-1 -mr-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0">
                <Download className="w-4.5 h-4.5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Installer BetAnalytic</p>
                <p className="text-xs text-text-secondary">Accès rapide · Expérience plein écran</p>
              </div>
              <button onClick={dismiss} className="text-text-tertiary hover:text-text-primary p-1 -mt-1 -mr-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex-1 h-9 rounded-lg bg-accent-cyan text-bg-primary text-sm font-semibold"
                >
                  Installer maintenant
                </button>
              )}
              <a
                href="/download/app.apk"
                download
                className="flex-1 h-9 rounded-lg border border-bg-tertiary text-text-secondary text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-bg-tertiary transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger l&apos;APK
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
