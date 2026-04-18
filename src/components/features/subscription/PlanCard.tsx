/**
 * Epic 9 Story 9.1: Subscription Plan Card Component
 */

import * as React from "react"
import { Check, X, Sparkles } from "lucide-react"
import { cn } from "~/lib/utils"
import type {
  SubscriptionPlan,
  BillingCycle,
  PlanId,
} from "~/lib/subscription/plans"
import { formatPrice } from "~/lib/subscription/plans"

interface PlanCardProps {
  plan: SubscriptionPlan
  billingCycle: BillingCycle
  currentPlan?: PlanId
  onSelect: (planId: PlanId) => void
  className?: string
}

export function PlanCard({
  plan,
  billingCycle,
  currentPlan,
  onSelect,
  className,
}: PlanCardProps) {
  const isCurrent = currentPlan === plan.id
  const price =
    billingCycle === "month" ? plan.price.monthly : plan.price.yearlyMonthly
  const totalPrice =
    billingCycle === "month" ? plan.price.monthly : plan.price.yearly

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 transition-all",
        plan.popular
          ? "border-accent-cyan shadow-lg shadow-accent-cyan/20 scale-105"
          : "border-bg-tertiary hover:border-accent-cyan/50",
        isCurrent && "ring-2 ring-accent-green",
        className
      )}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-bg-primary" />
            <span className="text-xs font-bold text-bg-primary">
              POPULAIRE
            </span>
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-green rounded-full">
          <span className="text-xs font-bold text-bg-primary">
            PLAN ACTUEL
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3
            className="text-2xl font-display font-bold mb-2"
            style={{ color: plan.color }}
          >
            {plan.name}
          </h3>
          <p className="text-sm text-text-tertiary">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          {plan.price.monthly === 0 ? (
            <div className="text-4xl font-display font-bold text-text-primary">
              Gratuit
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-display font-bold text-text-primary">
                  {price.toFixed(2)}€
                </span>
                <span className="text-text-tertiary">/mois</span>
              </div>
              {billingCycle === "year" && (
                <p className="text-sm text-text-tertiary mt-2">
                  Soit {formatPrice(totalPrice, "year")}
                </p>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <li
              key={idx}
              className={cn(
                "flex items-start gap-3",
                !feature.included && "opacity-50"
              )}
            >
              {feature.included ? (
                <Check
                  className={cn(
                    "w-5 h-5 shrink-0 mt-0.5",
                    feature.highlight ? "text-accent-cyan" : "text-accent-green"
                  )}
                />
              ) : (
                <X className="w-5 h-5 shrink-0 mt-0.5 text-text-tertiary" />
              )}
              <span
                className={cn(
                  "text-sm",
                  feature.included ? "text-text-primary" : "text-text-tertiary",
                  feature.highlight && "font-semibold"
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrent}
          className={cn(
            "w-full py-3 rounded-xl font-semibold transition-all min-h-[44px]",
            isCurrent
              ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
              : plan.popular
                ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-primary hover:shadow-lg"
                : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan hover:text-bg-primary"
          )}
        >
          {isCurrent ? plan.cta : plan.cta}
        </button>
      </div>
    </div>
  )
}
