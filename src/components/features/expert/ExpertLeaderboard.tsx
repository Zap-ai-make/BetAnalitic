"use client"

/**
 * Story 10.3: Expert Leaderboard
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Trophy, TrendingUp, Crown } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  winRate: number
  profit: number
  predictions: number
  isCurrentUser?: boolean
}

interface ExpertLeaderboardProps {
  entries: LeaderboardEntry[]
  period: "day" | "week" | "month" | "all"
  currentUserId?: string
  onSelectUser?: (userId: string) => void
  className?: string
}

export function ExpertLeaderboard({
  entries,
  period,
  onSelectUser,
  className,
}: ExpertLeaderboardProps) {
  const periodLabels = {
    day: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois",
    all: "Tous les temps",
  }

  return (
    <div className={cn("bg-bg-secondary rounded-2xl overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-bg-tertiary">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-orange" />
          <h3 className="font-display font-semibold text-text-primary">
            Classement Expert
          </h3>
        </div>
        <p className="text-sm text-text-tertiary mt-1">{periodLabels[period]}</p>
      </div>

      {/* Entries */}
      <div className="divide-y divide-bg-tertiary">
        {entries.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            onClick={() => onSelectUser?.(entry.userId)}
          />
        ))}
      </div>
    </div>
  )
}

function LeaderboardRow({
  entry,
  onClick,
}: {
  entry: LeaderboardEntry
  onClick?: () => void
}) {
  const rankStyles = {
    1: "bg-yellow-500/20 text-yellow-500",
    2: "bg-gray-400/20 text-gray-400",
    3: "bg-orange-600/20 text-orange-600",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 text-left",
        "hover:bg-bg-tertiary/50 transition-colors",
        entry.isCurrentUser && "bg-accent-cyan/5"
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
          rankStyles[entry.rank as keyof typeof rankStyles] ?? "bg-bg-tertiary text-text-tertiary"
        )}
      >
        {entry.rank <= 3 ? (
          <Crown className="w-4 h-4" />
        ) : (
          entry.rank
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.avatar ? (
          <img
            src={entry.avatar}
            alt={entry.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-medium">
            {entry.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className={cn(
            "font-medium truncate",
            entry.isCurrentUser ? "text-accent-cyan" : "text-text-primary"
          )}>
            {entry.name}
            {entry.isCurrentUser && " (vous)"}
          </p>
          <p className="text-xs text-text-tertiary">
            {entry.predictions} pronostics
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="font-mono font-bold text-accent-green">{entry.winRate}%</p>
        <p className={cn(
          "text-xs font-mono",
          entry.profit >= 0 ? "text-accent-green" : "text-accent-red"
        )}>
          {entry.profit >= 0 ? "+" : ""}{entry.profit}%
        </p>
      </div>
    </button>
  )
}

/**
 * Story 10.4: Expert Stats Summary
 */
interface ExpertStatsSummaryProps {
  winRate: number
  totalPredictions: number
  profit: number
  followers: number
  streak: number
  rank: number
  className?: string
}

export function ExpertStatsSummary({
  winRate,
  totalPredictions,
  profit,
  followers,
  streak,
  rank,
  className,
}: ExpertStatsSummaryProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      <StatBox label="Win Rate" value={`${winRate}%`} color="text-accent-green" />
      <StatBox label="Pronostics" value={totalPredictions.toString()} />
      <StatBox
        label="ROI"
        value={`${profit >= 0 ? "+" : ""}${profit}%`}
        color={profit >= 0 ? "text-accent-green" : "text-accent-red"}
      />
      <StatBox label="Abonnés" value={followers.toString()} />
      <StatBox label="Série" value={streak > 0 ? `🔥 ${streak}` : "-"} />
      <StatBox label="Classement" value={`#${rank}`} color="text-accent-orange" />
    </div>
  )
}

function StatBox({
  label,
  value,
  color = "text-text-primary",
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="p-4 bg-bg-secondary rounded-xl text-center">
      <p className={cn("text-xl font-bold font-mono", color)}>{value}</p>
      <p className="text-xs text-text-tertiary mt-1">{label}</p>
    </div>
  )
}
