"use client"

import { useState } from "react"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

const TOUR_STEPS = [
  {
    id: 1,
    target: "bottom-nav",
    title: "Navigation",
    description:
      "Utilisez la barre de navigation pour accéder aux différentes sections : Accueil, Matchs, Analyse, Salles et Profil.",
    position: "top" as const,
  },
  {
    id: 2,
    target: "matches",
    title: "Sélection de matchs",
    description:
      "Parcourez les matchs disponibles et ajoutez-les à votre coupon pour une analyse groupée.",
    position: "center" as const,
  },
  {
    id: 3,
    target: "agent-input",
    title: "Agents IA",
    description:
      "Tapez @ pour invoquer les 14 agents IA qui analysent chaque aspect du match pour vous.",
    position: "top" as const,
  },
  {
    id: 4,
    target: "mode-toggle",
    title: "Mode d'analyse",
    description:
      "Basculez entre le mode Analytique (données) et Supporter (émotions) selon votre style.",
    position: "center" as const,
  },
  {
    id: 5,
    target: "rooms",
    title: "Salles de discussion",
    description:
      "Rejoignez des salles thématiques pour discuter avec d'autres passionnés et partager vos analyses.",
    position: "center" as const,
  },
]

interface GuidedTourProps {
  onComplete: () => void
  onSkip: () => void
}

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const utils = api.useUtils()

  const completeMutation = api.tour.complete.useMutation({
    onSuccess: () => {
      void utils.tour.getStatus.invalidate()
      onComplete()
    },
  })

  const skipMutation = api.tour.skip.useMutation({
    onSuccess: () => {
      void utils.tour.getStatus.invalidate()
      onSkip()
    },
  })

  const step = TOUR_STEPS[currentStep]
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const isLoading = completeMutation.isPending || skipMutation.isPending

  const handleNext = () => {
    if (isLastStep) {
      completeMutation.mutate()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const handleSkip = () => {
    skipMutation.mutate()
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleOutsideClick = () => {
    if (!isPaused) {
      setIsPaused(true)
    }
  }

  if (!step) return null

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        className="fixed inset-0 bg-black/70 z-40 transition-opacity"
        onClick={handleOutsideClick}
      />

      {/* Pause Dialog */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary rounded-xl p-6 max-w-sm space-y-4">
            <h3 className="font-display font-bold text-text-primary text-center">
              Continuer le tour ?
            </h3>
            <p className="text-text-secondary text-center text-sm">
              Le tour guidé est en pause. Voulez-vous continuer ?
            </p>
            <div className="space-y-2">
              <Button onClick={handleResume} className="w-full">
                Continuer
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-text-secondary"
              >
                Arrêter le tour
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {!isPaused && (
        <div
          className={cn(
            "fixed z-50 bg-bg-secondary rounded-xl shadow-2xl max-w-sm",
            step.position === "top" && "bottom-20 left-1/2 -translate-x-1/2",
            step.position === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
        >
          {/* Progress */}
          <div className="flex gap-1 p-4 pb-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all",
                  index <= currentStep ? "bg-accent-cyan" : "bg-bg-tertiary"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="px-6 pb-4 space-y-3">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-text-primary text-lg">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Step indicator */}
            <div className="text-xs text-text-tertiary text-center">
              Étape {currentStep + 1} sur {TOUR_STEPS.length}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-bg-tertiary flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                Retour
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? "..."
                : isLastStep
                ? "Terminer"
                : "Suivant"}
            </Button>
          </div>

          {/* Skip link */}
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full text-xs text-text-tertiary hover:text-text-secondary transition-colors pb-3"
          >
            Passer le tour
          </button>
        </div>
      )}
    </>
  )
}
