"use client"

/**
 * Epic 11 Story 11.1: Referral Code Generation & Sharing
 * User referral and rewards page
 */

import * as React from "react"
import {
  Share2,
  Copy,
  Users,
  Gift,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function ParrainagePage() {
  const [copied, setCopied] = React.useState(false)

  // Queries
  const { data: referralData, isLoading: isLoadingCode } = api.referral.getMyReferralCode.useQuery()
  const { data: stats, isLoading: isLoadingStats } = api.referral.getReferralStats.useQuery()

  // Mutations
  const incrementShareMutation = api.referral.incrementShareCount.useMutation()

  const handleCopyLink = async () => {
    if (!referralData?.shareableLink) return

    try {
      await navigator.clipboard.writeText(referralData.shareableLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = async () => {
    if (!referralData?.shareableLink) return

    // Increment share count
    try {
      await incrementShareMutation.mutateAsync()
    } catch (err) {
      console.error("Failed to increment share count:", err)
    }

    const shareData = {
      title: "Rejoins-moi sur BetAnalytic !",
      text: "Découvre BetAnalytic, la plateforme d'analyse sportive et de pronostics. Inscris-toi avec mon code et reçois 50 crédits gratuits !",
      url: referralData.shareableLink,
    }

    // Use native share if available
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      // Fallback to copy
      await handleCopyLink()
    }
  }

  if (isLoadingCode || isLoadingStats) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border-b border-bg-tertiary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-accent-cyan" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Parrainage
            </h1>
          </div>
          <p className="text-text-secondary">
            Invitez vos amis et gagnez des récompenses ensemble
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Referral Code Card */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Votre code de parrainage
          </h2>

          <div className="bg-bg-primary rounded-xl p-4 mb-4">
            <p className="text-xs text-text-tertiary mb-2">Code de parrainage</p>
            <p className="text-3xl font-display font-bold text-accent-cyan tracking-wider mb-4">
              {referralData?.code ?? "XXXXXXXX"}
            </p>
            <p className="text-xs text-text-tertiary mb-2">Lien de partage</p>
            <p className="text-sm text-text-secondary break-all font-mono">
              {referralData?.shareableLink ?? "https://betanalytic.app/ref/XXXXXXXX"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg-tertiary text-text-primary rounded-xl font-semibold hover:bg-bg-primary transition-colors min-h-[44px]"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-accent-green" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
            >
              <Share2 className="w-5 h-5" />
              <span>Partager</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Invitations"
            value={stats?.shareCount ?? 0}
            iconColor="text-accent-cyan"
            iconBg="bg-accent-cyan/20"
          />
          <StatCard
            icon={TrendingUp}
            label="Inscriptions"
            value={stats?.totalReferrals ?? 0}
            iconColor="text-accent-purple"
            iconBg="bg-accent-purple/20"
          />
          <StatCard
            icon={CheckCircle2}
            label="Actifs"
            value={stats?.activeReferrals ?? 0}
            iconColor="text-accent-green"
            iconBg="bg-accent-green/20"
          />
          <StatCard
            icon={Gift}
            label="Récompenses"
            value={stats?.pendingRewards ?? 0}
            subtitle="En attente"
            iconColor="text-accent-gold"
            iconBg="bg-accent-gold/20"
          />
        </div>

        {/* How it Works */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            <Step
              number={1}
              title="Partagez votre code"
              description="Envoyez votre lien de parrainage à vos amis"
            />
            <Step
              number={2}
              title="Vos amis s'inscrivent"
              description="Ils reçoivent 50 crédits gratuits à l'inscription"
            />
            <Step
              number={3}
              title="Gagnez des récompenses"
              description="Recevez 100 crédits ou 1 mois gratuit quand ils s'abonnent"
            />
          </div>
        </div>

        {/* Referral List */}
        {stats && stats.referrals.length > 0 && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-4">
              Vos parrainages ({stats.totalReferrals})
            </h2>
            <div className="space-y-3">
              {stats.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold">
                    {referral.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">
                      {referral.displayName}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Inscrit le {referral.convertedAt?.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.status === "ACTIVE" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-accent-green/20 text-accent-green rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Actif
                      </span>
                    )}
                    {referral.status === "PENDING" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-accent-orange/20 text-accent-orange rounded-full text-xs font-semibold">
                        <Clock className="w-3 h-3" />
                        En attente
                      </span>
                    )}
                    {referral.status === "CHURNED" && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-bg-primary text-text-tertiary rounded-full text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Inactif
                      </span>
                    )}
                    {referral.rewardGiven && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-xs font-semibold">
                        <Gift className="w-3 h-3" />
                        {referral.rewardAmount}€
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.referrals.length === 0 && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-12 text-center">
            <ExternalLink className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="font-display font-bold text-lg text-text-primary mb-2">
              Aucun parrainage pour le moment
            </h3>
            <p className="text-text-secondary mb-6">
              Commencez à inviter vos amis pour gagner des récompenses
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Partager mon code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  iconColor: string
  iconBg: string
}

function StatCard({ icon: Icon, label, value, subtitle, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
      {subtitle && <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>}
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  description: string
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="font-semibold text-text-primary mb-1">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  )
}
