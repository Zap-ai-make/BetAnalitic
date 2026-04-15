/**
 * Story 9.9: Subscription Page
 */

import { redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { PricingGrid } from "~/components/features/subscription/PricingCard"
import { UsageStats, UpgradeBanner } from "~/components/features/subscription/UsageStats"
import { BillingHistory, PaymentMethodCard } from "~/components/features/subscription/BillingHistory"

// Mock data
const MOCK_USAGE = {
  analyses: { current: 2, limit: 3 },
  agents: { current: 2, limit: 2 },
  rooms: { current: 0, limit: 0 },
}

const MOCK_INVOICES = [
  {
    id: "1",
    date: new Date(2024, 2, 15),
    amount: 9.99,
    status: "paid" as const,
    description: "Premium - Mars 2024",
    downloadUrl: "#",
  },
  {
    id: "2",
    date: new Date(2024, 1, 15),
    amount: 9.99,
    status: "paid" as const,
    description: "Premium - Février 2024",
    downloadUrl: "#",
  },
]

export default async function SubscriptionPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const currentPlan = "free" // Mock
  const showUpgradeBanner = currentPlan === "free"

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Abonnement
          </h1>
          <p className="text-text-secondary mt-1">
            Gérez votre plan et votre facturation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Upgrade Banner */}
        {showUpgradeBanner && (
          <UpgradeBanner
            currentPlan="Free"
            message="Passez à Premium pour des analyses illimitées"
          />
        )}

        {/* Current Usage */}
        <section className="p-6 bg-bg-secondary rounded-2xl">
          <UsageStats
            analyses={MOCK_USAGE.analyses}
            agents={MOCK_USAGE.agents}
            rooms={MOCK_USAGE.rooms}
          />
        </section>

        {/* Billing Period Toggle */}
        <section>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-text-secondary">Mensuel</span>
            <button
              type="button"
              className="relative w-14 h-7 bg-accent-cyan/30 rounded-full transition-colors"
            >
              <span className="absolute left-1 top-1 w-5 h-5 bg-accent-cyan rounded-full transition-transform" />
            </button>
            <span className="text-text-primary font-medium">
              Annuel
              <span className="ml-2 px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full">
                -20%
              </span>
            </span>
          </div>

          {/* Pricing Grid */}
          <PricingGrid currentPlan={currentPlan} billingPeriod="year" />
        </section>

        {/* Payment Method */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-text-primary">
              Moyen de paiement
            </h3>
            <button
              type="button"
              className="text-sm text-accent-cyan hover:underline"
            >
              + Ajouter une carte
            </button>
          </div>

          {currentPlan === "free" ? (
            <div className="p-6 bg-bg-secondary rounded-xl text-center">
              <p className="text-text-tertiary">
                Ajoutez un moyen de paiement pour passer à un plan payant
              </p>
            </div>
          ) : (
            <PaymentMethodCard
              type="visa"
              last4="4242"
              expiryMonth={12}
              expiryYear={2025}
              isDefault
            />
          )}
        </section>

        {/* Billing History */}
        {MOCK_INVOICES.length > 0 && (
          <section>
            <BillingHistory invoices={MOCK_INVOICES} />
          </section>
        )}

        {/* Cancel Subscription */}
        {currentPlan !== "free" && (
          <section className="p-6 bg-bg-secondary rounded-2xl">
            <h3 className="font-display font-semibold text-text-primary mb-2">
              Annuler l&apos;abonnement
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Si vous annulez, vous conserverez l&apos;accès jusqu&apos;à la fin de votre
              période de facturation.
            </p>
            <button
              type="button"
              className="px-4 py-2 border border-accent-red text-accent-red rounded-lg text-sm hover:bg-accent-red/10 transition-colors"
            >
              Annuler mon abonnement
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
