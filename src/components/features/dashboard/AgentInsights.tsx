"use client"

/**
 * Story 7.17: Agent Insights Widget
 * Quick access to AI agent recommendations
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Bot, ArrowRight, Sparkles, TrendingUp, AlertTriangle } from "lucide-react"

interface AgentInsight {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  insightType: "opportunity" | "warning" | "trend"
  title: string
  summary: string
  confidence: number
  matchName?: string
}

interface AgentInsightsProps {
  insights: AgentInsight[]
  onInsightClick?: (insightId: string) => void
  onAskAgent?: (agentId: string) => void
  className?: string
}

export function AgentInsights({
  insights,
  onInsightClick,
  onAskAgent,
  className,
}: AgentInsightsProps) {
  const insightConfig = {
    opportunity: {
      icon: Sparkles,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
    trend: {
      icon: TrendingUp,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10",
    },
  }

  return (
    <div className={cn("p-5 bg-bg-secondary rounded-2xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-display font-semibold text-text-primary">
            Insights IA
          </h3>
        </div>
        <span className="px-2 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs rounded-full">
          {insights.length} nouveaux
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="py-8 text-center">
          <Bot className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary text-sm">
            Aucun insight disponible
          </p>
          <p className="text-text-tertiary text-xs mt-1">
            Consultez un agent pour obtenir des analyses
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const config = insightConfig[insight.insightType]
            const Icon = config.icon

            return (
              <button
                key={insight.id}
                type="button"
                onClick={() => onInsightClick?.(insight.id)}
                className="w-full p-4 bg-bg-tertiary rounded-xl text-left hover:bg-bg-tertiary/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: insight.agentColor }}
                      />
                      <span className="text-xs text-text-tertiary">
                        {insight.agentName}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        • {insight.confidence}% confiance
                      </span>
                    </div>

                    <p className="text-sm font-medium text-text-primary mb-1">
                      {insight.title}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {insight.summary}
                    </p>

                    {insight.matchName && (
                      <p className="text-xs text-accent-cyan mt-2">
                        📍 {insight.matchName}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {onAskAgent && (
        <button
          type="button"
          onClick={() => onAskAgent("scout")}
          className="w-full mt-4 py-3 px-4 bg-accent-cyan/10 text-accent-cyan rounded-xl text-sm font-medium hover:bg-accent-cyan/20 transition-colors flex items-center justify-center gap-2"
        >
          <Bot className="w-4 h-4" />
          Demander une analyse
        </button>
      )}
    </div>
  )
}
