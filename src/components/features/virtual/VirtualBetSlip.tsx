"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { X, Plus, Minus } from "lucide-react"

interface BetSelection {
  id: string
  matchId: string
  homeTeam: string
  awayTeam: string
  market: string
  selection: string
  odds: number
}

interface VirtualBetSlipProps {
  selections: BetSelection[]
  balance: number
  onRemoveSelection: (id: string) => void
  onPlaceBet: (stake: number) => void
  onClear: () => void
  className?: string
}

export function VirtualBetSlip({
  selections,
  balance,
  onRemoveSelection,
  onPlaceBet,
  onClear,
  className,
}: VirtualBetSlipProps) {
  const [stake, setStake] = React.useState(10)

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)
  const potentialWin = stake * totalOdds

  const handleStakeChange = (delta: number) => {
    setStake((prev) => Math.max(1, Math.min(balance, prev + delta)))
  }

  const handlePlaceBet = () => {
    if (stake <= balance && selections.length > 0) {
      onPlaceBet(stake)
    }
  }

  if (selections.length === 0) {
    return (
      <div className={cn("p-4 bg-bg-secondary rounded-xl text-center", className)}>
        <p className="text-text-tertiary">Ajoutez des sélections à votre coupon virtuel</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-bg-secondary rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-text-primary">
            Coupon Virtuel
          </span>
          <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-xs rounded">
            DÉMO
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-text-tertiary hover:text-accent-red transition-colors"
        >
          Vider
        </button>
      </div>

      {/* Selections */}
      <div className="p-4 space-y-3">
        {selections.map((selection) => (
          <div
            key={selection.id}
            className="flex items-start justify-between p-3 bg-bg-tertiary rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">
                {selection.homeTeam} vs {selection.awayTeam}
              </p>
              <p className="text-xs text-text-tertiary">
                {selection.market}: {selection.selection}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-cyan font-bold">
                {selection.odds.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onRemoveSelection(selection.id)}
                className="p-1 text-text-tertiary hover:text-accent-red transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stake & Summary */}
      <div className="px-4 pb-4 space-y-4">
        {/* Total Odds */}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Cote totale</span>
          <span className="font-bold text-accent-cyan">{totalOdds.toFixed(2)}</span>
        </div>

        {/* Stake Input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStakeChange(-5)}
            className={cn(
              "p-2 bg-bg-tertiary rounded-lg",
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "text-text-secondary hover:text-text-primary transition-colors"
            )}
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="number"
              value={stake}
              onChange={(e) =>
                setStake(Math.max(1, Math.min(balance, Number(e.target.value))))
              }
              className={cn(
                "w-full px-4 py-3 bg-bg-tertiary rounded-lg",
                "text-center text-lg font-bold text-text-primary",
                "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              €
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleStakeChange(5)}
            className={cn(
              "p-2 bg-bg-tertiary rounded-lg",
              "min-w-[44px] min-h-[44px] flex items-center justify-center",
              "text-text-secondary hover:text-text-primary transition-colors"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Potential Win */}
        <div className="flex justify-between py-2 border-t border-bg-tertiary">
          <span className="text-text-secondary">Gain potentiel</span>
          <span className="font-bold text-accent-green">
            {potentialWin.toFixed(2)}€
          </span>
        </div>

        {/* Place Bet Button */}
        <button
          type="button"
          onClick={handlePlaceBet}
          disabled={stake > balance}
          className={cn(
            "w-full px-4 py-3 rounded-lg",
            "bg-accent-cyan text-bg-primary",
            "font-display font-bold",
            "min-h-[48px] transition-colors",
            stake > balance
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent-cyan/80"
          )}
        >
          Placer le pari virtuel
        </button>

        <p className="text-xs text-text-tertiary text-center">
          Solde disponible: {balance.toLocaleString("fr-FR")}€
        </p>
      </div>
    </div>
  )
}
