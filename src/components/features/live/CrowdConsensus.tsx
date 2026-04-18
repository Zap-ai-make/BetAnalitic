"use client"

/**
 * Crowd Consensus Component
 * Story 7.7: Display aggregated predictions from community
 */

import * as React from "react"
import { Users, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "~/lib/utils"

export interface ConsensusPrediction {
  id: string
  label: string
  percentage: number
  trend?: "up" | "down" | "stable"
}

interface CrowdConsensusProps {
  predictions: ConsensusPrediction[]
  totalUsers: number
  className?: string
}

export function CrowdConsensus({
  predictions,
  totalUsers,
  className,
}: CrowdConsensusProps) {
  const topPrediction = predictions[0]

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-xl p-4 border border-bg-tertiary space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-semibold text-text-secondary">
            Consensus communautaire
          </span>
        </div>
        <span className="text-sm font-bold text-accent-cyan">
          {totalUsers} utilisateur{totalUsers > 1 ? "s" : ""}
        </span>
      </div>

      {/* Top Prediction */}
      {topPrediction && (
        <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">
              {topPrediction.label}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-accent-cyan">
                {topPrediction.percentage}%
              </span>
              {topPrediction.trend === "up" && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {topPrediction.trend === "down" && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
              style={{ width: `${topPrediction.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Other Predictions */}
      {predictions.length > 1 && (
        <div className="space-y-2">
          {predictions.slice(1).map((pred) => (
            <div key={pred.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-text-tertiary truncate">
                  {pred.label}
                </span>
                {pred.trend === "up" && (
                  <TrendingUp className="w-3 h-3 text-green-500 shrink-0" />
                )}
                {pred.trend === "down" && (
                  <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${pred.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-text-primary w-10 text-right">
                  {pred.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {predictions.length === 0 && (
        <div className="text-center py-4">
          <Users className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-tertiary">
            Pas encore de prédictions
          </p>
        </div>
      )}
    </div>
  )
}
