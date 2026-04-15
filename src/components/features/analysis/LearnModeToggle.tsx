"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { GraduationCap, Info } from "lucide-react"

interface LearnModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function LearnModeToggle({
  enabled,
  onToggle,
  className,
}: LearnModeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
        "min-h-[44px]",
        enabled
          ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-secondary",
        className
      )}
    >
      <GraduationCap className="w-5 h-5" />
      <span className="font-display text-sm font-medium">Mode Apprentissage</span>
      {enabled && (
        <span className="px-1.5 py-0.5 bg-accent-green text-bg-primary text-xs rounded">
          ON
        </span>
      )}
    </button>
  )
}

// Inline term tooltip for Learn Mode
interface TermTooltipProps {
  term: string
  definition: string
  children: React.ReactNode
}

export function TermTooltip({ term, definition, children }: TermTooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  return (
    <span className="relative inline-block">
      <span
        className="border-b border-dashed border-accent-cyan cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setShowTooltip(false)}
      >
        {children}
      </span>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-bg-primary border border-bg-tertiary rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary text-sm">{term}</p>
              <p className="text-text-secondary text-xs mt-1">{definition}</p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-bg-tertiary" />
          </div>
        </div>
      )}
    </span>
  )
}

// Glossary of betting terms for Learn Mode
export const BETTING_GLOSSARY: Record<string, string> = {
  "value bet": "Pari où la cote proposée est supérieure à la probabilité réelle de l'événement.",
  "xG": "Expected Goals - nombre de buts qu'une équipe aurait dû marquer statistiquement.",
  "handicap": "Avantage ou désavantage fictif donné à une équipe pour équilibrer les cotes.",
  "over/under": "Pari sur le nombre total de buts/points au-dessus ou en-dessous d'un seuil.",
  "cote": "Multiplicateur de mise représentant la probabilité inverse d'un événement.",
  "ROI": "Return On Investment - pourcentage de gain par rapport aux mises totales.",
  "bankroll": "Capital total dédié aux paris sportifs.",
  "unit": "Unité de mise standard, généralement 1-2% de la bankroll.",
  "stake": "Montant misé sur un pari.",
  "edge": "Avantage statistique par rapport aux bookmakers.",
}
