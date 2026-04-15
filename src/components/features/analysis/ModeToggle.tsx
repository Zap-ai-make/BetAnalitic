"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export type AnalysisMode = "analytical" | "supporter"

interface ModeToggleProps {
  mode: AnalysisMode
  onModeChange: (mode: AnalysisMode) => void
  className?: string
}

export function ModeToggle({ mode, onModeChange, className }: ModeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-bg-tertiary rounded-full",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange("analytical")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "font-display text-sm font-medium",
          "min-h-[44px] transition-all duration-200",
          mode === "analytical"
            ? "bg-accent-cyan text-bg-primary shadow-lg"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <span>📊</span>
        <span>Analytique</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("supporter")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "font-display text-sm font-medium",
          "min-h-[44px] transition-all duration-200",
          mode === "supporter"
            ? "bg-accent-green text-bg-primary shadow-lg"
            : "text-text-secondary hover:text-text-primary"
        )}
      >
        <span>⚽</span>
        <span>Supporter</span>
      </button>
    </div>
  )
}
