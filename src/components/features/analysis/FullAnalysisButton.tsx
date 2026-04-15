"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Zap, X } from "lucide-react"
import { getAgentRegistry } from "~/lib/agents/registry"

interface FullAnalysisButtonProps {
  onStart: () => void
  matchCount: number
  isRunning?: boolean
  progress?: { current: number; total: number }
  disabled?: boolean
  className?: string
}

export function FullAnalysisButton({
  onStart,
  matchCount,
  isRunning = false,
  progress,
  disabled = false,
  className,
}: FullAnalysisButtonProps) {
  const [showConfirm, setShowConfirm] = React.useState(false)
  const registry = getAgentRegistry()
  const agents = registry.getEnabled()

  const handleClick = () => {
    if (matchCount === 0) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onStart()
  }

  // Running state
  if (isRunning && progress) {
    const percentage = Math.round((progress.current / progress.total) * 100)

    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "w-full px-6 py-4 rounded-xl",
            "bg-gradient-to-r from-accent-cyan/20 to-accent-green/20",
            "border border-accent-cyan/30"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-semibold text-text-primary">
              Analyse en cours...
            </span>
            <span className="text-sm text-accent-cyan">
              {progress.current}/{progress.total} agents
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-green transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || matchCount === 0}
        className={cn(
          "w-full px-6 py-4 rounded-xl",
          "bg-gradient-to-r from-accent-cyan to-accent-green",
          "font-display font-bold text-bg-primary",
          "flex items-center justify-center gap-3",
          "min-h-[56px] transition-all duration-200",
          "shadow-lg shadow-accent-cyan/20",
          matchCount === 0 || disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-xl hover:shadow-accent-cyan/30 hover:scale-[1.02]",
          className
        )}
      >
        <Zap className="w-5 h-5" />
        <span>Analyse Complète ({agents.length} agents)</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-bg-secondary rounded-xl p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-cyan/20 rounded-full">
                  <Zap className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    Analyse Complète
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {matchCount} match{matchCount > 1 ? "s" : ""} dans votre coupon
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="p-2 text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              Les {agents.length} agents vont analyser votre coupon:
            </p>

            {/* Agent Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex flex-col items-center p-2 bg-bg-tertiary rounded-lg"
                  title={agent.name}
                >
                  <span className="text-lg">{agent.emoji}</span>
                  <span className="text-[10px] text-text-tertiary truncate w-full text-center">
                    {agent.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg",
                  "bg-bg-tertiary text-text-secondary",
                  "font-display text-sm",
                  "min-h-[44px] transition-colors",
                  "hover:bg-bg-primary"
                )}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg",
                  "bg-accent-cyan text-bg-primary",
                  "font-display text-sm font-semibold",
                  "min-h-[44px] transition-colors",
                  "hover:bg-accent-cyan/80"
                )}
              >
                Lancer l&apos;analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
