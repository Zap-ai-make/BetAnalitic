"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AccuracyStats {
  overall: number
  last30Days: number
  byCategory: {
    goals: number
    corners: number
    cards: number
    results: number
  }
  totalPredictions: number
  baselineComparison: number // vs random
}

interface AgentAccuracyStatsProps {
  agentId: string
  agentName: string
  stats?: AccuracyStats
  className?: string
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-tertiary">{label}</span>
        <span className={cn("font-medium", color)}>{value}%</span>
      </div>
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color.replace("text-", "bg-"))}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function AgentAccuracyStats({
  agentId: _agentId,
  agentName,
  stats,
  className,
}: AgentAccuracyStatsProps) {
  if (!stats || stats.totalPredictions < 10) {
    return (
      <div className={cn("p-4 bg-bg-tertiary rounded-lg text-center", className)}>
        <p className="text-text-tertiary text-sm">
          📊 Pas assez de données pour {agentName}
        </p>
        <p className="text-text-tertiary text-xs mt-1">
          Minimum 10 prédictions requises
        </p>
      </div>
    )
  }

  const trend = stats.last30Days - stats.overall
  const TrendIcon = trend > 2 ? TrendingUp : trend < -2 ? TrendingDown : Minus
  const trendColor =
    trend > 2 ? "text-accent-green" : trend < -2 ? "text-accent-red" : "text-text-tertiary"

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-lg space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-text-primary">
          Précision historique
        </h4>
        <span className="text-xs text-text-tertiary">
          {stats.totalPredictions} prédictions
        </span>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-bg-tertiary rounded-lg text-center">
          <p className="text-2xl font-bold text-accent-cyan">{stats.overall}%</p>
          <p className="text-xs text-text-tertiary">Global</p>
        </div>
        <div className="p-3 bg-bg-tertiary rounded-lg text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-text-primary">{stats.last30Days}%</p>
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
          </div>
          <p className="text-xs text-text-tertiary">30 derniers jours</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-text-tertiary uppercase">Par catégorie</p>
        <StatBar label="Résultats" value={stats.byCategory.results} color="text-accent-cyan" />
        <StatBar label="Buts" value={stats.byCategory.goals} color="text-accent-green" />
        <StatBar label="Corners" value={stats.byCategory.corners} color="text-accent-gold" />
        <StatBar label="Cartons" value={stats.byCategory.cards} color="text-accent-red" />
      </div>

      {/* Baseline Comparison */}
      <div className="pt-3 border-t border-bg-tertiary">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">vs Baseline aléatoire</span>
          <span
            className={cn(
              "font-semibold",
              stats.baselineComparison > 0 ? "text-accent-green" : "text-accent-red"
            )}
          >
            {stats.baselineComparison > 0 ? "+" : ""}
            {stats.baselineComparison}%
          </span>
        </div>
      </div>
    </div>
  )
}
