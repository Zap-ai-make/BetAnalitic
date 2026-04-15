"use client"

/**
 * Story 9.3: Usage Stats Display
 * Shows user's subscription usage
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Bot, MessageSquare, Users, Zap, AlertCircle } from "lucide-react"

interface UsageStatProps {
  label: string
  current: number
  limit: number | "unlimited"
  icon: React.ReactNode
  warningThreshold?: number
}

function UsageStat({
  label,
  current,
  limit,
  icon,
  warningThreshold = 80,
}: UsageStatProps) {
  const isUnlimited = limit === "unlimited"
  const percentage = isUnlimited ? 0 : (current / limit) * 100
  const isWarning = !isUnlimited && percentage >= warningThreshold
  const isExhausted = !isUnlimited && percentage >= 100

  return (
    <div className="p-4 bg-bg-secondary rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-text-tertiary">{icon}</div>
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <span className="text-sm font-mono font-medium text-text-primary">
          {current} / {isUnlimited ? "∞" : limit}
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isExhausted
                ? "bg-accent-red"
                : isWarning
                  ? "bg-accent-orange"
                  : "bg-accent-cyan"
            )}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      )}

      {isWarning && !isExhausted && (
        <p className="text-xs text-accent-orange mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Presque épuisé
        </p>
      )}

      {isExhausted && (
        <p className="text-xs text-accent-red mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Limite atteinte
        </p>
      )}
    </div>
  )
}

interface UsageStatsProps {
  analyses: { current: number; limit: number | "unlimited" }
  agents: { current: number; limit: number | "unlimited" }
  rooms: { current: number; limit: number | "unlimited" }
  apiCalls?: { current: number; limit: number | "unlimited" }
  className?: string
}

export function UsageStats({
  analyses,
  agents,
  rooms,
  apiCalls,
  className,
}: UsageStatsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-text-primary">
        Utilisation ce mois
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <UsageStat
          label="Analyses"
          current={analyses.current}
          limit={analyses.limit}
          icon={<Bot className="w-4 h-4" />}
        />
        <UsageStat
          label="Agents consultés"
          current={agents.current}
          limit={agents.limit}
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <UsageStat
          label="Salons actifs"
          current={rooms.current}
          limit={rooms.limit}
          icon={<Users className="w-4 h-4" />}
        />
        {apiCalls && (
          <UsageStat
            label="Appels API"
            current={apiCalls.current}
            limit={apiCalls.limit}
            icon={<Zap className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Story 9.4: Upgrade Banner
 */
interface UpgradeBannerProps {
  currentPlan: string
  message: string
  onUpgrade?: () => void
  className?: string
}

export function UpgradeBanner({
  currentPlan,
  message,
  onUpgrade,
  className,
}: UpgradeBannerProps) {
  return (
    <div
      className={cn(
        "p-4 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20",
        "border border-accent-cyan/30 rounded-xl",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-cyan/20 rounded-lg">
            <Zap className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{message}</p>
            <p className="text-xs text-text-secondary">
              Plan actuel: {currentPlan}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg font-medium text-sm hover:bg-accent-cyan/80 transition-colors min-h-[44px] whitespace-nowrap"
        >
          Passer à Premium
        </button>
      </div>
    </div>
  )
}
