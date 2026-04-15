"use client"

/**
 * Story 11.1: Referral Card
 * User's referral dashboard
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Gift, Copy, Check, Users, Coins, Share2 } from "lucide-react"

interface ReferralCardProps {
  referralCode: string
  referralLink: string
  totalReferrals: number
  pendingRewards: number
  earnedRewards: number
  currency?: string
  onShare?: () => void
  className?: string
}

export function ReferralCard({
  referralCode,
  referralLink,
  totalReferrals,
  pendingRewards,
  earnedRewards,
  currency = "€",
  onShare,
  className,
}: ReferralCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className={cn(
        "p-6 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20",
        "rounded-2xl border border-accent-cyan/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent-cyan/20 rounded-xl">
          <Gift className="w-6 h-6 text-accent-cyan" />
        </div>
        <div>
          <h3 className="font-display font-bold text-text-primary text-lg">
            Parrainez vos amis
          </h3>
          <p className="text-sm text-text-secondary">
            Gagnez 10€ pour chaque inscription Premium
          </p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-xs text-text-tertiary mb-2">
          Votre code parrain
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-bg-secondary rounded-xl font-mono text-text-primary text-lg tracking-wider">
            {referralCode}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "p-3 rounded-xl transition-colors min-h-[44px] min-w-[44px]",
              "flex items-center justify-center",
              copied
                ? "bg-accent-green text-white"
                : "bg-bg-secondary text-text-secondary hover:text-accent-cyan"
            )}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="p-3 bg-accent-cyan text-bg-primary rounded-xl hover:bg-accent-cyan/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-bg-secondary/50 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-accent-cyan mb-1">
            <Users className="w-4 h-4" />
            <span className="font-bold font-mono">{totalReferrals}</span>
          </div>
          <p className="text-xs text-text-tertiary">Filleuls</p>
        </div>

        <div className="p-3 bg-bg-secondary/50 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-accent-orange mb-1">
            <Coins className="w-4 h-4" />
            <span className="font-bold font-mono">{pendingRewards}{currency}</span>
          </div>
          <p className="text-xs text-text-tertiary">En attente</p>
        </div>

        <div className="p-3 bg-bg-secondary/50 rounded-xl text-center">
          <div className="flex items-center justify-center gap-1 text-accent-green mb-1">
            <Gift className="w-4 h-4" />
            <span className="font-bold font-mono">{earnedRewards}{currency}</span>
          </div>
          <p className="text-xs text-text-tertiary">Gagnés</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Story 11.2: Referral List
 */
interface Referral {
  id: string
  name: string
  avatar?: string
  joinedAt: Date
  status: "pending" | "active" | "rewarded"
  rewardAmount?: number
}

interface ReferralListProps {
  referrals: Referral[]
  currency?: string
  className?: string
}

export function ReferralList({
  referrals,
  currency = "€",
  className,
}: ReferralListProps) {
  const statusConfig = {
    pending: { label: "En attente", color: "text-accent-orange bg-accent-orange/20" },
    active: { label: "Actif", color: "text-accent-cyan bg-accent-cyan/20" },
    rewarded: { label: "Récompensé", color: "text-accent-green bg-accent-green/20" },
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-display font-semibold text-text-primary">
        Vos filleuls ({referrals.length})
      </h3>

      {referrals.length === 0 ? (
        <div className="p-8 bg-bg-secondary rounded-xl text-center">
          <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">Aucun filleul pour le moment</p>
          <p className="text-sm text-text-tertiary mt-1">
            Partagez votre code pour commencer !
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map((referral) => {
            const status = statusConfig[referral.status]

            return (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {referral.avatar ? (
                    <img
                      src={referral.avatar}
                      alt={referral.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-medium">
                      {referral.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-text-primary">{referral.name}</p>
                    <p className="text-xs text-text-tertiary">
                      Inscrit le{" "}
                      {referral.joinedAt.toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {referral.rewardAmount !== undefined && referral.status === "rewarded" && (
                    <span className="font-mono font-medium text-accent-green">
                      +{referral.rewardAmount}{currency}
                    </span>
                  )}
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Story 11.3: Referral How It Works
 */
export function ReferralHowItWorks({ className }: { className?: string }) {
  const steps = [
    {
      number: 1,
      title: "Partagez votre code",
      description: "Envoyez votre code unique à vos amis parieurs",
      icon: "📤",
    },
    {
      number: 2,
      title: "Ils s'inscrivent",
      description: "Vos amis créent un compte avec votre code",
      icon: "👥",
    },
    {
      number: 3,
      title: "Ils passent Premium",
      description: "Quand ils souscrivent à Premium, vous êtes récompensé",
      icon: "⭐",
    },
    {
      number: 4,
      title: "Vous gagnez 10€",
      description: "Crédit appliqué sur votre prochain paiement",
      icon: "🎁",
    },
  ]

  return (
    <div className={cn("p-6 bg-bg-secondary rounded-2xl", className)}>
      <h3 className="font-display font-semibold text-text-primary mb-6">
        Comment ça marche ?
      </h3>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center text-lg">
              {step.icon}
            </div>
            <div className="flex-1 pt-1">
              <p className="font-medium text-text-primary">{step.title}</p>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className="absolute left-[19px] top-12 w-0.5 h-8 bg-bg-tertiary" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
