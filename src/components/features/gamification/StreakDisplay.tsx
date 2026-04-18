"use client"

/**
 * Epic 11 Story 11.6: Streak Tracking
 * Display user's daily streak
 */

import * as React from "react"
import { Flame, TrendingUp, Zap } from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

interface StreakDisplayProps {
  variant?: "compact" | "full"
  className?: string
  onClick?: () => void
}

export function StreakDisplay({ variant = "compact", className, onClick }: StreakDisplayProps) {
  const { data: streak, isLoading } = api.streak.getMyStreak.useQuery()

  if (isLoading || !streak) {
    return null
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 bg-bg-secondary rounded-xl border border-bg-tertiary hover:border-accent-orange transition-colors min-h-[44px]",
          className
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          streak.currentStreak > 0 ? "bg-accent-orange/20" : "bg-bg-tertiary"
        )}>
          <Flame className={cn(
            "w-3.5 h-3.5",
            streak.currentStreak > 0 ? "text-accent-orange" : "text-text-tertiary"
          )} />
        </div>
        <div className="text-left">
          <p className={cn(
            "text-xs font-semibold",
            streak.currentStreak > 0 ? "text-accent-orange" : "text-text-tertiary"
          )}>
            {streak.currentStreak} jour{streak.currentStreak > 1 ? "s" : ""}
          </p>
          <p className="text-[10px] text-text-tertiary">Série</p>
        </div>
      </button>
    )
  }

  return (
    <div className={cn("bg-bg-secondary rounded-2xl border border-bg-tertiary p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            streak.currentStreak > 0
              ? "bg-gradient-to-br from-accent-orange to-accent-red"
              : "bg-bg-tertiary"
          )}>
            <Flame className={cn(
              "w-6 h-6",
              streak.currentStreak > 0 ? "text-white" : "text-text-tertiary"
            )} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-text-primary">
              Série actuelle
            </h3>
            <p className="text-sm text-text-tertiary">
              {streak.currentStreak} jour{streak.currentStreak > 1 ? "s" : ""} consécutif{streak.currentStreak > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {streak.streakStatus === "broken" && (
          <div className="px-3 py-1.5 bg-accent-red/20 text-accent-red rounded-lg text-xs font-semibold">
            Série interrompue
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-bg-tertiary rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-accent-orange mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-text-primary">
            {streak.currentStreak}
          </p>
          <p className="text-xs text-text-tertiary">Série actuelle</p>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 text-center">
          <TrendingUp className="w-5 h-5 text-accent-purple mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-text-primary">
            {streak.longestStreak}
          </p>
          <p className="text-xs text-text-tertiary">Record personnel</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold text-text-secondary mb-3">Prochaines récompenses</p>
        <StreakMilestone days={3} points={50} current={streak.currentStreak} />
        <StreakMilestone days={7} points={100} current={streak.currentStreak} />
        <StreakMilestone days={14} points={200} current={streak.currentStreak} />
        <StreakMilestone days={30} points={500} current={streak.currentStreak} />
        <StreakMilestone days={60} points={1000} current={streak.currentStreak} />
        <StreakMilestone days={100} points={2000} current={streak.currentStreak} />
      </div>

      {/* Status Message */}
      <div className="mt-6 p-3 bg-bg-tertiary rounded-xl text-center">
        <p className="text-sm text-text-secondary">
          {streak.canIncrementToday
            ? "Connectez-vous aujourd'hui pour continuer votre série !"
            : "Série maintenue aujourd'hui ! Revenez demain."
          }
        </p>
      </div>
    </div>
  )
}

interface StreakMilestoneProps {
  days: number
  points: number
  current: number
}

function StreakMilestone({ days, points, current }: StreakMilestoneProps) {
  const isCompleted = current >= days
  const isNext = !isCompleted && (current < 3 || (current >= 3 && current < 7 && days === 7) || (current >= 7 && current < 14 && days === 14) || (current >= 14 && current < 30 && days === 30) || (current >= 30 && current < 60 && days === 60) || (current >= 60 && days === 100))

  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg",
      isCompleted ? "bg-accent-green/10" : isNext ? "bg-accent-orange/10" : "bg-bg-primary"
    )}>
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <Zap className="w-4 h-4 text-accent-green" />
        ) : (
          <Flame className={cn(
            "w-4 h-4",
            isNext ? "text-accent-orange" : "text-text-tertiary"
          )} />
        )}
        <span className={cn(
          "text-sm",
          isCompleted ? "text-accent-green font-semibold" : isNext ? "text-text-primary" : "text-text-tertiary"
        )}>
          {days} jours
        </span>
      </div>
      <span className={cn(
        "text-sm font-semibold",
        isCompleted ? "text-accent-green" : isNext ? "text-accent-orange" : "text-text-tertiary"
      )}>
        {isCompleted ? "✓" : `+${points} pts`}
      </span>
    </div>
  )
}

/**
 * Streak celebration animation
 */
interface StreakCelebrationProps {
  streak: number
  show: boolean
  onComplete?: () => void
}

export function StreakCelebration({ streak, show, onComplete }: StreakCelebrationProps) {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-accent-orange to-accent-red text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
        <Flame className="w-8 h-8" />
        <div>
          <p className="font-display font-bold text-xl">
            {streak} jour{streak > 1 ? "s" : ""} de série !
          </p>
          <p className="text-sm opacity-90">Continue comme ça !</p>
        </div>
      </div>
    </div>
  )
}
