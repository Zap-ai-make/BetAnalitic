"use client"

import { useState, useEffect } from "react"
import { cn } from "~/lib/utils"
import { useBetSlipStore } from "~/lib/stores/betSlipStore"
import { X, ChevronDown, ChevronUp, Trash2, Plus, Minus, Loader2 } from "lucide-react"

interface BetSlipProps {
  onBetPlaced?: () => void
}

export function BetSlip({ onBetPlaced }: BetSlipProps) {
  const {
    selections, mode, stake, stakes,
    setMode, setStake, setMatchStake,
    removeSelection, clearSlip,
    comboOdds, potentialWin, totalStake,
    isOpen, openSlip, closeSlip,
  } = useBetSlipStore()

  const [expanded, setExpanded] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Auto-open when first selection added
  useEffect(() => {
    if (selections.length > 0) openSlip()
  }, [selections.length, openSlip])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePlaceBet = async () => {
    if (selections.length === 0) return
    setPlacing(true)
    try {
      if (mode === "combo") {
        const res = await fetch("/api/beta/betting/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            match_id: selections[0]!.matchId,
            home_team: selections[0]!.homeTeam,
            away_team: selections[0]!.awayTeam,
            competition: selections[0]!.competition,
            prediction: selections[0]!.market,
            prediction_label: selections.map((s) => s.label).join(" + "),
            odds: comboOdds(),
            stake,
            selections: selections.map((s) => ({
              match_id: s.matchId,
              market: s.market,
              label: s.label,
              odds: s.odds,
            })),
            bet_type: selections.length > 1 ? "combo" : "single",
          }),
        })
        if (!res.ok) throw new Error("Erreur serveur")
      } else {
        for (const sel of selections) {
          const st = stakes[sel.matchId] ?? stake
          const res = await fetch("/api/beta/betting/bet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              match_id: sel.matchId,
              home_team: sel.homeTeam,
              away_team: sel.awayTeam,
              competition: sel.competition,
              prediction: sel.market,
              prediction_label: sel.label,
              odds: sel.odds,
              stake: st,
              bet_type: "single",
            }),
          })
          if (!res.ok) throw new Error("Erreur serveur")
        }
      }

      clearSlip()
      onBetPlaced?.()
      showToast("Pari placé avec succès !", true)
    } catch {
      showToast("Erreur lors du placement", false)
    } finally {
      setPlacing(false)
    }
  }

  if (!isOpen && selections.length === 0) return null

  const combo = comboOdds()
  const win = potentialWin()
  const total = totalStake()

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2",
          toast.ok ? "bg-accent-green text-white" : "bg-accent-red text-white"
        )}>
          {toast.msg}
        </div>
      )}

      {/* Floating counter badge when collapsed */}
      {!isOpen && selections.length > 0 && (
        <button
          onClick={openSlip}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-accent-cyan rounded-full shadow-lg flex flex-col items-center justify-center animate-in fade-in"
        >
          <span className="text-bg-primary font-bold text-lg leading-none">{selections.length}</span>
          <span className="text-bg-primary text-[10px]">paris</span>
        </button>
      )}

      {/* Slip Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg">
          <div className="bg-bg-secondary border-t-2 border-accent-cyan shadow-2xl rounded-t-2xl overflow-hidden">

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-bg-tertiary cursor-pointer"
              onClick={() => setExpanded((e) => !e)}
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-text-primary">Coupon</span>
                <span className="px-2 py-0.5 bg-accent-cyan text-bg-primary text-xs font-bold rounded-full">
                  {selections.length}
                </span>
                {mode === "combo" && selections.length > 1 && (
                  <span className="text-sm text-accent-cyan font-bold">@{combo.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); clearSlip(); closeSlip() }}
                  className="p-1 text-text-tertiary hover:text-accent-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); closeSlip() }} className="p-1 text-text-tertiary">
                  <X className="w-4 h-4" />
                </button>
                {expanded ? <ChevronDown className="w-4 h-4 text-text-tertiary" /> : <ChevronUp className="w-4 h-4 text-text-tertiary" />}
              </div>
            </div>

            {expanded && (
              <>
                {/* Mode Toggle */}
                <div className="flex border-b border-bg-tertiary">
                  {(["single", "combo"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      disabled={m === "combo" && selections.length < 2}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium transition-colors",
                        mode === m ? "text-accent-cyan border-b-2 border-accent-cyan" : "text-text-tertiary",
                        m === "combo" && selections.length < 2 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {m === "single" ? "Simple" : `Combiné (${selections.length})`}
                    </button>
                  ))}
                </div>

                {/* Selections */}
                <div className="max-h-52 overflow-y-auto divide-y divide-bg-tertiary">
                  {selections.map((sel) => (
                    <div key={`${sel.matchId}-${sel.market}`} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-tertiary truncate">
                          {sel.homeTeam} vs {sel.awayTeam}
                        </p>
                        <p className="text-sm font-semibold text-text-primary">{sel.label}</p>
                      </div>
                      <span className="font-bold text-accent-cyan shrink-0">{sel.odds.toFixed(2)}</span>
                      {mode === "single" && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setMatchStake(sel.matchId, Math.max(10, (stakes[sel.matchId] ?? stake) - 10))}
                            className="w-6 h-6 rounded bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-10 text-center text-text-primary">
                            {stakes[sel.matchId] ?? stake}€
                          </span>
                          <button
                            onClick={() => setMatchStake(sel.matchId, (stakes[sel.matchId] ?? stake) + 10)}
                            className="w-6 h-6 rounded bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => removeSelection(sel.matchId, sel.market)}
                        className="p-1 text-text-tertiary hover:text-accent-red transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Stake (combo mode) */}
                {mode === "combo" && (
                  <div className="px-4 py-3 border-t border-bg-tertiary flex items-center gap-3">
                    <span className="text-sm text-text-secondary shrink-0">Mise</span>
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => setStake(Math.max(10, stake - 50))}
                        className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(Math.max(10, Number(e.target.value)))}
                        className="flex-1 text-center bg-bg-tertiary rounded-lg py-1.5 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 min-h-[36px]"
                      />
                      <span className="text-text-tertiary text-sm">€</span>
                      <button
                        onClick={() => setStake(stake + 50)}
                        className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {[100, 200, 500].map((v) => (
                      <button
                        key={v}
                        onClick={() => setStake(v)}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium shrink-0",
                          stake === v ? "bg-accent-cyan text-bg-primary" : "bg-bg-tertiary text-text-tertiary"
                        )}
                      >
                        {v}€
                      </button>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div className="px-4 py-3 bg-bg-tertiary space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">Mise totale</span>
                    <span className="text-text-primary font-medium">{total.toFixed(0)}€</span>
                  </div>
                  {mode === "combo" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-tertiary">Cote combinée</span>
                      <span className="text-accent-cyan font-bold">{combo.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-secondary font-medium">Gain potentiel</span>
                    <span className="text-accent-green font-bold text-lg">{win.toFixed(0)}€</span>
                  </div>
                </div>

                {/* Place Bet */}
                <div className="px-4 py-3">
                  <button
                    onClick={() => { void handlePlaceBet() }}
                    disabled={placing || selections.length === 0}
                    className={cn(
                      "w-full py-3 rounded-xl font-display font-bold text-bg-primary transition-all",
                      "bg-accent-cyan hover:bg-accent-cyan/90 active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {placing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {placing ? "Placement..." : `Placer ${mode === "combo" ? "le combiné" : `${selections.length} pari${selections.length > 1 ? "s" : ""}`}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
