"use client"

import { cn } from "~/lib/utils"
import { useBetSlipStore, type BetMarket } from "~/lib/stores/betSlipStore"
import { TrendingUp } from "lucide-react"

interface OddsButtonProps {
  matchId: string
  homeTeam: string
  awayTeam: string
  competition: string
  market: BetMarket
  label: string
  odds: number | null
  className?: string
}

export function OddsButton({
  matchId,
  homeTeam,
  awayTeam,
  competition,
  market,
  label,
  odds,
  className,
}: OddsButtonProps) {
  const { addSelection, isSelected } = useBetSlipStore()
  const selected = isSelected(matchId, market)

  if (odds === null || odds <= 1) {
    return (
      <div className={cn("flex flex-col items-center py-2 px-3 rounded-lg bg-bg-tertiary opacity-40", className)}>
        <span className="text-xs text-text-tertiary">{label}</span>
        <span className="text-sm font-bold text-text-tertiary">-</span>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        addSelection({ matchId, homeTeam, awayTeam, competition, market, label, odds })
      }}
      className={cn(
        "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-150",
        "min-h-[44px] active:scale-95",
        selected
          ? "bg-accent-cyan text-bg-primary shadow-[0_0_12px_rgba(0,212,255,0.4)]"
          : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan/10 hover:border-accent-cyan/40 border border-transparent",
        className
      )}
    >
      <span className={cn("text-xs", selected ? "text-bg-primary/80" : "text-text-tertiary")}>{label}</span>
      <span className="text-sm font-bold">{odds.toFixed(2)}</span>
      {selected && <TrendingUp className="w-3 h-3 mt-0.5" />}
    </button>
  )
}
