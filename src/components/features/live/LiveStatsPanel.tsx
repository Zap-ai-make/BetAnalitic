"use client"

/**
 * Story 7.7: Live Stats Panel
 * Real-time match statistics display
 */

import * as React from "react"
import { cn } from "~/lib/utils"

interface StatComparison {
  label: string
  homeValue: number
  awayValue: number
  format?: "number" | "percent" | "time"
}

interface LiveStatsPanelProps {
  stats: StatComparison[]
  homeTeamName: string
  awayTeamName: string
  className?: string
}

export function LiveStatsPanel({
  stats,
  homeTeamName,
  awayTeamName,
  className,
}: LiveStatsPanelProps) {
  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-primary truncate max-w-[40%]">
          {homeTeamName}
        </span>
        <span className="text-xs text-text-tertiary">Stats</span>
        <span className="text-sm font-medium text-text-primary truncate max-w-[40%] text-right">
          {awayTeamName}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <StatRow key={idx} stat={stat} />
        ))}
      </div>
    </div>
  )
}

function StatRow({ stat }: { stat: StatComparison }) {
  const total = stat.homeValue + stat.awayValue
  const homePercent = total > 0 ? (stat.homeValue / total) * 100 : 50

  const formatValue = (value: number) => {
    switch (stat.format) {
      case "percent":
        return `${value}%`
      case "time":
        return `${value}'`
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-primary font-mono">
          {formatValue(stat.homeValue)}
        </span>
        <span className="text-text-tertiary text-xs">{stat.label}</span>
        <span className="text-text-primary font-mono">
          {formatValue(stat.awayValue)}
        </span>
      </div>

      <div className="flex h-2 gap-1">
        <div
          className="bg-accent-cyan rounded-l transition-all"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-accent-orange rounded-r transition-all"
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Story 7.8: Key Stats Badges
 */
interface KeyStatsBadgesProps {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  className?: string
}

export function KeyStatsBadges({
  possession,
  shots,
  shotsOnTarget,
  corners,
  className,
}: KeyStatsBadgesProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      <StatBadge
        label="Possession"
        homeValue={possession.home}
        awayValue={possession.away}
        format="percent"
      />
      <StatBadge
        label="Tirs"
        homeValue={shots.home}
        awayValue={shots.away}
      />
      <StatBadge
        label="Cadrés"
        homeValue={shotsOnTarget.home}
        awayValue={shotsOnTarget.away}
      />
      <StatBadge
        label="Corners"
        homeValue={corners.home}
        awayValue={corners.away}
      />
    </div>
  )
}

function StatBadge({
  label,
  homeValue,
  awayValue,
  format,
}: {
  label: string
  homeValue: number
  awayValue: number
  format?: "percent"
}) {
  const suffix = format === "percent" ? "%" : ""

  return (
    <div className="p-3 bg-bg-secondary rounded-xl text-center">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className="text-sm font-mono">
        <span className="text-accent-cyan">{homeValue}{suffix}</span>
        <span className="text-text-tertiary mx-1">-</span>
        <span className="text-accent-orange">{awayValue}{suffix}</span>
      </p>
    </div>
  )
}

/**
 * Story 7.9: xG Stats Display
 */
interface XGStatsProps {
  homeXG: number
  awayXG: number
  homeGoals: number
  awayGoals: number
  homeTeamName: string
  awayTeamName: string
  className?: string
}

export function XGStats({
  homeXG,
  awayXG,
  homeGoals,
  awayGoals,
  homeTeamName,
  awayTeamName,
  className,
}: XGStatsProps) {
  const homePerformance = homeGoals - homeXG
  const awayPerformance = awayGoals - awayXG

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl", className)}>
      <h4 className="text-sm font-medium text-text-primary mb-4 text-center">
        Expected Goals (xG)
      </h4>

      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold font-mono text-text-primary">
            {homeXG.toFixed(2)}
          </p>
          <p className="text-xs text-text-tertiary mt-1">{homeTeamName}</p>
          <PerformanceBadge performance={homePerformance} />
        </div>

        {/* Divider */}
        <div className="text-text-tertiary text-lg">vs</div>

        {/* Away */}
        <div className="flex-1 text-center">
          <p className="text-2xl font-bold font-mono text-text-primary">
            {awayXG.toFixed(2)}
          </p>
          <p className="text-xs text-text-tertiary mt-1">{awayTeamName}</p>
          <PerformanceBadge performance={awayPerformance} />
        </div>
      </div>
    </div>
  )
}

function PerformanceBadge({ performance }: { performance: number }) {
  const isOverperforming = performance > 0.5
  const isUnderperforming = performance < -0.5

  return (
    <span
      className={cn(
        "inline-block mt-2 px-2 py-0.5 rounded-full text-xs",
        isOverperforming && "bg-accent-green/20 text-accent-green",
        isUnderperforming && "bg-accent-red/20 text-accent-red",
        !isOverperforming && !isUnderperforming && "bg-bg-tertiary text-text-tertiary"
      )}
    >
      {isOverperforming
        ? `+${performance.toFixed(1)} surperf.`
        : isUnderperforming
          ? `${performance.toFixed(1)} sous-perf.`
          : "Dans les attentes"}
    </span>
  )
}
