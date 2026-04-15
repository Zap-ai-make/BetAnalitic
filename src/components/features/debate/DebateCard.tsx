"use client"

/**
 * Story 8.1: DebateArena Card
 * Displays a debate topic with agent positions
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { MessageSquare, Users, Clock, ChevronRight, Flame } from "lucide-react"

interface AgentPosition {
  agentId: string
  agentName: string
  agentColor: string
  position: "for" | "against"
  summary: string
}

interface DebateCardProps {
  id: string
  topic: string
  matchName?: string
  positions: AgentPosition[]
  voteCount: number
  participantCount: number
  status: "active" | "voting" | "closed"
  endsAt?: Date
  winner?: "for" | "against" | "tie"
  onClick?: () => void
  className?: string
}

export function DebateCard({
  topic,
  matchName,
  positions,
  voteCount,
  participantCount,
  status,
  endsAt,
  winner,
  onClick,
  className,
}: DebateCardProps) {
  const forAgents = positions.filter((p) => p.position === "for")
  const againstAgents = positions.filter((p) => p.position === "against")

  const statusConfig = {
    active: { label: "En cours", color: "bg-accent-green/20 text-accent-green" },
    voting: { label: "Vote ouvert", color: "bg-accent-cyan/20 text-accent-cyan" },
    closed: { label: "Terminé", color: "bg-bg-tertiary text-text-tertiary" },
  }

  const currentStatus = statusConfig[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-5 bg-bg-secondary rounded-2xl text-left",
        "border border-bg-tertiary hover:border-accent-cyan/50",
        "transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {matchName && (
            <p className="text-xs text-accent-cyan mb-1">📍 {matchName}</p>
          )}
          <h3 className="font-display font-semibold text-text-primary text-lg leading-tight">
            {topic}
          </h3>
        </div>
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", currentStatus.color)}>
          {currentStatus.label}
        </span>
      </div>

      {/* Agent Positions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* For */}
        <div
          className={cn(
            "p-3 rounded-xl",
            winner === "for" ? "bg-accent-green/20 ring-2 ring-accent-green" : "bg-bg-tertiary"
          )}
        >
          <p className="text-xs text-accent-green font-medium mb-2">✓ POUR</p>
          <div className="space-y-1">
            {forAgents.map((agent) => (
              <div key={agent.agentId} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.agentColor }}
                />
                <span className="text-xs text-text-secondary truncate">
                  {agent.agentName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Against */}
        <div
          className={cn(
            "p-3 rounded-xl",
            winner === "against" ? "bg-accent-red/20 ring-2 ring-accent-red" : "bg-bg-tertiary"
          )}
        >
          <p className="text-xs text-accent-red font-medium mb-2">✗ CONTRE</p>
          <div className="space-y-1">
            {againstAgents.map((agent) => (
              <div key={agent.agentId} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.agentColor }}
                />
                <span className="text-xs text-text-secondary truncate">
                  {agent.agentName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{voteCount} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{participantCount}</span>
          </div>
          {status === "active" && endsAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 60000))} min
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  )
}

/**
 * Story 8.2: Hot Debate Badge
 */
interface HotDebateBadgeProps {
  intensity: "low" | "medium" | "high"
  className?: string
}

export function HotDebateBadge({ intensity, className }: HotDebateBadgeProps) {
  const config = {
    low: { flames: 1, color: "text-accent-orange" },
    medium: { flames: 2, color: "text-accent-orange" },
    high: { flames: 3, color: "text-accent-red" },
  }

  const { flames, color } = config[intensity]

  return (
    <div className={cn("flex items-center gap-0.5", color, className)}>
      {Array.from({ length: flames }).map((_, i) => (
        <Flame key={i} className="w-4 h-4" fill="currentColor" />
      ))}
    </div>
  )
}
