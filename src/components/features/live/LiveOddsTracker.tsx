"use client"

/**
 * Story 7.3: Live Odds Tracker
 * Real-time odds movement visualization
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"

interface OddsValue {
  label: string
  value: number
  previousValue?: number
  trend?: "up" | "down" | "stable"
}

interface LiveOddsTrackerProps {
  matchId: string
  market: string // "1X2", "Over/Under", "BTTS", etc.
  odds: OddsValue[]
  lastUpdate?: Date
  suspended?: boolean
  className?: string
}

export function LiveOddsTracker({
  market,
  odds,
  lastUpdate,
  suspended = false,
  className,
}: LiveOddsTrackerProps) {
  return (
    <div
      className={cn(
        "p-4 bg-bg-secondary rounded-xl border border-bg-tertiary",
        suspended && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-text-primary">{market}</h4>
        {suspended ? (
          <span className="px-2 py-0.5 bg-accent-red/20 text-accent-red text-xs rounded-full">
            Suspendu
          </span>
        ) : lastUpdate ? (
          <span className="text-xs text-text-tertiary">
            Màj {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : null}
      </div>

      {/* Odds */}
      <div className="flex gap-2">
        {odds.map((odd, idx) => (
          <OddsButton key={idx} odd={odd} disabled={suspended} />
        ))}
      </div>
    </div>
  )
}

function OddsButton({ odd, disabled }: { odd: OddsValue; disabled?: boolean }) {
  const TrendIcon = odd.trend === "up" ? TrendingUp : odd.trend === "down" ? TrendingDown : Minus
  const trendColor =
    odd.trend === "up"
      ? "text-accent-green"
      : odd.trend === "down"
        ? "text-accent-red"
        : "text-text-tertiary"

  const change = odd.previousValue
    ? ((odd.value - odd.previousValue) / odd.previousValue) * 100
    : 0

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex-1 flex flex-col items-center py-3 px-2 rounded-lg",
        "bg-bg-tertiary transition-colors",
        "min-h-[60px]",
        disabled ? "cursor-not-allowed" : "hover:bg-accent-cyan/10 hover:ring-1 hover:ring-accent-cyan/50"
      )}
    >
      <span className="text-xs text-text-tertiary mb-1">{odd.label}</span>
      <span className="text-lg font-mono font-bold text-text-primary">
        {odd.value.toFixed(2)}
      </span>
      {odd.trend && odd.trend !== "stable" && (
        <div className={cn("flex items-center gap-0.5 mt-1", trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
        </div>
      )}
    </button>
  )
}

/**
 * Story 7.4: Odds Movement History
 */
interface OddsHistoryPoint {
  timestamp: Date
  value: number
}

interface OddsMovementProps {
  selectionName: string
  history: OddsHistoryPoint[]
  currentValue: number
  openingValue: number
  className?: string
}

export function OddsMovement({
  selectionName,
  history,
  currentValue,
  openingValue,
  className,
}: OddsMovementProps) {
  const change = ((currentValue - openingValue) / openingValue) * 100
  const isPositive = change > 0
  const isNegative = change < 0

  // Simple sparkline values
  const minVal = Math.min(...history.map((h) => h.value))
  const maxVal = Math.max(...history.map((h) => h.value))
  const range = maxVal - minVal || 1

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-primary font-medium">
          {selectionName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary font-mono">
            {openingValue.toFixed(2)}
          </span>
          <ArrowRight className="w-3 h-3 text-text-tertiary" />
          <span
            className={cn(
              "font-mono font-bold",
              isPositive && "text-accent-green",
              isNegative && "text-accent-red",
              !isPositive && !isNegative && "text-text-primary"
            )}
          >
            {currentValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-12 flex items-end gap-0.5">
        {history.slice(-20).map((point, idx) => {
          const height = ((point.value - minVal) / range) * 100
          return (
            <div
              key={idx}
              className={cn(
                "flex-1 rounded-t",
                idx === history.length - 1
                  ? "bg-accent-cyan"
                  : "bg-bg-tertiary"
              )}
              style={{ height: `${Math.max(10, height)}%` }}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-tertiary">
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}% depuis ouverture
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            isPositive && "bg-accent-green/20 text-accent-green",
            isNegative && "bg-accent-red/20 text-accent-red",
            !isPositive && !isNegative && "bg-bg-tertiary text-text-tertiary"
          )}
        >
          {isPositive ? "↑ Steam" : isNegative ? "↓ Drift" : "Stable"}
        </span>
      </div>
    </div>
  )
}
