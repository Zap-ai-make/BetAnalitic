export type PlanId = "FREE" | "PREMIUM"
export type BillingCycle = "month" | "year"

export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PlanPrice {
  monthly: number      // USD
  monthlyFcfa: number  // FCFA
  yearly: number       // USD
  yearlyFcfa: number   // FCFA
  yearlyMonthly: number
}

export interface SubscriptionPlan {
  id: PlanId
  name: string
  tagline: string
  price: PlanPrice
  popular?: boolean
  features: PlanFeature[]
  cta: string
  color: string
}

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  FREE: {
    id: "FREE",
    name: "Free",
    tagline: "Pour découvrir l'analyse sportive",
    price: {
      monthly: 0,
      monthlyFcfa: 0,
      yearly: 0,
      yearlyFcfa: 0,
      yearlyMonthly: 0,
    },
    features: [
      { text: "1 match analysé par jour", included: true, highlight: true },
      { text: "3 agents disponibles (Oracle, Scout, RefereeAnalyst)", included: true },
      { text: "Statistiques de base", included: true },
      { text: "Salles publiques (lecture)", included: true },
      { text: "Analyses illimitées", included: false },
      { text: "Tous les agents IA", included: false },
      { text: "Salles privées", included: false },
      { text: "Support", included: false },
    ],
    cta: "Plan actuel",
    color: "#64748B",
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    tagline: "Pour les parieurs sérieux",
    price: {
      monthly: 4.5,
      monthlyFcfa: 2500,
      yearly: 45,
      yearlyFcfa: 25000,
      yearlyMonthly: 3.75,
    },
    popular: true,
    features: [
      { text: "Analyses illimitées", included: true, highlight: true },
      { text: "Accès à tous les agents IA", included: true, highlight: true },
      { text: "Statistiques avancées (xG, form)", included: true },
      { text: "Insights exclusifs temps réel", included: true },
      { text: "Salles privées (créer et rejoindre)", included: true },
      { text: "Historique complet", included: true },
      { text: "Support prioritaire", included: true },
    ],
    cta: "S'abonner",
    color: "#00D9FF",
  },
}

export const PLAN_ORDER: PlanId[] = ["FREE", "PREMIUM"]

export function calculateYearlySavings(planId: PlanId): number {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) return 0
  return plan.price.monthly * 12 - plan.price.yearly
}

export function getYearlyDiscount(planId: PlanId): number {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan || plan.price.monthly === 0) return 0
  const monthlyTotal = plan.price.monthly * 12
  return Math.round(((monthlyTotal - plan.price.yearly) / monthlyTotal) * 100)
}

export function formatPrice(amount: number, cycle: BillingCycle = "month"): string {
  if (amount === 0) return "Gratuit"
  const formatted = amount.toFixed(2)
  const cycleText = cycle === "month" ? "/mois" : "/an"
  return `${formatted}$${cycleText}`
}
