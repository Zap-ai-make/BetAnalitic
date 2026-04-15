"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Wallet, TrendingUp, TrendingDown, RotateCcw } from "lucide-react"

interface VirtualBalanceProps {
  balance: number
  initialBalance: number
  totalBets: number
  winRate: number
  profitLoss: number
  onReset?: () => void
  className?: string
}

export function VirtualBalance({
  balance,
  initialBalance,
  totalBets,
  winRate,
  profitLoss,
  onReset,
  className,
}: VirtualBalanceProps) {
  const roi = initialBalance > 0 ? ((profitLoss / initialBalance) * 100).toFixed(1) : "0"
  const isPositive = profitLoss >= 0

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent-cyan/20 rounded-full">
            <Wallet className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <span className="text-xs text-text-tertiary uppercase tracking-wide">
              Compte Virtuel
            </span>
            <span className="ml-2 px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-xs rounded">
              DÉMO
            </span>
          </div>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary",
              "transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            )}
            title="Réinitialiser le compte"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Balance */}
      <div className="text-center py-4">
        <p className="text-4xl font-bold text-text-primary">
          {balance.toLocaleString("fr-FR")}€
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-accent-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-accent-red" />
          )}
          <span
            className={cn(
              "font-semibold",
              isPositive ? "text-accent-green" : "text-accent-red"
            )}
          >
            {isPositive ? "+" : ""}
            {profitLoss.toLocaleString("fr-FR")}€
          </span>
          <span className="text-text-tertiary text-sm">({roi}% ROI)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-bg-tertiary rounded-lg text-center">
          <p className="text-lg font-bold text-text-primary">{totalBets}</p>
          <p className="text-xs text-text-tertiary">Paris</p>
        </div>
        <div className="p-3 bg-bg-tertiary rounded-lg text-center">
          <p className="text-lg font-bold text-accent-green">{winRate}%</p>
          <p className="text-xs text-text-tertiary">Win Rate</p>
        </div>
        <div className="p-3 bg-bg-tertiary rounded-lg text-center">
          <p className="text-lg font-bold text-text-primary">
            {initialBalance.toLocaleString("fr-FR")}€
          </p>
          <p className="text-xs text-text-tertiary">Initial</p>
        </div>
      </div>
    </div>
  )
}
