"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { type Balance, fmtAmount, COUPONS_KEY, writeBalance } from "~/lib/balance"
import { predictionLabel, SIGNAL_TYPE_LABELS } from "~/lib/labels"
import { useRouter } from "next/navigation"

export interface CouponPick {
  id: string
  matchId: string
  prediction: string
  odds: number
  signalType: string
  match: {
    homeTeam: { name: string }
    awayTeam: { name: string }
  }
}

interface CouponPanelProps {
  selectedPicksData: CouponPick[]
  totalOdds: number
  balance: Balance
  onBalanceChange: (b: Balance) => void
  onClear: () => void
}

export const CouponPanel = React.memo(function CouponPanel({
  selectedPicksData,
  totalOdds,
  balance,
  onBalanceChange,
  onClear,
}: CouponPanelProps) {
  const router = useRouter()
  const [stake, setStake] = React.useState("")
  const stakeNum = React.useMemo(() => parseFloat(stake) || 0, [stake])
  const potentialWin = React.useMemo(() => stakeNum * totalOdds, [stakeNum, totalOdds])

  const handlePlaceBet = () => {
    if (selectedPicksData.length === 0 || stakeNum <= 0 || stakeNum > balance.amount) return
    const legs = selectedPicksData.map((pick) => ({
      matchId: pick.matchId,
      homeTeam: pick.match.homeTeam.name,
      awayTeam: pick.match.awayTeam.name,
      predictionLabel: `${predictionLabel(pick.prediction)} — ${pick.signalType}`,
      outcomeCode: predictionLabel(pick.prediction),
      apiPrediction: pick.prediction,
      odds: pick.odds,
    }))
    const coupon = {
      id: `coupon-${Date.now()}`,
      legs, totalOdds, stake: stakeNum, potentialWin,
      status: "pending" as const, createdAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem(COUPONS_KEY) ?? "[]") as unknown[]
      localStorage.setItem(COUPONS_KEY, JSON.stringify([coupon, ...existing]))
    } catch { /* noop */ }
    const newBalance = { ...balance, amount: balance.amount - stakeNum }
    onBalanceChange(newBalance)
    writeBalance(newBalance)
    void Promise.allSettled(
      legs.map((leg) =>
        fetch("/api/beta/betting/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match_id: leg.matchId, prediction: leg.apiPrediction, stake: stakeNum / legs.length, odds: leg.odds }),
        })
      )
    )
    onClear()
    setStake("")
    router.push("/paris")
  }

  if (selectedPicksData.length === 0) return null

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 border-t-2 border-accent-cyan/30 bg-bg-secondary px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">Mon Coupon ({selectedPicksData.length})</span>
        <span className="text-sm font-mono text-accent-cyan font-bold">×{totalOdds.toFixed(2)}</span>
      </div>
      <div className="space-y-1">
        {selectedPicksData.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-xs">
            <span className="text-text-secondary truncate flex-1 overflow-hidden">
              {p.match.homeTeam.name} vs {p.match.awayTeam.name} · {SIGNAL_TYPE_LABELS[p.signalType as keyof typeof SIGNAL_TYPE_LABELS] ?? p.signalType}
            </span>
            <span className="text-accent-cyan font-bold font-mono ml-2 shrink-0">
              {predictionLabel(p.prediction)} ×{p.odds.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder={`Mise en ${balance.currency}`}
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-bg-primary border border-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cyan"
        />
        <span className="text-xs text-text-tertiary">{balance.currency}</span>
      </div>
      {stakeNum > 0 && (
        <p className="text-xs text-text-tertiary">
          Gain potentiel : <span className="text-green-400 font-bold">{fmtAmount(potentialWin, balance.currency)}</span>
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-red-400 border border-bg-tertiary transition-colors"
        >
          Vider
        </button>
        <button
          onClick={handlePlaceBet}
          disabled={stakeNum <= 0 || stakeNum > balance.amount}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
            stakeNum > 0 && stakeNum <= balance.amount
              ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          )}
        >
          Valider le coupon →
        </button>
      </div>
    </div>
  )
})
