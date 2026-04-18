"use client"

/**
 * Epic 11 Story 11.7: Prediction Contests
 * Contest detail and participation page
 */

import * as React from "react"
import {
  Trophy,
  Calendar,
  Users,
  Coins,
  ArrowLeft,
  Medal,
  Target,
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function ContestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const contestId = params?.contestId as string

  const [activeTab, setActiveTab] = React.useState<"overview" | "leaderboard" | "prizes">("overview")

  // Queries
  const { data: contest, isLoading } = api.contests.getContest.useQuery(
    { contestId },
    { enabled: !!contestId }
  )

  const { data: leaderboard } = api.contests.getContestLeaderboard.useQuery(
    { contestId, limit: 50 },
    { enabled: !!contestId && activeTab === "leaderboard" }
  )

  const { data: myPredictions } = api.contests.getMyPredictions.useQuery(
    { contestId },
    { enabled: !!contestId && contest?.isParticipating }
  )

  // Mutations
  const joinMutation = api.contests.joinContest.useMutation({
    onSuccess: () => {
      // Refetch contest to update participation status
    },
  })

  const claimPrizeMutation = api.contests.claimPrize.useMutation({
    onSuccess: () => {
      // Refetch contest
    },
  })

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ contestId })
    } catch (error) {
      console.error("Failed to join contest:", error)
    }
  }

  const handleClaimPrize = async () => {
    try {
      await claimPrizeMutation.mutateAsync({ contestId })
    } catch (error) {
      console.error("Failed to claim prize:", error)
    }
  }

  if (isLoading || !contest) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const matchIds = contest.matchIds as string[]
  const canClaim = contest.status === "COMPLETED" && contest.isParticipating && contest.userRank && !contest.isParticipating

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-gold/10 to-accent-purple/10 border-b border-bg-tertiary">
        <div className="max-w-5xl mx-auto px-4 py-8">
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
              {contest.name}
            </h1>
          </div>
          <p className="text-text-secondary">{contest.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Début" value={new Date(contest.startDate).toLocaleDateString("fr-FR")} />
          <StatCard icon={Calendar} label="Fin" value={new Date(contest.endDate).toLocaleDateString("fr-FR")} />
          <StatCard icon={Users} label="Participants" value={contest.participantCount.toString()} />
          <StatCard icon={Coins} label="Prix total" value={`${contest.prizePool} pts`} />
        </div>

        {/* Join Button */}
        {!contest.isParticipating && (contest.status === "UPCOMING" || contest.status === "ACTIVE") && (
          <button
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            className="w-full p-4 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {joinMutation.isPending ? "Inscription..." : `Rejoindre ${contest.entryFee > 0 ? `(${contest.entryFee} pts)` : "(Gratuit)"}`}
          </button>
        )}

        {/* Claim Prize Button */}
        {canClaim && (
          <button
            onClick={handleClaimPrize}
            disabled={claimPrizeMutation.isPending}
            className="w-full p-4 bg-accent-gold text-bg-primary rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {claimPrizeMutation.isPending ? "Réclamation..." : `Réclamer votre prix (Rang ${contest.userRank})`}
          </button>
        )}

        {/* My Progress */}
        {contest.isParticipating && myPredictions && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-4">
              Ma progression
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-bg-tertiary rounded-xl">
                <p className="text-2xl font-display font-bold text-accent-cyan">
                  {myPredictions.totalPoints}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Points gagnés</p>
              </div>
              <div className="text-center p-4 bg-bg-tertiary rounded-xl">
                <p className="text-2xl font-display font-bold text-accent-purple">
                  {myPredictions.predictions.length}/{matchIds.length}
                </p>
                <p className="text-xs text-text-tertiary mt-1">Pronostics</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              label="Aperçu"
            />
            <TabButton
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
              label="Classement"
            />
            <TabButton
              active={activeTab === "prizes"}
              onClick={() => setActiveTab("prizes")}
              label="Prix"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-4">
              Matchs inclus
            </h2>
            <p className="text-sm text-text-secondary">
              {matchIds.length} matchs à pronostiquer
            </p>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-gold" />
              Classement
            </h2>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl",
                      entry.isCurrentUser ? "bg-accent-cyan/10 border border-accent-cyan/30" : "bg-bg-tertiary"
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {entry.rank <= 3 ? (
                        <Medal className={cn(
                          "w-6 h-6",
                          entry.rank === 1 ? "text-accent-gold" :
                          entry.rank === 2 ? "text-gray-400" :
                          "text-amber-600"
                        )} />
                      ) : (
                        <span className="text-text-tertiary font-semibold">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">{entry.displayName}</p>
                      <p className="text-xs text-text-tertiary">Niveau {entry.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-accent-cyan">{entry.totalPoints}</p>
                      <p className="text-xs text-text-tertiary">points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-text-secondary">Aucun participant</p>
            )}
          </div>
        )}

        {activeTab === "prizes" && (
          <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-6">
            <h2 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-gold" />
              Récompenses
            </h2>
            {contest.prizes && contest.prizes.length > 0 ? (
              <div className="space-y-3">
                {contest.prizes.map((prize) => (
                  <div key={prize.id} className="flex items-center justify-between p-4 bg-bg-tertiary rounded-xl">
                    <div>
                      <p className="font-semibold text-text-primary">
                        {prize.rankStart === prize.rankEnd
                          ? `${prize.rankStart}${prize.rankStart === 1 ? "er" : "e"} place`
                          : `${prize.rankStart}e - ${prize.rankEnd}e places`
                        }
                      </p>
                    </div>
                    <p className="text-lg font-display font-bold text-accent-gold">
                      {prize.reward} pts
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-text-secondary">Aucun prix configuré</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 text-center">
      <Icon className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
      <p className="text-sm text-text-tertiary mb-1">{label}</p>
      <p className="font-display font-bold text-text-primary">{value}</p>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl font-semibold transition-all text-sm min-h-[40px]",
        active
          ? "bg-accent-cyan text-bg-primary"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
      )}
    >
      {label}
    </button>
  )
}
