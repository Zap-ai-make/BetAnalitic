"use client"

import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"
import { cn } from "~/lib/utils"
import { Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"

export default function AnalysisPage() {
  const { matches, removeMatch, clearCoupon } = useCouponStore()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-text-primary">
                Mon Coupon
              </h1>
              <p className="text-text-secondary text-sm">
                {matches.length} / 10 matchs sélectionnés
              </p>
            </div>
            {matches.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCoupon}
                className="text-accent-red hover:bg-accent-red/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider
              </Button>
            )}
          </div>

          {/* Empty State */}
          {matches.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="font-display text-lg font-semibold text-text-primary mb-2">
                Aucun match sélectionné
              </h2>
              <p className="text-text-secondary">
                Ajoutez des matchs depuis l&apos;onglet Matchs pour commencer votre analyse
              </p>
            </div>
          )}

          {/* Matches List */}
          {matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={cn(
                    "bg-bg-secondary rounded-lg p-4",
                    "border border-bg-tertiary",
                    "hover:border-accent-cyan/30 transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-text-primary">
                          {match.homeTeam}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-text-primary">
                          {match.awayTeam}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <span>{match.league}</span>
                        <span>•</span>
                        <span>{match.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMatch(match.id)}
                      className={cn(
                        "p-2 rounded-full",
                        "text-text-secondary hover:text-accent-red hover:bg-accent-red/10",
                        "transition-colors min-w-[44px] min-h-[44px]"
                      )}
                      aria-label="Retirer du coupon"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Analyze Button */}
              <Button
                size="lg"
                className={cn(
                  "w-full mt-6",
                  "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90",
                  "font-display font-semibold text-lg",
                  "min-h-[56px]"
                )}
                disabled={matches.length === 0}
              >
                🤖 Analyser avec les Agents
              </Button>
            </div>
          )}
        </div>
      </main>

      <DashboardNav />
    </div>
  )
}
