"use client"

/**
 * Epic 10 Story 10.10: Expert Onboarding & Best Practices
 * Onboarding flow for newly verified experts
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Crown,
  CheckCircle2,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function ExpertOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [monthlyPrice, setMonthlyPrice] = React.useState(9.99)
  const [yearlyPrice, setYearlyPrice] = React.useState(99.99)
  const [acceptingSubs, setAcceptingSubs] = React.useState(false)

  const { data: expertProfile } = api.expert.getMyExpertProfile.useQuery()
  const updatePricingMutation = api.expert.updatePricing.useMutation()

  const steps = [
    {
      title: "Bienvenue, Expert ! 👑",
      icon: Crown,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-text-secondary">
            Félicitations ! Vous êtes maintenant un expert vérifié sur BetAnalytic.
          </p>
          <p className="text-text-tertiary">
            Découvrons ensemble comment tirer le meilleur parti de votre statut d&apos;expert.
          </p>
          <div className="flex justify-center">
            <Sparkles className="w-16 h-16 text-accent-gold animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      title: "Créer du contenu premium",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            En tant qu&apos;expert, vous pouvez créer du contenu premium réservé à vos abonnés payants.
          </p>
          <ul className="space-y-3 text-text-tertiary">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <span>Analyses tactiques détaillées</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <span>Pronostics exclusifs avec raisonnement</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <span>Statistiques et données avancées</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <span>Formations et guides</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Développer votre communauté",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary">
            Construisez une communauté fidèle autour de votre expertise.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-tertiary rounded-xl p-4">
              <h4 className="font-semibold text-text-primary mb-2">Abonnés gratuits</h4>
              <p className="text-sm text-text-tertiary">
                Suivent votre contenu public et peuvent devenir payants
              </p>
            </div>
            <div className="bg-bg-tertiary rounded-xl p-4">
              <h4 className="font-semibold text-text-primary mb-2">Abonnés premium</h4>
              <p className="text-sm text-text-tertiary">
                Accèdent à votre contenu exclusif et vous génèrent des revenus
              </p>
            </div>
          </div>
          <p className="text-sm text-text-tertiary">
            💡 Astuce : Publiez régulièrement du contenu gratuit de qualité pour attirer de nouveaux abonnés.
          </p>
        </div>
      ),
    },
    {
      title: "Définir vos tarifs",
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <p className="text-text-secondary">
            Configurez vos prix d&apos;abonnement. Vous pouvez les modifier à tout moment.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Prix mensuel (€)
              </label>
              <input
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-bg-tertiary border-2 border-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Recommandé : 5€ - 15€/mois
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Prix annuel (€)
              </label>
              <input
                type="number"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-bg-tertiary border-2 border-bg-tertiary rounded-xl text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
              />
              <p className="text-xs text-text-tertiary mt-1">
                Recommandé : 50€ - 150€/an (offrez 2 mois gratuits)
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl">
              <div>
                <p className="font-semibold text-text-primary">Accepter les abonnements</p>
                <p className="text-sm text-text-tertiary">
                  Activez les abonnements quand vous êtes prêt
                </p>
              </div>
              <button
                onClick={() => setAcceptingSubs(!acceptingSubs)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors",
                  acceptingSubs ? "bg-accent-cyan" : "bg-bg-primary"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white transition-transform",
                    acceptingSubs ? "translate-x-6" : "translate-x-0.5",
                    "mt-0.5"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl p-4">
            <p className="text-sm text-text-secondary">
              <strong>Commission plateforme :</strong> 20%
              <br />
              Vous recevez 80% des revenus générés par vos abonnements.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Bonnes pratiques",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-text-secondary mb-4">
            Conseils pour réussir en tant qu&apos;expert :
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-xl">
              <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-green font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Soyez régulier</h4>
                <p className="text-sm text-text-tertiary">
                  Publiez au moins 2-3 contenus par semaine
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-xl">
              <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-cyan font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Qualité avant quantité</h4>
                <p className="text-sm text-text-tertiary">
                  Privilégiez les analyses approfondies et bien argumentées
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-xl">
              <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-purple font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Engagez votre communauté</h4>
                <p className="text-sm text-text-tertiary">
                  Répondez aux commentaires et créez des salles de discussion
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-tertiary rounded-xl">
              <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-gold font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">Transparence</h4>
                <p className="text-sm text-text-tertiary">
                  Partagez vos résultats, bons comme mauvais
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData?.icon ?? Crown
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    if (currentStep === 3) {
      // Save pricing settings
      await updatePricingMutation.mutateAsync({
        monthlyPrice,
        yearlyPrice,
        isAcceptingSubs: acceptingSubs,
      })
    }

    if (isLastStep) {
      router.push("/expert/dashboard")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  if (!expertProfile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-secondary">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-1 h-2 rounded-full mx-1",
                  idx <= currentStep ? "bg-accent-cyan" : "bg-bg-tertiary"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-text-tertiary text-center">
            Étape {currentStep + 1} sur {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-accent-gold" />
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              {currentStepData?.title}
            </h1>
          </div>

          {currentStepData?.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-bg-secondary text-text-primary rounded-xl font-semibold hover:bg-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Précédent
          </button>

          <button
            onClick={handleNext}
            disabled={updatePricingMutation.isPending}
            className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isLastStep ? "Commencer" : "Suivant"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/expert/dashboard")}
            className="text-text-tertiary hover:text-text-primary transition-colors text-sm"
          >
            Passer l&apos;onboarding
          </button>
        </div>
      </div>
    </div>
  )
}
