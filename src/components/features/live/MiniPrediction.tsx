"use client"

/**
 * Mini Prediction Component
 * Story 7.5: Quick predictions during live matches
 */

import * as React from "react"
import { TrendingUp, Clock } from "lucide-react"
import { cn } from "~/lib/utils"

export interface PredictionOption {
  id: string
  label: string
  icon?: string
}

interface MiniPredictionProps {
  question: string
  options: PredictionOption[]
  countdown: number
  onSubmit: (optionId: string) => void
  userDistribution?: Record<string, number>
  className?: string
}

export function MiniPrediction({
  question,
  options,
  countdown,
  onSubmit,
  userDistribution,
  className,
}: MiniPredictionProps) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const [timeLeft, setTimeLeft] = React.useState(countdown)

  React.useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleSubmit = () => {
    if (!selected) return
    onSubmit(selected)
  }

  const totalVotes = userDistribution
    ? Object.values(userDistribution).reduce((sum, count) => sum + count, 0)
    : 0

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30 rounded-xl p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-cyan" />
          <h3 className="font-display font-bold text-base text-text-primary">
            Mini-Prédiction
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-accent-cyan">
          <Clock className="w-4 h-4" />
          <span className="font-bold text-sm">{timeLeft}s</span>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-text-primary">{question}</p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const percentage = userDistribution
            ? ((userDistribution[option.id] ?? 0) / totalVotes) * 100
            : 0

          return (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              disabled={timeLeft === 0}
              className={cn(
                "relative overflow-hidden rounded-lg p-3 text-sm font-semibold transition-all",
                "border-2",
                selected === option.id
                  ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                  : "border-bg-tertiary bg-bg-secondary text-text-primary hover:border-accent-cyan/50",
                timeLeft === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {userDistribution && (
                <div
                  className="absolute inset-0 bg-accent-cyan/10 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-center gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </div>
              {userDistribution && percentage > 0 && (
                <div className="relative text-xs text-text-tertiary mt-1">
                  {percentage.toFixed(0)}%
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Submit */}
      {!userDistribution && (
        <button
          onClick={handleSubmit}
          disabled={!selected || timeLeft === 0}
          className={cn(
            "w-full px-4 py-3 rounded-lg font-semibold text-sm transition-colors",
            selected && timeLeft > 0
              ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
              : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
          )}
        >
          Valider ma prédiction
        </button>
      )}

      {/* Distribution */}
      {userDistribution && totalVotes > 0 && (
        <div className="text-xs text-text-tertiary text-center pt-2 border-t border-accent-cyan/20">
          Basé sur {totalVotes} utilisateur{totalVotes > 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
