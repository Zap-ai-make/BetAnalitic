/**
 * Epic 9 Story 9.1: Subscription Plans Configuration
 * Plan definitions, pricing, and feature lists
 */

export type PlanId = "FREE" | "PREMIUM" | "EXPERT"
export type BillingCycle = "month" | "year"

export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PlanPrice {
  monthly: number
  yearly: number
  yearlyMonthly: number // Monthly equivalent when billed yearly
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
      yearly: 0,
      yearlyMonthly: 0,
    },
    features: [
      { text: "5 analyses par jour", included: true },
      { text: "Accès aux matchs en direct", included: true },
      { text: "Statistiques de base", included: true },
      { text: "1 agent IA", included: true },
      { text: "Salles publiques (lecture)", included: true },
      { text: "Agents IA avancés", included: false },
      { text: "Analyses illimitées", included: false },
      { text: "Insights exclusifs", included: false },
      { text: "Salles privées", included: false },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Plan actuel",
    color: "#64748B",
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    tagline: "Pour les parieurs sérieux",
    price: {
      monthly: 9.99,
      yearly: 99.99,
      yearlyMonthly: 8.33,
    },
    popular: true,
    features: [
      { text: "Analyses illimitées", included: true, highlight: true },
      { text: "Tous les agents IA", included: true, highlight: true },
      { text: "Statistiques avancées (xG, form)", included: true },
      { text: "Insights exclusifs temps réel", included: true },
      { text: "Salles privées (créer et rejoindre)", included: true },
      { text: "Historique complet", included: true },
      { text: "Notifications push avancées", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Badge vérification Expert", included: false },
      { text: "Monétisation contenu", included: false },
    ],
    cta: "S'abonner",
    color: "#00D9FF",
  },
  EXPERT: {
    id: "EXPERT",
    name: "Expert",
    tagline: "Pour devenir une référence",
    price: {
      monthly: 29.99,
      yearly: 299.99,
      yearlyMonthly: 25.00,
    },
    features: [
      { text: "Tout Premium +", included: true },
      { text: "Badge vérifié Expert", included: true, highlight: true },
      { text: "Monétisation de contenu", included: true, highlight: true },
      { text: "Salle Expert avec abonnés", included: true },
      { text: "Analytics audience détaillés", included: true },
      { text: "Débats personnalisés DebateArena", included: true },
      { text: "Priorité affichage contenus", included: true },
      { text: "Revenue share (70/30)", included: true },
      { text: "Support dédié", included: true },
      { text: "Early access nouvelles features", included: true },
    ],
    cta: "Devenir Expert",
    color: "#FFD60A",
  },
}

export const PLAN_ORDER: PlanId[] = ["FREE", "PREMIUM", "EXPERT"]

/**
 * Calculate savings when choosing yearly billing
 */
export function calculateYearlySavings(planId: PlanId): number {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) return 0

  const monthlyTotal = plan.price.monthly * 12
  const yearlyCost = plan.price.yearly

  return monthlyTotal - yearlyCost
}

/**
 * Get discount percentage for yearly billing
 */
export function getYearlyDiscount(planId: PlanId): number {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan || plan.price.monthly === 0) return 0

  const monthlyTotal = plan.price.monthly * 12
  const yearlyCost = plan.price.yearly

  return Math.round(((monthlyTotal - yearlyCost) / monthlyTotal) * 100)
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, cycle: BillingCycle = "month"): string {
  if (amount === 0) return "Gratuit"

  const formatted = amount.toFixed(2)
  const cycleText = cycle === "month" ? "/mois" : "/an"

  return `${formatted}€${cycleText}`
}
