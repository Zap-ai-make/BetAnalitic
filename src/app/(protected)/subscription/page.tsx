"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, Check, Crown, Zap } from "lucide-react"
import { cn } from "~/lib/utils"
import { SUBSCRIPTION_PLANS } from "~/lib/subscription/plans"

type Currency = "fcfa" | "usd"

export default function SubscriptionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currency, setCurrency] = React.useState<Currency>("fcfa")

  const currentPlan = (session?.user?.subscriptionTier ?? "FREE") as "FREE" | "PREMIUM"

  const free = SUBSCRIPTION_PLANS.FREE
  const premium = SUBSCRIPTION_PLANS.PREMIUM

  const premiumPrice = currency === "fcfa"
    ? `${premium.price.monthlyFcfa.toLocaleString("fr-FR")} FCFA`
    : `$${premium.price.monthly.toFixed(2)}`

  const handleUpgrade = () => {
    window.location.href = `mailto:contact@betanalytic.app?subject=Upgrade%20vers%20PREMIUM`
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-11"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Abonnement</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-28 space-y-5">
        {/* Hero */}
        <div className="text-center pt-2 pb-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-3">
            <Crown className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="font-display font-bold text-xl text-text-primary">Choisissez votre plan</h1>
          <p className="text-sm text-text-tertiary mt-1">Débloquez tout le potentiel de vos analyses</p>
        </div>

        {/* Currency toggle */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-xl border border-bg-tertiary">
            <button
              onClick={() => setCurrency("fcfa")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                currency === "fcfa" ? "bg-accent-cyan text-bg-primary" : "text-text-secondary"
              )}
            >
              FCFA
            </button>
            <button
              onClick={() => setCurrency("usd")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                currency === "usd" ? "bg-accent-cyan text-bg-primary" : "text-text-secondary"
              )}
            >
              USD
            </button>
          </div>
        </div>

        {/* FREE plan */}
        <div className={cn(
          "rounded-2xl border p-5 space-y-4",
          currentPlan === "FREE"
            ? "bg-bg-secondary border-accent-cyan/40"
            : "bg-bg-secondary border-bg-tertiary"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-text-primary text-lg">Free</h2>
                {currentPlan === "FREE" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    Actuel
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">{free.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-2xl text-text-primary">0</p>
              <p className="text-xs text-text-tertiary">/mois</p>
            </div>
          </div>

          <div className="space-y-2">
            {free.features.filter(f => f.included).map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-text-tertiary shrink-0" />
                <p className="text-sm text-text-secondary">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PREMIUM plan */}
        <div className={cn(
          "rounded-2xl border-2 p-5 space-y-4 relative overflow-hidden",
          currentPlan === "PREMIUM"
            ? "bg-bg-secondary border-accent-cyan"
            : "bg-linear-to-br from-accent-cyan/5 to-accent-purple/5 border-accent-cyan/60"
        )}>
          {/* Popular badge */}
          <div className="absolute top-0 right-0">
            <div className="bg-accent-cyan text-bg-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl">
              RECOMMANDÉ
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-text-primary text-lg">Premium</h2>
                {currentPlan === "PREMIUM" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    Actuel
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">{premium.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-2xl text-accent-cyan">{premiumPrice}</p>
              <p className="text-xs text-text-tertiary">/mois</p>
            </div>
          </div>

          <div className="space-y-2">
            {premium.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className={cn("w-4 h-4 shrink-0", f.highlight ? "text-accent-cyan" : "text-green-400")} />
                <p className={cn("text-sm", f.highlight ? "font-semibold text-text-primary" : "text-text-secondary")}>
                  {f.text}
                </p>
              </div>
            ))}
          </div>

          {currentPlan !== "PREMIUM" && (
            <button
              onClick={handleUpgrade}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-cyan text-bg-primary font-semibold text-sm hover:bg-accent-cyan/90 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Passer à Premium
            </button>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-3">
          <h3 className="font-display font-semibold text-text-primary text-sm">Questions fréquentes</h3>
          <div className="space-y-3 divide-y divide-bg-tertiary">
            <div className="pt-0">
              <p className="text-sm font-medium text-text-primary">Puis-je annuler à tout moment ?</p>
              <p className="text-xs text-text-tertiary mt-0.5">Oui, sans engagement. Votre accès reste actif jusqu'à la fin de la période.</p>
            </div>
            <div className="pt-3">
              <p className="text-sm font-medium text-text-primary">Quels moyens de paiement ?</p>
              <p className="text-xs text-text-tertiary mt-0.5">Mobile Money, virement et carte bancaire via Stripe sécurisé.</p>
            </div>
            <div className="pt-3">
              <p className="text-sm font-medium text-text-primary">Comment souscrire ?</p>
              <p className="text-xs text-text-tertiary mt-0.5">Cliquez sur "Passer à Premium" — notre équipe vous contacte sous 24h.</p>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
