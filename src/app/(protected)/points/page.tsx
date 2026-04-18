"use client"

/**
 * Epic 11 Story 11.3: Gamification Points System
 * Points history and details page
 */

import * as React from "react"
import {
  Trophy,
  TrendingUp,
  User,
  Share2,
  Target,
  Users,
  ArrowLeft,
  Gift,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { PointsDisplay, PointsAnimation } from "~/components/features/gamification/PointsDisplay"

const ACTION_CONFIG = {
  DAILY_LOGIN: { icon: Calendar, color: "text-accent-cyan", bg: "bg-accent-cyan/20", label: "Connexion quotidienne" },
  AGENT_INVOCATION: { icon: User, color: "text-accent-purple", bg: "bg-accent-purple/20", label: "Invocation agent" },
  SHARE_ANALYSIS: { icon: Share2, color: "text-accent-orange", bg: "bg-accent-orange/20", label: "Partage analyse" },
  CORRECT_PREDICTION: { icon: Target, color: "text-accent-green", bg: "bg-accent-green/20", label: "Pronostic correct" },
  SUCCESSFUL_REFERRAL: { icon: Users, color: "text-accent-gold", bg: "bg-accent-gold/20", label: "Parrainage réussi" },
  LEVEL_UP: { icon: Trophy, color: "text-accent-gold", bg: "bg-accent-gold/20", label: "Passage de niveau" },
  MANUAL_ADJUSTMENT: { icon: TrendingUp, color: "text-text-secondary", bg: "bg-bg-tertiary", label: "Ajustement manuel" },
  REWARD_REDEMPTION: { icon: Gift, color: "text-accent-red", bg: "bg-accent-red/20", label: "Échange récompense" },
} as const

export default function PointsPage() {
  const router = useRouter()
  const [showAnimation, setShowAnimation] = React.useState(false)
  const [animationPoints, setAnimationPoints] = React.useState(0)

  // Queries
  const { data: stats } = api.gamification.getMyStats.useQuery()
  const { data: history } = api.gamification.getPointsHistory.useQuery({
    limit: 50,
    offset: 0,
  })

  // Mutations
  const claimDailyMutation = api.gamification.claimDailyLogin.useMutation({
    onSuccess: (data) => {
      setAnimationPoints(data.pointsAwarded + data.levelUpBonus)
      setShowAnimation(true)
      // Refetch stats to update UI
      void stats
    },
  })

  const handleClaimDaily = async () => {
    try {
      await claimDailyMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to claim daily reward:", error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Points Animation */}
      <PointsAnimation
        points={animationPoints}
        show={showAnimation}
        onComplete={() => setShowAnimation(false)}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-accent-gold/10 to-accent-orange/10 border-b border-bg-tertiary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-accent-gold" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Mes Points
            </h1>
          </div>
          <p className="text-text-secondary">
            Gagnez des points en participant activement à la plateforme
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Points Display */}
        <PointsDisplay variant="full" />

        {/* Daily Login Button (if available) */}
        {stats?.canClaimDaily && (
          <button
            onClick={handleClaimDaily}
            disabled={claimDailyMutation.isPending}
            className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-accent-green/20 to-accent-cyan/20 border-2 border-accent-green/30 rounded-2xl hover:border-accent-green/50 transition-all min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-accent-green" />
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-lg text-text-primary">
                  Récompense quotidienne
                </p>
                <p className="text-sm text-text-secondary">
                  Connectez-vous chaque jour pour gagner des points
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-accent-green">+10</p>
              <p className="text-xs text-text-tertiary">points</p>
            </div>
          </button>
        )}

        {/* How to Earn Points */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Comment gagner des points ?
          </h2>
          <div className="space-y-3">
            <ActionItem icon={Calendar} label="Connexion quotidienne" points={10} color="text-accent-cyan" />
            <ActionItem icon={User} label="Invocation d'agent IA" points={25} color="text-accent-purple" />
            <ActionItem icon={Share2} label="Partage d'analyse" points={50} color="text-accent-orange" />
            <ActionItem icon={Target} label="Pronostic correct" points={100} color="text-accent-green" />
            <ActionItem icon={Users} label="Parrainage réussi" points={200} color="text-accent-gold" />
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Historique des points
          </h2>

          {history && history.transactions.length > 0 ? (
            <div className="space-y-2">
              {history.transactions.map((transaction) => {
                const config = ACTION_CONFIG[transaction.actionType]
                const Icon = config.icon
                const isPositive = transaction.points > 0

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-xl hover:bg-bg-primary transition-colors"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary text-sm">
                        {transaction.description ?? config.label}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {transaction.createdAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "font-display font-bold text-lg",
                        isPositive ? "text-accent-green" : "text-accent-red"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {transaction.points}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">
                Aucune transaction pour le moment
              </p>
              <p className="text-sm text-text-tertiary mt-2">
                Commencez à gagner des points en utilisant la plateforme
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ActionItemProps {
  icon: React.ElementType
  label: string
  points: number
  color: string
}

function ActionItem({ icon: Icon, label, points, color }: ActionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl">
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-text-primary text-sm">{label}</span>
      </div>
      <span className={cn("font-display font-bold", color)}>+{points}</span>
    </div>
  )
}
