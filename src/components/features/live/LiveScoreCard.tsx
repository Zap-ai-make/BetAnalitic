"use client"

/**
 * Story 7.1: Live Score Card
 * Displays real-time match score with live updates
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Clock, Radio } from "lucide-react"

interface Team {
  name: string
  logo?: string
  score: number
}

interface LiveScoreCardProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  minute: number
  status: "not_started" | "live" | "halftime" | "finished"
  competition: string
  startTime?: Date
  isHighlighted?: boolean
  onClick?: () => void
  className?: string
}

export function LiveScoreCard({
  homeTeam,
  awayTeam,
  minute,
  status,
  competition,
  startTime,
  isHighlighted = false,
  onClick,
  className,
}: LiveScoreCardProps) {
  const isLive = status === "live" || status === "halftime"

  const statusConfig = {
    not_started: { label: startTime ? formatTime(startTime) : "À venir", color: "text-text-tertiary" },
    live: { label: `${minute}'`, color: "text-accent-red" },
    halftime: { label: "Mi-temps", color: "text-accent-orange" },
    finished: { label: "Terminé", color: "text-text-tertiary" },
  }

  const currentStatus = statusConfig[status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-bg-secondary rounded-xl",
        "border transition-all",
        isHighlighted
          ? "border-accent-cyan shadow-lg shadow-accent-cyan/10"
          : "border-bg-tertiary hover:border-accent-cyan/50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Competition & Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-tertiary truncate">{competition}</span>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
            </span>
          )}
          <span className={cn("text-xs font-medium", currentStatus.color)}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="space-y-2">
        <TeamRow team={homeTeam} isWinning={homeTeam.score > awayTeam.score} />
        <TeamRow team={awayTeam} isWinning={awayTeam.score > homeTeam.score} />
      </div>
    </button>
  )
}

function TeamRow({ team, isWinning }: { team: Team; isWinning: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="w-6 h-6 rounded object-contain"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-bg-tertiary flex items-center justify-center text-xs">
            {team.name.charAt(0)}
          </div>
        )}
        <span
          className={cn(
            "text-sm truncate",
            isWinning ? "text-text-primary font-medium" : "text-text-secondary"
          )}
        >
          {team.name}
        </span>
      </div>
      <span
        className={cn(
          "text-lg font-mono font-bold min-w-[2rem] text-right",
          isWinning ? "text-text-primary" : "text-text-secondary"
        )}
      >
        {team.score}
      </span>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Story 7.2: Live Match Header
 * Extended header for live match detail view
 */
interface LiveMatchHeaderProps {
  homeTeam: Team
  awayTeam: Team
  minute: number
  status: "not_started" | "live" | "halftime" | "finished"
  competition: string
  stadium?: string
  className?: string
}

export function LiveMatchHeader({
  homeTeam,
  awayTeam,
  minute,
  status,
  competition,
  stadium,
  className,
}: LiveMatchHeaderProps) {
  const isLive = status === "live" || status === "halftime"

  return (
    <div className={cn("p-6 bg-bg-secondary rounded-2xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm text-text-tertiary">{competition}</span>
        {stadium && (
          <>
            <span className="text-text-tertiary">•</span>
            <span className="text-sm text-text-tertiary">{stadium}</span>
          </>
        )}
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-8 mb-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-2">
          {homeTeam.logo ? (
            <img
              src={homeTeam.logo}
              alt={homeTeam.name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center text-2xl font-bold">
              {homeTeam.name.charAt(0)}
            </div>
          )}
          <span className="text-sm text-text-primary font-medium text-center">
            {homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-text-primary font-mono">
              {homeTeam.score}
            </span>
            <span className="text-2xl text-text-tertiary">-</span>
            <span className="text-4xl font-bold text-text-primary font-mono">
              {awayTeam.score}
            </span>
          </div>

          {isLive && (
            <div className="flex items-center gap-2 mt-2">
              <Radio className="w-4 h-4 text-accent-red animate-pulse" />
              <span className="text-sm font-medium text-accent-red">
                {status === "halftime" ? "Mi-temps" : `${minute}'`}
              </span>
            </div>
          )}

          {status === "not_started" && (
            <div className="flex items-center gap-2 mt-2 text-text-tertiary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">À venir</span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2">
          {awayTeam.logo ? (
            <img
              src={awayTeam.logo}
              alt={awayTeam.name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center text-2xl font-bold">
              {awayTeam.name.charAt(0)}
            </div>
          )}
          <span className="text-sm text-text-primary font-medium text-center">
            {awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  )
}
