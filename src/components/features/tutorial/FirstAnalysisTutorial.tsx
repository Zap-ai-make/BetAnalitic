"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Bienvenue dans votre première analyse",
    description:
      "Découvrez comment nos agents IA peuvent vous aider à analyser un match de football.",
    icon: "👋",
  },
  {
    id: 2,
    title: "Choisissez un match",
    description:
      "Sélectionnez un match qui vous intéresse. Nous vous suggérons le match du jour le plus populaire.",
    icon: "⚽",
    suggestedMatch: {
      home: "Paris Saint-Germain",
      away: "Olympique de Marseille",
      time: "21:00",
      league: "Ligue 1",
    },
  },
  {
    id: 3,
    title: "Invoquez un agent",
    description:
      'Tapez "@Scout" dans le chat pour demander une analyse. Scout détecte les opportunités et analyse les données clés.',
    icon: "🤖",
    tip: "Tapez @ pour voir tous les agents disponibles",
  },
  {
    id: 4,
    title: "Recevez votre analyse",
    description:
      "L'agent analyse le match en temps réel et vous donne son rapport avec les points clés à considérer.",
    icon: "📊",
    preview: [
      "• Forme récente des équipes",
      "• Confrontations directes",
      "• Statistiques clés",
      "• Points d'attention",
    ],
  },
  {
    id: 5,
    title: "Félicitations ! 🎉",
    description:
      "Vous êtes prêt à utiliser BetAnalytic. Essayez d'autres agents pour des perspectives différentes.",
    icon: "🏆",
    nextSteps: [
      { agent: "Analyst", description: "Statistiques approfondies" },
      { agent: "Predictor", description: "Prédictions IA" },
      { agent: "Odds Master", description: "Comparaison des cotes" },
    ],
  },
]

interface FirstAnalysisTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export function FirstAnalysisTutorial({
  onComplete,
  onSkip,
}: FirstAnalysisTutorialProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const utils = api.useUtils()

  const completeMutation = api.tutorial.complete.useMutation({
    onSuccess: () => {
      void utils.tutorial.getStatus.invalidate()
      onComplete()
    },
  })

  const skipMutation = api.tutorial.skip.useMutation({
    onSuccess: () => {
      void utils.tutorial.getStatus.invalidate()
      onSkip()
    },
  })

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1
  const isLoading = completeMutation.isPending || skipMutation.isPending

  const handleNext = () => {
    if (isLastStep) {
      completeMutation.mutate()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleSkip = () => {
    skipMutation.mutate()
  }

  const handleExplorAgents = () => {
    completeMutation.mutate()
    router.push("/agents")
  }

  if (!step) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-xl w-full max-w-lg overflow-hidden">
        {/* Progress */}
        <div className="flex gap-1 p-4">
          {TUTORIAL_STEPS.map((_, index) => (
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
        <div className="px-6 pb-6 space-y-4">
          {/* Icon */}
          <div className="text-center">
            <span className="text-6xl">{step.icon}</span>
          </div>

          {/* Title */}
          <h2 className="font-display text-xl font-bold text-text-primary text-center">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-center leading-relaxed">
            {step.description}
          </p>

          {/* Step 2: Suggested Match */}
          {step.suggestedMatch && (
            <div className="bg-bg-tertiary rounded-xl p-4">
              <div className="text-center space-y-2">
                <div className="text-xs text-text-tertiary uppercase tracking-wide">
                  {step.suggestedMatch.league}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-medium text-text-primary">
                    {step.suggestedMatch.home}
                  </span>
                  <span className="text-text-tertiary">vs</span>
                  <span className="font-medium text-text-primary">
                    {step.suggestedMatch.away}
                  </span>
                </div>
                <div className="text-sm text-accent-cyan">
                  {step.suggestedMatch.time}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tip */}
          {step.tip && (
            <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg p-3">
              <p className="text-sm text-accent-cyan text-center">
                💡 {step.tip}
              </p>
            </div>
          )}

          {/* Step 4: Preview */}
          {step.preview && (
            <div className="bg-bg-tertiary rounded-xl p-4 space-y-2">
              {step.preview.map((item, i) => (
                <p key={i} className="text-sm text-text-secondary">
                  {item}
                </p>
              ))}
            </div>
          )}

          {/* Step 5: Next Steps */}
          {step.nextSteps && (
            <div className="space-y-2">
              {step.nextSteps.map((next, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-bg-tertiary rounded-lg p-3"
                >
                  <span className="text-xl">🤖</span>
                  <div>
                    <p className="font-medium text-text-primary">
                      @{next.agent}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {next.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bg-tertiary space-y-3">
          {isLastStep ? (
            <>
              <Button
                onClick={handleExplorAgents}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "..." : "Explorer les agents"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full"
              >
                Aller au tableau de bord
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full"
              >
                {currentStep === 0 ? "Commencer" : "Suivant"}
              </Button>
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full text-sm text-text-tertiary hover:text-text-secondary transition-colors py-2"
              >
                Passer le tutoriel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
