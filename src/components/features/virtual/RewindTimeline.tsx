"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { RotateCcw, Play, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"

interface RewindSession {
  id: string
  date: Date
  matches: Array<{
    homeTeam: string
    awayTeam: string
  }>
  originalBets: number
  originalResult: number
  scenarios?: Array<{
    id: string
    name: string
    result: number
  }>
}

interface RewindTimelineProps {
  sessions: RewindSession[]
  onSelectSession: (session: RewindSession) => void
  className?: string
}

export function RewindTimeline({
  sessions,
  onSelectSession,
  className,
}: RewindTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className={cn("p-6 bg-bg-secondary rounded-xl text-center", className)}>
        <RotateCcw className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
          Pas encore de sessions
        </h3>
        <p className="text-text-secondary text-sm">
          Placez des paris virtuels pour pouvoir les rejouer plus tard.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw className="w-5 h-5 text-accent-cyan" />
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Mode Rewind
        </h3>
      </div>

      {sessions.map((session) => {
        const isPositive = session.originalResult >= 0

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session)}
            className={cn(
              "w-full p-4 bg-bg-secondary rounded-xl text-left",
              "border border-transparent hover:border-accent-cyan/30",
              "transition-all duration-200"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-text-tertiary">
                  {session.date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="font-display font-semibold text-text-primary mt-1">
                  {session.matches.length} match{session.matches.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-accent-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-accent-red" />
                )}
                <span
                  className={cn(
                    "font-bold",
                    isPositive ? "text-accent-green" : "text-accent-red"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {session.originalResult.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Matches Preview */}
            <div className="flex flex-wrap gap-2 mb-3">
              {session.matches.slice(0, 3).map((match, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary"
                >
                  {match.homeTeam} vs {match.awayTeam}
                </span>
              ))}
              {session.matches.length > 3 && (
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-tertiary">
                  +{session.matches.length - 3}
                </span>
              )}
            </div>

            {/* Scenarios */}
            {session.scenarios && session.scenarios.length > 0 && (
              <div className="pt-3 border-t border-bg-tertiary">
                <p className="text-xs text-text-tertiary mb-2">
                  {session.scenarios.length} scénario{session.scenarios.length > 1 ? "s" : ""} alternatif{session.scenarios.length > 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-1 text-accent-cyan text-sm mt-2">
              <Play className="w-4 h-4" />
              <span>Rejouer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Comparison view for rewind scenarios
interface ScenarioComparisonProps {
  originalResult: number
  scenarios: Array<{
    id: string
    name: string
    result: number
  }>
  className?: string
}

export function ScenarioComparison({
  originalResult,
  scenarios,
  className,
}: ScenarioComparisonProps) {
  const allScenarios = [
    { id: "original", name: "Original", result: originalResult },
    ...scenarios,
  ]

  const bestScenario = allScenarios.reduce((best, s) =>
    s.result > best.result ? s : best
  )

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl", className)}>
      <h4 className="font-display font-semibold text-text-primary mb-4">
        Comparaison des scénarios
      </h4>

      <div className="space-y-3">
        {allScenarios.map((scenario) => {
          const isPositive = scenario.result >= 0
          const isBest = scenario.id === bestScenario.id

          return (
            <div
              key={scenario.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                isBest ? "bg-accent-green/10 border border-accent-green/30" : "bg-bg-tertiary"
              )}
            >
              <div className="flex items-center gap-2">
                {isBest && (
                  <span className="px-2 py-0.5 bg-accent-green text-bg-primary text-xs rounded">
                    Meilleur
                  </span>
                )}
                <span className="text-text-primary font-medium">{scenario.name}</span>
              </div>

              <span
                className={cn(
                  "font-bold",
                  isPositive ? "text-accent-green" : "text-accent-red"
                )}
              >
                {isPositive ? "+" : ""}
                {scenario.result.toFixed(2)}€
              </span>
            </div>
          )
        })}
      </div>

      {/* Insight */}
      {bestScenario.id !== "original" && (
        <div className="mt-4 p-3 bg-accent-cyan/10 rounded-lg">
          <p className="text-sm text-accent-cyan">
            💡 Avec le scénario &quot;{bestScenario.name}&quot;, vous auriez gagné{" "}
            <strong>
              {(bestScenario.result - originalResult).toFixed(2)}€ de plus
            </strong>
            .
          </p>
        </div>
      )}
    </div>
  )
}
