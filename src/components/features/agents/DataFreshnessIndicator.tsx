"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Clock, AlertCircle, CheckCircle } from "lucide-react"

type FreshnessLevel = "fresh" | "recent" | "stale"

interface DataFreshnessIndicatorProps {
  timestamp: Date
  className?: string
}

function getFreshnessLevel(timestamp: Date): FreshnessLevel {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMinutes = diffMs / (1000 * 60)

  if (diffMinutes < 5) return "fresh"
  if (diffMinutes < 60) return "recent"
  return "stale"
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return "À l'instant"
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return "Hier"
  return `Il y a ${diffDays} jours`
}

const freshnessConfig: Record<
  FreshnessLevel,
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  fresh: {
    icon: CheckCircle,
    label: "Données en temps réel",
    className: "text-accent-green bg-accent-green/10",
  },
  recent: {
    icon: Clock,
    label: "Données récentes",
    className: "text-accent-gold bg-accent-gold/10",
  },
  stale: {
    icon: AlertCircle,
    label: "Données anciennes",
    className: "text-accent-red bg-accent-red/10",
  },
}

export function DataFreshnessIndicator({
  timestamp,
  className,
}: DataFreshnessIndicatorProps) {
  const level = getFreshnessLevel(timestamp)
  const config = freshnessConfig[level]
  const Icon = config.icon
  const formattedTime = formatTimestamp(timestamp)

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
        config.className,
        className
      )}
      title={`Données de ${timestamp.toLocaleString("fr-FR")}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{formattedTime}</span>
    </div>
  )
}

// Compact version for inline use
export function DataFreshnessCompact({
  timestamp,
  className,
}: DataFreshnessIndicatorProps) {
  const level = getFreshnessLevel(timestamp)
  const config = freshnessConfig[level]
  const Icon = config.icon

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={`${config.label} - ${timestamp.toLocaleString("fr-FR")}`}
    >
      <Icon className={cn("w-3 h-3", config.className.split(" ")[0])} />
    </span>
  )
}
