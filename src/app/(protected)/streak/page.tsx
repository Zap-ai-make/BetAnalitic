"use client"

/**
 * Epic 11 Story 11.6: Streak Tracking
 * View streak details and history
 */

import * as React from "react"
import {
  Flame,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Zap,
  Award,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { StreakDisplay, StreakCelebration } from "~/components/features/gamification/StreakDisplay"

export default function StreakPage() {
  const router = useRouter()
  const [showCelebration, setShowCelebration] = React.useState(false)
  const [celebrationStreak, setCelebrationStreak] = React.useState(0)

  // Query
  const { data: streak } = api.streak.getMyStreak.useQuery()

  // Mutation
  const incrementMutation = api.streak.incrementStreak.useMutation({
    onSuccess: (data) => {
      if (data.streakIncremented) {
        setCelebrationStreak(data.currentStreak)
        setShowCelebration(true)
      }
    },
  })

  const handleIncrementStreak = async () => {
    try {
      await incrementMutation.mutateAsync()
    } catch (error) {
      console.error("Failed to increment streak:", error)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Celebration Animation */}
      <StreakCelebration
        streak={celebrationStreak}
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-accent-orange/10 to-accent-red/10 border-b border-bg-tertiary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-accent-orange" />
            <h1 className="text-3xl font-display font-bold text-text-primary">
              Séries Quotidiennes
            </h1>
          </div>
          <p className="text-text-secondary">
            Maintenez votre série active en vous connectant chaque jour
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Main Streak Display */}
        <StreakDisplay variant="full" />

        {/* Streak Info */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Comment ça marche ?
          </h2>
          <div className="space-y-4">
            <InfoItem
              icon={Calendar}
              title="Connexion quotidienne"
              description="Connectez-vous chaque jour pour maintenir votre série"
              color="text-accent-cyan"
            />
            <InfoItem
              icon={Flame}
              title="Série active"
              description="Votre série augmente d'un jour chaque fois que vous vous connectez"
              color="text-accent-orange"
            />
            <InfoItem
              icon={Zap}
              title="Récompenses"
              description="Gagnez des points bonus aux jalons : 3, 7, 14, 30, 60, et 100 jours"
              color="text-accent-purple"
            />
            <InfoItem
              icon={Award}
              title="Record personnel"
              description="Battez votre record et débloquez des succès exclusifs"
              color="text-accent-gold"
            />
          </div>
        </div>

        {/* Streak Tips */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">
            Conseils pour maintenir votre série
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent-green mt-0.5">✓</span>
              <span>Activez les notifications pour ne jamais oublier de vous connecter</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent-green mt-0.5">✓</span>
              <span>Définissez un rappel quotidien à la même heure chaque jour</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent-green mt-0.5">✓</span>
              <span>Faites un pronostic rapide pour maintenir votre série</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-accent-green mt-0.5">✓</span>
              <span>Consultez vos analyses pour rester engagé quotidiennement</span>
            </li>
          </ul>
        </div>

        {/* Stats Overview */}
        {streak && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Série actuelle"
              value={streak.currentStreak}
              icon={Flame}
              color="text-accent-orange"
              bg="bg-accent-orange/20"
            />
            <StatCard
              label="Record personnel"
              value={streak.longestStreak}
              icon={TrendingUp}
              color="text-accent-purple"
              bg="bg-accent-purple/20"
            />
          </div>
        )}

        {/* Test Button (Development only - remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={handleIncrementStreak}
            disabled={incrementMutation.isPending || !streak?.canIncrementToday}
            className="w-full p-4 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {incrementMutation.isPending
              ? "Incrémentation..."
              : !streak?.canIncrementToday
              ? "Déjà incrémenté aujourd'hui"
              : "Tester l'incrémentation (Dev uniquement)"
            }
          </button>
        )}
      </div>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

function InfoItem({ icon: Icon, title, description, color }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0")}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-text-primary text-sm mb-1">{title}</h3>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <p className={cn("text-3xl font-display font-bold", color)}>{value}</p>
      <p className="text-xs text-text-tertiary mt-1">{label}</p>
    </div>
  )
}
