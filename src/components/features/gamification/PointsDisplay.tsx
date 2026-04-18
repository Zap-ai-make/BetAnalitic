"use client"

/**
 * Epic 11 Story 11.3: Gamification Points System
 * Display user points, level, and progress
 */

import * as React from "react"
import { Trophy, TrendingUp, Gift } from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

interface PointsDisplayProps {
  variant?: "compact" | "full"
  className?: string
  onClick?: () => void
}

export function PointsDisplay({ variant = "compact", className, onClick }: PointsDisplayProps) {
  const { data: stats, isLoading } = api.gamification.getMyStats.useQuery()

  if (isLoading || !stats) {
    return null
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded-xl border border-bg-tertiary hover:border-accent-cyan transition-colors min-h-[44px]",
          className
        )}
      >
        <div className="w-6 h-6 rounded-full bg-accent-gold/20 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-accent-gold" />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold text-accent-gold">{stats.points.toLocaleString()}</p>
          <p className="text-[10px] text-text-tertiary">Niv. {stats.level}</p>
        </div>
      </button>
    )
  }

  return (
    <div className={cn("bg-bg-secondary rounded-2xl border border-bg-tertiary p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-gold to-accent-orange flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              Niveau {stats.level}
            </h3>
            <p className="text-sm text-text-tertiary">
              {stats.points.toLocaleString()} points
            </p>
          </div>
        </div>
        {stats.canClaimDaily && (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-accent-green/20 text-accent-green rounded-xl font-semibold hover:bg-accent-green/30 transition-colors text-sm min-h-[44px]"
          >
            <Gift className="w-4 h-4" />
            Réclamer +10
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Progression vers niveau {stats.level + 1}</span>
          <span className="text-text-primary font-semibold">
            {stats.progressToNext.toLocaleString()} / {stats.pointsForNext.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-bg-tertiary rounded-xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-text-primary">
            {stats.lifetimePoints.toLocaleString()}
          </p>
          <p className="text-xs text-text-tertiary">Points totaux</p>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-accent-gold mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-text-primary">
            Niveau {stats.level}
          </p>
          <p className="text-xs text-text-tertiary">Rang actuel</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Points animation that appears when points are earned
 */
interface PointsAnimationProps {
  points: number
  show: boolean
  onComplete?: () => void
}

export function PointsAnimation({ points, show, onComplete }: PointsAnimationProps) {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-accent-gold to-accent-orange text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
        <Trophy className="w-6 h-6" />
        <span className="font-display font-bold text-xl">
          +{points} points
        </span>
      </div>
    </div>
  )
}
