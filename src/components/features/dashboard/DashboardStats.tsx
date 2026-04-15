"use client"

/**
 * Story 7.10: Dashboard Stats Cards
 * Main dashboard statistics display
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { TrendingUp, TrendingDown, Minus, Target, Trophy, Activity, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "stable"
  }
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = "text-accent-cyan",
  className,
}: StatCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus
  const trendColor =
    trend?.direction === "up"
      ? "text-accent-green"
      : trend?.direction === "down"
        ? "text-accent-red"
        : "text-text-tertiary"

  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl bg-bg-tertiary", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1", trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-text-primary font-mono">{value}</p>
      <p className="text-sm text-text-secondary mt-0.5">{title}</p>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>
      )}
      {trend && (
        <p className="text-xs text-text-tertiary mt-2">{trend.label}</p>
      )}
    </div>
  )
}

/**
 * Story 7.11: Dashboard Stats Grid
 */
interface DashboardStatsProps {
  totalBets: number
  winRate: number
  profit: number
  avgOdds: number
  period: "week" | "month" | "all"
  trends?: {
    bets: number
    winRate: number
    profit: number
  }
  className?: string
}

export function DashboardStats({
  totalBets,
  winRate,
  profit,
  avgOdds,
  trends,
  className,
}: DashboardStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard
        title="Paris placés"
        value={totalBets}
        icon={Activity}
        iconColor="text-accent-cyan"
        trend={
          trends?.bets !== undefined
            ? {
                value: trends.bets,
                label: "vs période précédente",
                direction: trends.bets > 0 ? "up" : trends.bets < 0 ? "down" : "stable",
              }
            : undefined
        }
      />

      <StatCard
        title="Taux de réussite"
        value={`${winRate}%`}
        icon={Target}
        iconColor="text-accent-green"
        trend={
          trends?.winRate !== undefined
            ? {
                value: trends.winRate,
                label: "vs période précédente",
                direction: trends.winRate > 0 ? "up" : trends.winRate < 0 ? "down" : "stable",
              }
            : undefined
        }
      />

      <StatCard
        title="Profit/Perte"
        value={`${profit >= 0 ? "+" : ""}${profit.toFixed(2)}€`}
        icon={Wallet}
        iconColor={profit >= 0 ? "text-accent-green" : "text-accent-red"}
        trend={
          trends?.profit !== undefined
            ? {
                value: trends.profit,
                label: "vs période précédente",
                direction: trends.profit > 0 ? "up" : trends.profit < 0 ? "down" : "stable",
              }
            : undefined
        }
      />

      <StatCard
        title="Cote moyenne"
        value={avgOdds.toFixed(2)}
        icon={Trophy}
        iconColor="text-accent-orange"
      />
    </div>
  )
}

/**
 * Story 7.12: Quick Stats Bar
 */
interface QuickStatsBarProps {
  liveMatches: number
  pendingBets: number
  todayProfit: number
  className?: string
}

export function QuickStatsBar({
  liveMatches,
  pendingBets,
  todayProfit,
  className,
}: QuickStatsBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-bg-secondary rounded-xl",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
          </span>
          <span className="text-sm text-text-primary">
            <strong>{liveMatches}</strong> matchs en direct
          </span>
        </div>

        <div className="h-4 w-px bg-bg-tertiary" />

        <span className="text-sm text-text-secondary">
          <strong>{pendingBets}</strong> paris en cours
        </span>
      </div>

      <div
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          todayProfit >= 0
            ? "bg-accent-green/20 text-accent-green"
            : "bg-accent-red/20 text-accent-red"
        )}
      >
        {todayProfit >= 0 ? "+" : ""}
        {todayProfit.toFixed(2)}€ aujourd&apos;hui
      </div>
    </div>
  )
}
