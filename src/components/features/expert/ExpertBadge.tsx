"use client"

/**
 * Story 10.1: Expert Badge
 * Display expert status and level
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Crown, Star, Zap, Award } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type ExpertLevel = "bronze" | "silver" | "gold" | "diamond"

interface ExpertBadgeProps {
  level: ExpertLevel
  winRate: number
  totalPredictions: number
  size?: "sm" | "md" | "lg"
  showStats?: boolean
  className?: string
}

const levelConfig: Record<ExpertLevel, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  bronze: {
    icon: Award,
    color: "text-orange-600",
    bg: "bg-orange-600/20",
    label: "Expert Bronze",
  },
  silver: {
    icon: Star,
    color: "text-gray-400",
    bg: "bg-gray-400/20",
    label: "Expert Argent",
  },
  gold: {
    icon: Crown,
    color: "text-yellow-500",
    bg: "bg-yellow-500/20",
    label: "Expert Or",
  },
  diamond: {
    icon: Zap,
    color: "text-cyan-400",
    bg: "bg-cyan-400/20",
    label: "Expert Diamant",
  },
}

export function ExpertBadge({
  level,
  winRate,
  totalPredictions,
  size = "md",
  showStats = false,
  className,
}: ExpertBadgeProps) {
  const config = levelConfig[level]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium",
          config.bg,
          config.color,
          sizeClasses[size]
        )}
      >
        <Icon className={iconSizes[size]} />
        <span>{config.label}</span>
      </div>

      {showStats && (
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="font-mono text-accent-green">{winRate}%</span>
          <span>•</span>
          <span>{totalPredictions} pronostics</span>
        </div>
      )}
    </div>
  )
}

/**
 * Story 10.2: Expert Card
 */
interface ExpertCardProps {
  id: string
  name: string
  avatar?: string
  level: ExpertLevel
  winRate: number
  totalPredictions: number
  monthlyProfit: number
  streak: number
  specialties: string[]
  isFollowing?: boolean
  onFollow?: () => void
  onClick?: () => void
  className?: string
}

export function ExpertCard({
  name,
  avatar,
  level,
  winRate,
  totalPredictions,
  monthlyProfit,
  streak,
  specialties,
  isFollowing = false,
  onFollow,
  onClick,
  className,
}: ExpertCardProps) {
  const config = levelConfig[level]

  return (
    <div
      className={cn(
        "p-5 bg-bg-secondary rounded-2xl border-2",
        "transition-all",
        config.color.replace("text-", "border-").replace("-600", "-600/30").replace("-400", "-400/30").replace("-500", "-500/30"),
        "hover:border-opacity-100",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <button type="button" onClick={onClick} className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-bg-tertiary"
            />
          ) : (
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold",
                config.bg,
                config.color
              )}
            >
              {name.charAt(0)}
            </div>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={onClick}
              className="font-display font-semibold text-text-primary hover:text-accent-cyan"
            >
              {name}
            </button>
            <ExpertBadge level={level} winRate={winRate} totalPredictions={totalPredictions} size="sm" />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-3">
            <div className="flex items-center gap-1">
              <span className="text-text-tertiary">Win:</span>
              <span className="font-mono font-medium text-accent-green">{winRate}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-tertiary">Profit:</span>
              <span
                className={cn(
                  "font-mono font-medium",
                  monthlyProfit >= 0 ? "text-accent-green" : "text-accent-red"
                )}
              >
                {monthlyProfit >= 0 ? "+" : ""}
                {monthlyProfit}%
              </span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-accent-orange">🔥</span>
                <span className="font-mono">{streak}</span>
              </div>
            )}
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-0.5 bg-bg-tertiary text-text-tertiary text-xs rounded"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Follow */}
        {onFollow && (
          <button
            type="button"
            onClick={onFollow}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
              isFollowing
                ? "bg-bg-tertiary text-text-secondary"
                : "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
            )}
          >
            {isFollowing ? "Suivi" : "Suivre"}
          </button>
        )}
      </div>
    </div>
  )
}
