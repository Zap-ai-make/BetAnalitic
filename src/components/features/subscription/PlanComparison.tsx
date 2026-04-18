/**
 * Epic 9 Story 9.1: Plan Comparison Table
 */

import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "~/lib/utils"
import { SUBSCRIPTION_PLANS, PLAN_ORDER } from "~/lib/subscription/plans"
import type { PlanId } from "~/lib/subscription/plans"

interface ComparisonFeature {
  category: string
  features: {
    name: string
    free: boolean | string
    premium: boolean | string
    expert: boolean | string
  }[]
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    category: "Analyses & Agents IA",
    features: [
      {
        name: "Analyses par jour",
        free: "5",
        premium: "Illimitées",
        expert: "Illimitées",
      },
      {
        name: "Agents IA disponibles",
        free: "1 agent",
        premium: "Tous les agents",
        expert: "Tous les agents",
      },
      {
        name: "Statistiques avancées (xG, form)",
        free: false,
        premium: true,
        expert: true,
      },
      {
        name: "Insights exclusifs temps réel",
        free: false,
        premium: true,
        expert: true,
      },
    ],
  },
  {
    category: "Salles & Communauté",
    features: [
      {
        name: "Salles publiques (lecture)",
        free: true,
        premium: true,
        expert: true,
      },
      {
        name: "Créer des salles privées",
        free: false,
        premium: true,
        expert: true,
      },
      {
        name: "Salle Expert avec abonnés",
        free: false,
        premium: false,
        expert: true,
      },
      {
        name: "Débats DebateArena personnalisés",
        free: false,
        premium: false,
        expert: true,
      },
    ],
  },
  {
    category: "Expert & Monétisation",
    features: [
      {
        name: "Badge vérifié Expert",
        free: false,
        premium: false,
        expert: true,
      },
      {
        name: "Monétisation de contenu",
        free: false,
        premium: false,
        expert: true,
      },
      {
        name: "Analytics audience",
        free: false,
        premium: false,
        expert: true,
      },
      {
        name: "Revenue share",
        free: false,
        premium: false,
        expert: "70/30",
      },
    ],
  },
  {
    category: "Support & Autres",
    features: [
      {
        name: "Historique complet",
        free: false,
        premium: true,
        expert: true,
      },
      {
        name: "Notifications push avancées",
        free: false,
        premium: true,
        expert: true,
      },
      {
        name: "Support",
        free: "Standard",
        premium: "Prioritaire",
        expert: "Dédié",
      },
      {
        name: "Early access features",
        free: false,
        premium: false,
        expert: true,
      },
    ],
  },
]

interface PlanComparisonProps {
  currentPlan?: PlanId
  onSelectPlan: (planId: PlanId) => void
  className?: string
}

export function PlanComparison({
  currentPlan,
  onSelectPlan,
  className,
}: PlanComparisonProps) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-accent-green mx-auto" />
      ) : (
        <X className="w-5 h-5 text-text-tertiary mx-auto opacity-30" />
      )
    }
    return <span className="text-sm text-text-primary">{value}</span>
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="border-b border-bg-tertiary">
            <th className="p-4 text-left">
              <span className="text-sm font-semibold text-text-tertiary">
                Fonctionnalités
              </span>
            </th>
            {PLAN_ORDER.map((planId) => {
              const plan = SUBSCRIPTION_PLANS[planId]
              const isCurrent = currentPlan === planId
              return (
                <th
                  key={planId}
                  className={cn(
                    "p-4 text-center",
                    plan?.popular && "bg-accent-cyan/5"
                  )}
                >
                  <div className="space-y-2">
                    <div
                      className="text-lg font-display font-bold"
                      style={{ color: plan?.color }}
                    >
                      {plan?.name}
                    </div>
                    {isCurrent && (
                      <div className="inline-block px-3 py-1 bg-accent-green rounded-full">
                        <span className="text-xs font-bold text-bg-primary">
                          ACTUEL
                        </span>
                      </div>
                    )}
                    {!isCurrent && (
                      <button
                        onClick={() => onSelectPlan(planId)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                          plan?.popular
                            ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
                            : "bg-bg-tertiary text-text-primary hover:bg-accent-cyan hover:text-bg-primary"
                        )}
                      >
                        {plan?.cta}
                      </button>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {COMPARISON_FEATURES.map((category, catIdx) => (
            <React.Fragment key={catIdx}>
              {/* Category Header */}
              <tr className="bg-bg-tertiary/50">
                <td colSpan={4} className="p-3">
                  <span className="text-sm font-semibold text-text-primary">
                    {category.category}
                  </span>
                </td>
              </tr>

              {/* Features */}
              {category.features.map((feature, featIdx) => (
                <tr
                  key={featIdx}
                  className="border-b border-bg-tertiary hover:bg-bg-secondary transition-colors"
                >
                  <td className="p-4 text-sm text-text-secondary">
                    {feature.name}
                  </td>
                  <td className="p-4 text-center">
                    {renderCell(feature.free)}
                  </td>
                  <td
                    className={cn(
                      "p-4 text-center",
                      SUBSCRIPTION_PLANS.PREMIUM.popular && "bg-accent-cyan/5"
                    )}
                  >
                    {renderCell(feature.premium)}
                  </td>
                  <td className="p-4 text-center">
                    {renderCell(feature.expert)}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
