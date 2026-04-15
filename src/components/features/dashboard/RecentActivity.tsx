"use client"

/**
 * Story 7.13: Recent Activity Feed
 * Dashboard activity log
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { CheckCircle, XCircle, Clock, MessageSquare, Users, Bot } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type ActivityType = "bet_won" | "bet_lost" | "bet_pending" | "agent_query" | "room_message" | "room_joined"

interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface RecentActivityProps {
  activities: Activity[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  bet_won: { icon: CheckCircle, color: "text-accent-green bg-accent-green/20" },
  bet_lost: { icon: XCircle, color: "text-accent-red bg-accent-red/20" },
  bet_pending: { icon: Clock, color: "text-accent-orange bg-accent-orange/20" },
  agent_query: { icon: Bot, color: "text-accent-cyan bg-accent-cyan/20" },
  room_message: { icon: MessageSquare, color: "text-text-secondary bg-bg-tertiary" },
  room_joined: { icon: Users, color: "text-accent-purple bg-accent-purple/20" },
}

export function RecentActivity({
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className,
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-text-primary">
          Activité récente
        </h3>
        {showViewAll && activities.length > maxItems && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm text-accent-cyan hover:underline"
          >
            Tout voir
          </button>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-text-tertiary text-sm">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  const timeAgo = getRelativeTime(activity.timestamp)

  return (
    <div className="flex items-start gap-3">
      <div className={cn("p-2 rounded-lg", config.color)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-text-tertiary mt-0.5 truncate">
            {activity.description}
          </p>
        )}
      </div>

      <span className="text-xs text-text-tertiary flex-shrink-0">{timeAgo}</span>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return "Hier"
  return `${diffDays}j`
}

/**
 * Story 7.14: Bet History Mini
 */
interface BetHistoryItem {
  id: string
  matchName: string
  selection: string
  odds: number
  stake: number
  status: "won" | "lost" | "pending" | "void"
  potentialWin: number
  settledAt?: Date
}

interface BetHistoryMiniProps {
  bets: BetHistoryItem[]
  onViewDetails?: (betId: string) => void
  className?: string
}

export function BetHistoryMini({
  bets,
  onViewDetails,
  className,
}: BetHistoryMiniProps) {
  const statusConfig = {
    won: { label: "Gagné", color: "text-accent-green bg-accent-green/20" },
    lost: { label: "Perdu", color: "text-accent-red bg-accent-red/20" },
    pending: { label: "En cours", color: "text-accent-orange bg-accent-orange/20" },
    void: { label: "Annulé", color: "text-text-tertiary bg-bg-tertiary" },
  }

  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <h3 className="font-display font-semibold text-text-primary mb-4">
        Derniers paris
      </h3>

      {bets.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-text-tertiary text-sm">Aucun pari enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map((bet) => {
            const status = statusConfig[bet.status]

            return (
              <button
                key={bet.id}
                type="button"
                onClick={() => onViewDetails?.(bet.id)}
                className="w-full p-3 bg-bg-tertiary rounded-xl text-left hover:bg-bg-tertiary/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-primary font-medium truncate">
                    {bet.matchName}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      status.color
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="text-xs text-text-tertiary mb-2">{bet.selection}</p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">
                    {bet.stake}€ @ {bet.odds.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "font-mono font-medium",
                      bet.status === "won" && "text-accent-green",
                      bet.status === "lost" && "text-accent-red",
                      bet.status === "pending" && "text-text-primary"
                    )}
                  >
                    {bet.status === "won"
                      ? `+${(bet.potentialWin - bet.stake).toFixed(2)}€`
                      : bet.status === "lost"
                        ? `-${bet.stake.toFixed(2)}€`
                        : `→ ${bet.potentialWin.toFixed(2)}€`}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
