"use client"

/**
 * Epic 9 Story 9.1: Subscription Plans Display Page
 */

import * as React from "react"
import { Crown, Sparkles, TrendingUp, Check } from "lucide-react"
import { cn } from "~/lib/utils"
import { PlanCard } from "~/components/features/subscription/PlanCard"
import { PlanComparison } from "~/components/features/subscription/PlanComparison"
import {
  SUBSCRIPTION_PLANS,
  PLAN_ORDER,
  getYearlyDiscount,
  calculateYearlySavings,
} from "~/lib/subscription/plans"
import type { BillingCycle, PlanId } from "~/lib/subscription/plans"

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("month")
  const [showComparison, setShowComparison] = React.useState(false)

  // TODO: Replace with real user query when auth is ready
  const currentPlan: PlanId = "FREE" // Mock current plan

  const handleSelectPlan = (planId: PlanId) => {
    if (planId === currentPlan) return
    // TODO: Story 9.2 - Implement Stripe checkout
    console.log("Selected plan:", planId)
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-accent-gold animate-pulse" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Abonnements
            </h1>
          </div>
          <p className="text-center text-text-secondary max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins et débloquez tout le
            potentiel de vos analyses sportives.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Billing Cycle Toggle */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 p-1 bg-bg-secondary rounded-xl border border-bg-tertiary">
            <button
              onClick={() => setBillingCycle("month")}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all",
                billingCycle === "month"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle("year")}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all relative",
                billingCycle === "year"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Annuel
              <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent-green rounded-full">
                <span className="text-xs font-bold text-bg-primary">
                  -{getYearlyDiscount("PREMIUM")}%
                </span>
              </div>
            </button>
          </div>

          {billingCycle === "year" && (
            <div className="flex items-center gap-2 text-sm text-accent-green animate-in fade-in duration-300">
              <TrendingUp className="w-4 h-4" />
              <span>
                Économisez jusqu&apos;à{" "}
                {calculateYearlySavings("PREMIUM").toFixed(2)}€ par an avec le
                paiement annuel
              </span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 mt-12">
          {PLAN_ORDER.map((planId) => {
            const plan = SUBSCRIPTION_PLANS[planId]
            if (!plan) return null

            return (
              <PlanCard
                key={planId}
                plan={plan}
                billingCycle={billingCycle}
                currentPlan={currentPlan}
                onSelect={handleSelectPlan}
              />
            )
          })}
        </div>

        {/* Compare Plans Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-6 py-3 bg-bg-secondary border border-bg-tertiary rounded-xl font-semibold text-text-primary hover:border-accent-cyan transition-colors"
          >
            {showComparison ? "Masquer" : "Comparer"} les plans
          </button>
        </div>

        {/* Comparison Table */}
        {showComparison && (
          <div className="mt-8 bg-bg-secondary rounded-2xl p-6 border border-bg-tertiary animate-in slide-in-from-top duration-300">
            <PlanComparison
              currentPlan={currentPlan}
              onSelectPlan={handleSelectPlan}
            />
          </div>
        )}

        {/* Value Props */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
            <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-accent-cyan" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">
              Analyses IA Avancées
            </h3>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Accédez à nos 6 agents IA spécialisés pour des prédictions ultra
              précises basées sur les données, l&apos;intelligence et la
              stratégie.
            </p>
          </div>

          <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
            <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-accent-purple" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">
              Programme Expert
            </h3>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Devenez une référence vérifiée, créez du contenu exclusif et
              monétisez votre expertise avec un revenue share de 70/30.
            </p>
          </div>

          <div className="bg-bg-secondary rounded-xl p-6 border border-bg-tertiary">
            <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-accent-green" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">
              Garantie Satisfait
            </h3>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Annulez à tout moment sans engagement. Vos données restent
              accessibles même après annulation.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8 bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 rounded-2xl p-6 border border-accent-cyan/30">
          <h3 className="font-display font-bold text-lg text-text-primary mb-4">
            Questions fréquentes
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  Puis-je changer de plan à tout moment ?
                </p>
                <p className="text-sm text-text-tertiary">
                  Oui, vous pouvez upgrader immédiatement ou downgrader à la fin
                  de votre cycle de facturation.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  Comment fonctionne la monétisation Expert ?
                </p>
                <p className="text-sm text-text-tertiary">
                  Créez du contenu premium, fixez votre prix, et recevez 70% des
                  revenus. Paiements mensuels via Stripe Connect.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text-primary text-sm">
                  Les paiements sont-ils sécurisés ?
                </p>
                <p className="text-sm text-text-tertiary">
                  Tous les paiements sont gérés par Stripe avec 3D Secure. Nous ne
                  stockons jamais vos données bancaires.
                </p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
