"use client"

/**
 * Epic 10 Story 10.1: Expert Application Page
 * Apply to become a verified expert
 */

import * as React from "react"
import { Crown, ArrowLeft, Shield, TrendingUp, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  ExpertApplicationForm,
  ApplicationSubmitted,
  type ExpertApplicationData,
} from "~/components/features/expert/ExpertApplicationForm"
import { api } from "~/trpc/react"

export default function ExpertApplicationPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // TODO: Replace with real user query when auth is ready
  const currentTier = "PREMIUM" // Mock - user must be Premium to apply

  const applyMutation = api.expert.submitApplication.useMutation({
    onSuccess: () => {
      setIsSubmitted(true)
    },
  })

  const handleSubmit = async (data: ExpertApplicationData) => {
    await applyMutation.mutateAsync(data)
  }

  // Check if user is Premium
  if (currentTier !== "PREMIUM" && currentTier !== "EXPERT") {
    return (
      <div className="min-h-screen bg-bg-primary pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border-b border-bg-tertiary">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-accent-gold animate-pulse" />
              <h1 className="text-3xl font-display font-bold text-text-primary">
                Devenir Expert
              </h1>
            </div>
          </div>
        </div>

        {/* Upgrade Required */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 rounded-2xl p-8 border border-accent-cyan/30 text-center">
            <Shield className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-text-primary mb-3">
              Abonnement Premium requis
            </h2>
            <p className="text-text-secondary mb-6">
              Pour devenir Expert, vous devez d&apos;abord avoir un abonnement Premium
              actif.
            </p>
            <button
              onClick={() => router.push("/subscription")}
              className="px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors"
            >
              Voir les plans Premium
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 border-b border-bg-tertiary">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-accent-gold animate-pulse" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Devenir Expert Vérifié
            </h1>
          </div>

          {!isSubmitted && (
            <p className="text-center text-text-secondary max-w-2xl mx-auto">
              Rejoignez notre programme Expert et monétisez votre expertise en
              analyse sportive.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {isSubmitted ? (
          <ApplicationSubmitted />
        ) : (
          <>
            {/* Benefits */}
            <section className="mb-8 grid md:grid-cols-3 gap-4">
              <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center mb-3">
                  <Crown className="w-5 h-5 text-accent-gold" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1 text-sm">
                  Badge Vérifié
                </h3>
                <p className="text-xs text-text-tertiary">
                  Crédibilité instantanée avec le badge Expert sur tout le site
                </p>
              </div>

              <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
                <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-accent-green" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1 text-sm">
                  Monétisation
                </h3>
                <p className="text-xs text-text-tertiary">
                  Revenue share 70/30 sur vos abonnés et contenu premium
                </p>
              </div>

              <div className="bg-bg-secondary rounded-xl p-5 border border-bg-tertiary">
                <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-accent-purple" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1 text-sm">
                  Audience Dédiée
                </h3>
                <p className="text-xs text-text-tertiary">
                  Salle Expert avec analytics et fonctionnalités avancées
                </p>
              </div>
            </section>

            {/* Application Form */}
            <section className="bg-bg-secondary rounded-2xl p-6 border border-bg-tertiary">
              <h2 className="font-display font-bold text-lg text-text-primary mb-6">
                Formulaire de candidature
              </h2>

              <ExpertApplicationForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
              />
            </section>

            {/* Requirements Notice */}
            <div className="mt-6 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl p-4">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Critères d&apos;évaluation :</strong>{" "}
                Track record vérifiable, expertise démontrable, présence en ligne active,
                qualité des analyses. Délai de révision : 48-72h.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
