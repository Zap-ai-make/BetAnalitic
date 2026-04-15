"use client"

/**
 * Story 9.1: Pricing Card
 * Subscription tier display
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Check, Star, Zap, Crown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PricingFeature {
  text: string
  included: boolean
  highlight?: boolean
}

interface PricingCardProps {
  name: string
  price: number
  period: "month" | "year"
  description: string
  features: PricingFeature[]
  icon: LucideIcon
  iconColor: string
  isPopular?: boolean
  isCurrent?: boolean
  onSelect?: () => void
  className?: string
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  icon: Icon,
  iconColor,
  isPopular = false,
  isCurrent = false,
  onSelect,
  className,
}: PricingCardProps) {
  const yearlyPrice = period === "year" ? price : price * 12
  const monthlyEquivalent = period === "year" ? price / 12 : price
  const savings = period === "year" ? Math.round((1 - price / (monthlyEquivalent * 12)) * 100) : 0

  return (
    <div
      className={cn(
        "relative p-6 bg-bg-secondary rounded-2xl border-2 transition-all",
        isPopular
          ? "border-accent-cyan shadow-lg shadow-accent-cyan/10"
          : "border-bg-tertiary hover:border-accent-cyan/50",
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-accent-cyan text-bg-primary text-xs font-medium rounded-full">
            Le plus populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn("p-3 rounded-xl", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-text-primary text-xl">
            {name}
          </h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-text-primary font-mono">
            {price === 0 ? "Gratuit" : `${monthlyEquivalent.toFixed(0)}€`}
          </span>
          {price > 0 && (
            <span className="text-text-tertiary">/ mois</span>
          )}
        </div>
        {period === "year" && price > 0 && (
          <p className="text-sm text-accent-green mt-1">
            {yearlyPrice}€/an • Économisez {savings}%
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className={cn(
              "flex items-start gap-2 text-sm",
              feature.included ? "text-text-primary" : "text-text-tertiary line-through"
            )}
          >
            <Check
              className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                feature.included
                  ? feature.highlight
                    ? "text-accent-cyan"
                    : "text-accent-green"
                  : "text-text-tertiary"
              )}
            />
            <span className={cn(feature.highlight && "font-medium")}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={onSelect}
        disabled={isCurrent}
        className={cn(
          "w-full py-3 px-4 rounded-xl font-medium min-h-[44px]",
          "transition-colors",
          isCurrent
            ? "bg-bg-tertiary text-text-tertiary cursor-default"
            : isPopular
              ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
              : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan hover:text-bg-primary"
        )}
      >
        {isCurrent ? "Plan actuel" : price === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
      </button>
    </div>
  )
}

/**
 * Story 9.2: Pricing Grid
 */
interface PricingGridProps {
  currentPlan?: string
  billingPeriod: "month" | "year"
  onSelectPlan?: (planId: string) => void
  className?: string
}

export function PricingGrid({
  currentPlan,
  billingPeriod,
  onSelectPlan,
  className,
}: PricingGridProps) {
  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Pour découvrir la plateforme",
      icon: Star,
      iconColor: "bg-bg-tertiary text-text-secondary",
      features: [
        { text: "3 analyses par jour", included: true },
        { text: "Accès à 2 agents", included: true },
        { text: "Historique 7 jours", included: true },
        { text: "Mode Live", included: false },
        { text: "DebateArena", included: false },
        { text: "Salles privées", included: false },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      monthlyPrice: 9.99,
      yearlyPrice: 95.90,
      description: "Pour les parieurs réguliers",
      icon: Zap,
      iconColor: "bg-accent-cyan/20 text-accent-cyan",
      isPopular: true,
      features: [
        { text: "Analyses illimitées", included: true, highlight: true },
        { text: "Accès à tous les agents", included: true, highlight: true },
        { text: "Historique illimité", included: true },
        { text: "Mode Live", included: true },
        { text: "DebateArena", included: true },
        { text: "1 salon privé", included: true },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 24.99,
      yearlyPrice: 239.90,
      description: "Pour les experts",
      icon: Crown,
      iconColor: "bg-accent-orange/20 text-accent-orange",
      features: [
        { text: "Tout Premium +", included: true },
        { text: "API Access", included: true, highlight: true },
        { text: "Webhooks personnalisés", included: true },
        { text: "Salons illimités", included: true },
        { text: "Support prioritaire", included: true },
        { text: "Badge Expert", included: true, highlight: true },
      ],
    },
  ]

  return (
    <div className={cn("grid gap-6 md:grid-cols-3", className)}>
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          name={plan.name}
          price={billingPeriod === "month" ? plan.monthlyPrice : plan.yearlyPrice}
          period={billingPeriod}
          description={plan.description}
          features={plan.features}
          icon={plan.icon}
          iconColor={plan.iconColor}
          isPopular={plan.isPopular}
          isCurrent={currentPlan === plan.id}
          onSelect={() => onSelectPlan?.(plan.id)}
        />
      ))}
    </div>
  )
}
