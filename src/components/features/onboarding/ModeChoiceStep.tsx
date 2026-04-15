"use client"

import { cn } from "~/lib/utils"

type UserMode = "ANALYTIC" | "SUPPORTER"

interface ModeChoiceStepProps {
  selectedMode: UserMode | null
  onSelect: (mode: UserMode) => void
}

export function ModeChoiceStep({ selectedMode, onSelect }: ModeChoiceStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Comment utilisez-vous les paris sportifs ?
        </h2>
        <p className="text-text-secondary">
          Choisissez votre profil pour personnaliser votre expérience
        </p>
      </div>

      <div className="grid gap-4">
        {/* Analytic Mode */}
        <button
          onClick={() => onSelect("ANALYTIC")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all",
            "hover:border-accent-cyan/50",
            selectedMode === "ANALYTIC"
              ? "border-accent-cyan bg-accent-cyan/10"
              : "border-bg-tertiary bg-bg-secondary"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-text-primary">
                Mode Analytique
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Analyses approfondies, statistiques détaillées et données avancées.
                Pour ceux qui veulent comprendre les probabilités et optimiser
                leurs décisions.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Stats avancées
                </span>
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Analyses IA
                </span>
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Rapports détaillés
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Supporter Mode */}
        <button
          onClick={() => onSelect("SUPPORTER")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all",
            "hover:border-accent-magenta/50",
            selectedMode === "SUPPORTER"
              ? "border-accent-magenta bg-accent-magenta/10"
              : "border-bg-tertiary bg-bg-secondary"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚽</div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-text-primary">
                Mode Supporter
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Suivez vos équipes favorites, vivez les matchs et partagez
                l&apos;émotion du sport. Interface simplifiée et alertes en temps réel.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Suivi équipes
                </span>
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Alertes matchs
                </span>
                <span className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                  Interface simple
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-text-tertiary">
        Vous pourrez changer de mode à tout moment dans les paramètres
      </p>
    </div>
  )
}
