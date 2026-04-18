"use client"

/**
 * Alert Overlay Component
 * Story 7.4: Overlay alerts for agent-detected events
 */

import * as React from "react"
import { X, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "~/lib/utils"

interface AlertOverlayProps {
  agentId: string
  agentName: string
  agentColor: string
  message: string
  fullContent?: string
  isOpen: boolean
  onClose: () => void
  onViewAnalysis?: () => void
}

export function AlertOverlay({
  agentName,
  agentColor,
  message,
  fullContent,
  isOpen,
  onClose,
  onViewAnalysis,
}: AlertOverlayProps) {
  const [showFull, setShowFull] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) {
      setShowFull(false)
      return
    }

    // Vibration on mobile
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(100)
    }

    // Auto-dismiss after 10s if not interacted
    const timer = setTimeout(() => {
      onClose()
    }, 10_000)

    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 animate-in slide-in-from-bottom duration-300">
        <div className="bg-bg-secondary rounded-t-2xl shadow-2xl border-t border-bg-tertiary max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-bg-secondary border-b border-bg-tertiary p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center animate-bounce ring-4 ring-offset-2 ring-offset-bg-secondary"
                style={{
                  backgroundColor: agentColor,
                  borderColor: `${agentColor}40`,
                }}
              >
                <TrendingUp className="w-5 h-5 text-bg-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-text-primary">
                  {agentName}
                </h3>
                <p className="text-xs text-text-tertiary">Alerte Live</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Alert Icon */}
            <div className="flex items-center gap-2 text-accent-gold">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-semibold">Événement détecté</span>
            </div>

            {/* Message Preview */}
            <div className="bg-bg-tertiary rounded-lg p-3">
              <p className="text-sm text-text-primary leading-relaxed">
                {message}
              </p>
            </div>

            {/* Full Content (if expanded) */}
            {showFull && fullContent && (
              <div className="bg-gradient-to-br from-bg-tertiary to-bg-tertiary/50 rounded-lg p-4 border border-accent-cyan/20">
                <h4 className="font-semibold text-sm text-text-primary mb-2">
                  Analyse complète
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {fullContent}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {fullContent && !showFull && (
                <button
                  onClick={() => {
                    setShowFull(true)
                    onViewAnalysis?.()
                  }}
                  className="flex-1 px-4 py-3 bg-accent-cyan text-bg-primary rounded-lg font-semibold text-sm hover:bg-accent-cyan/90 transition-colors"
                >
                  Voir Analyse
                </button>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "px-4 py-3 bg-bg-tertiary text-text-primary rounded-lg font-semibold text-sm hover:bg-bg-tertiary/70 transition-colors",
                  !fullContent || showFull ? "flex-1" : "flex-none"
                )}
              >
                {showFull ? "Fermer" : "Ignorer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
