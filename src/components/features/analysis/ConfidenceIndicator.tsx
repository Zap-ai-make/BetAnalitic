"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

interface ConfidenceIndicatorProps {
  confidence: number // 0-100
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

function getConfidenceLevel(
  confidence: number
): { label: string; color: string; bgColor: string } {
  if (confidence >= 80) {
    return {
      label: "Très confiant",
      color: "text-accent-green",
      bgColor: "bg-accent-green",
    }
  }
  if (confidence >= 60) {
    return {
      label: "Confiant",
      color: "text-accent-cyan",
      bgColor: "bg-accent-cyan",
    }
  }
  if (confidence >= 40) {
    return {
      label: "Modéré",
      color: "text-accent-gold",
      bgColor: "bg-accent-gold",
    }
  }
  return {
    label: "Faible",
    color: "text-accent-red",
    bgColor: "bg-accent-red",
  }
}

const sizeStyles = {
  sm: { bar: "h-1", text: "text-xs", wrapper: "gap-1" },
  md: { bar: "h-2", text: "text-sm", wrapper: "gap-2" },
  lg: { bar: "h-3", text: "text-base", wrapper: "gap-3" },
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = "md",
  className,
}: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence)
  const styles = sizeStyles[size]

  return (
    <div className={cn("flex items-center", styles.wrapper, className)}>
      {/* Progress Bar */}
      <div className={cn("flex-1 bg-bg-tertiary rounded-full overflow-hidden", styles.bar)}>
        <div
          className={cn("h-full transition-all duration-500", level.bgColor)}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span className={cn("font-medium whitespace-nowrap", styles.text, level.color)}>
          {confidence}% - {level.label}
        </span>
      )}
    </div>
  )
}

// Compact version for inline use
export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: number
  className?: string
}) {
  const level = getConfidenceLevel(confidence)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        level.color,
        level.bgColor.replace("bg-", "bg-") + "/20",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", level.bgColor)} />
      {confidence}%
    </span>
  )
}
