"use client"

/**
 * Epic 10 Story 10.3: Verified Expert Badge
 * Shows verified expert status throughout the app
 */

import * as React from "react"
import { Crown, CheckCircle2, TrendingUp, Users } from "lucide-react"
import { cn } from "~/lib/utils"

interface VerifiedExpertBadgeProps {
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
  onClick?: () => void
}

export function VerifiedExpertBadge({
  size = "sm",
  showLabel = false,
  className,
  onClick,
}: VerifiedExpertBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const labelSizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold",
          "bg-gradient-to-r from-accent-gold to-accent-orange text-bg-primary",
          "transition-all",
          onClick && "hover:shadow-lg hover:scale-105 cursor-pointer",
          labelSizeClasses[size],
          className
        )}
      >
        <Crown className={sizeClasses[size]} />
        <span>Expert Vérifié</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title="Expert Vérifié"
      className={cn(
        "inline-flex items-center justify-center",
        "text-accent-gold",
        onClick && "hover:scale-110 cursor-pointer transition-transform",
        className
      )}
    >
      <Crown className={sizeClasses[size]} />
    </button>
  )
}

/**
 * Expert Info Card - Shows on badge click
 */
interface ExpertInfoCardProps {
  expertProfile: {
    expertiseAreas: string[]
    followerCount: number
    subscriberCount: number
    contentCount: number
    verifiedAt: Date
  }
  onClose: () => void
}

export function ExpertInfoCard({ expertProfile, onClose }: ExpertInfoCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-secondary rounded-2xl shadow-2xl border border-accent-gold/30 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-gold to-accent-orange flex items-center justify-center">
                <Crown className="w-6 h-6 text-bg-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">
                  Expert Vérifié
                </h3>
                <p className="text-xs text-text-tertiary">
                  Depuis {expertProfile.verifiedAt.toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-bg-tertiary rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
              <p className="text-lg font-display font-bold text-text-primary">
                {expertProfile.followerCount}
              </p>
              <p className="text-xs text-text-tertiary">Abonnés</p>
            </div>
            <div className="bg-bg-tertiary rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-accent-green mx-auto mb-1" />
              <p className="text-lg font-display font-bold text-text-primary">
                {expertProfile.subscriberCount}
              </p>
              <p className="text-xs text-text-tertiary">Payants</p>
            </div>
            <div className="bg-bg-tertiary rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-accent-purple mx-auto mb-1" />
              <p className="text-lg font-display font-bold text-text-primary">
                {expertProfile.contentCount}
              </p>
              <p className="text-xs text-text-tertiary">Contenus</p>
            </div>
          </div>

          {/* Expertise Areas */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 text-sm">
              Domaines d&apos;expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {expertProfile.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-xs font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
