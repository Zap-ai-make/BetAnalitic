"use client"

/**
 * Epic 11 Story 11.9: Re-engagement Automation
 * Component to display win-back offers and incentives
 */

import * as React from "react"
import { Gift, Flame, Crown, Sparkles, X } from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export function WinBackOffers() {
  const [dismissed, setDismissed] = React.useState(false)
  const { data: offers } = api.reengagement.getWinBackOffers.useQuery()

  // Don't show if dismissed or no offers
  if (dismissed || !offers || offers.offers.length === 0) {
    return null
  }

  // Don't show for active users
  if (offers.engagementLevel === "ACTIVE") {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-accent-gold/10 to-accent-purple/10 border-2 border-accent-gold/30 rounded-2xl p-6 mb-6 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-accent-gold" />
        <h2 className="font-display font-bold text-lg text-text-primary">
          {offers.daysSinceLastActivity <= 7 ? "Bon retour !" : "Nous vous avons manqué !"}
        </h2>
      </div>

      <div className="space-y-3">
        {offers.offers.map((offer, index) => (
          <OfferCard key={index} offer={offer} />
        ))}
      </div>
    </div>
  )
}

interface OfferCardProps {
  offer: {
    type: string
    title: string
    description: string
    points?: number
    duration?: number
    action?: string
    items?: string[]
    expiresIn?: number
  }
}

function OfferCard({ offer }: OfferCardProps) {
  const getIcon = () => {
    switch (offer.type) {
      case "BONUS_POINTS":
        return <Gift className="w-5 h-5 text-accent-gold" />
      case "STREAK_PROTECTION":
        return <Flame className="w-5 h-5 text-accent-orange" />
      case "PREMIUM_TRIAL":
        return <Crown className="w-5 h-5 text-accent-purple" />
      case "PERSONALIZED_CONTENT":
        return <Sparkles className="w-5 h-5 text-accent-cyan" />
      default:
        return <Gift className="w-5 h-5 text-accent-gold" />
    }
  }

  const getBgColor = () => {
    switch (offer.type) {
      case "BONUS_POINTS":
        return "bg-accent-gold/10"
      case "STREAK_PROTECTION":
        return "bg-accent-orange/10"
      case "PREMIUM_TRIAL":
        return "bg-accent-purple/10"
      case "PERSONALIZED_CONTENT":
        return "bg-accent-cyan/10"
      default:
        return "bg-bg-tertiary"
    }
  }

  return (
    <div className={cn("p-4 rounded-xl", getBgColor())}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary mb-1">{offer.title}</h3>
          <p className="text-sm text-text-secondary mb-2">{offer.description}</p>

          {offer.points && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-lg text-sm font-semibold">
              +{offer.points} points
            </div>
          )}

          {offer.duration && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm font-semibold">
              {offer.duration} jours gratuits
            </div>
          )}

          {offer.action && (
            <p className="text-xs text-accent-orange font-semibold mt-2">{offer.action}</p>
          )}

          {offer.items && offer.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {offer.items.map((item, idx) => (
                <li key={idx} className="text-xs text-text-secondary flex items-center gap-1">
                  <span className="text-accent-cyan">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {offer.expiresIn && (
            <p className="text-xs text-text-tertiary mt-2">
              Expire dans {offer.expiresIn} jour{offer.expiresIn > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
