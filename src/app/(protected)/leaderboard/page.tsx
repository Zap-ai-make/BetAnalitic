"use client"

/**
 * Epic 11 Story 11.4: Leaderboards & Rankings
 * Global leaderboards with rankings and filters
 */

import * as React from "react"
import {
  Trophy,
  Medal,
  TrendingUp,
  ArrowLeft,
  Crown,
  Award,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

type LeaderboardType = "points" | "level" | "lifetime"
type Timeframe = "weekly" | "monthly" | "all-time"

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboardType, setLeaderboardType] = React.useState<LeaderboardType>("points")
  const [timeframe, setTimeframe] = React.useState<Timeframe>("all-time")
  const currentUserRef = React.useRef<HTMLDivElement>(null)

  // Query leaderboard
  const { data, isLoading } = api.gamification.getLeaderboard.useQuery({
    type: leaderboardType,
    timeframe,
    limit: 100,
  })

  const handleJumpToRank = () => {
    currentUserRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-gold/10 via-accent-orange/10 to-accent-purple/10 border-b border-bg-tertiary">
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
              Classements
            </h1>
          </div>
          <p className="text-text-secondary">
            Comparez vos performances avec les meilleurs joueurs
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary p-4 space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Type de classement
            </label>
            <div className="flex gap-2">
              <FilterButton
                active={leaderboardType === "points"}
                onClick={() => setLeaderboardType("points")}
                icon={Trophy}
                label="Points"
              />
              <FilterButton
                active={leaderboardType === "level"}
                onClick={() => setLeaderboardType("level")}
                icon={Crown}
                label="Niveau"
              />
              <FilterButton
                active={leaderboardType === "lifetime"}
                onClick={() => setLeaderboardType("lifetime")}
                icon={Zap}
                label="Total"
              />
            </div>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Période
            </label>
            <div className="flex gap-2">
              <TimeButton
                active={timeframe === "weekly"}
                onClick={() => setTimeframe("weekly")}
                label="Semaine"
              />
              <TimeButton
                active={timeframe === "monthly"}
                onClick={() => setTimeframe("monthly")}
                label="Mois"
              />
              <TimeButton
                active={timeframe === "all-time"}
                onClick={() => setTimeframe("all-time")}
                label="Tous temps"
              />
            </div>
          </div>
        </div>

        {/* Jump to My Rank Button */}
        {data && data.currentUserRank > 10 && (
          <button
            onClick={handleJumpToRank}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-cyan text-bg-primary rounded-xl font-semibold hover:bg-accent-cyan/80 transition-colors min-h-[48px]"
          >
            <TrendingUp className="w-5 h-5" />
            Voir mon classement (#{data.currentUserRank})
          </button>
        )}

        {/* Leaderboard */}
        <div className="bg-bg-secondary rounded-2xl border border-bg-tertiary overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-bg-tertiary">
            <h2 className="font-display font-bold text-lg text-text-primary">
              Top {data?.leaderboard.length ?? 100}
            </h2>
            <p className="text-sm text-text-tertiary">
              {data?.totalUsers.toLocaleString()} joueurs au total
            </p>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Chargement...</p>
            </div>
          ) : data && data.leaderboard.length > 0 ? (
            <div className="divide-y divide-bg-tertiary">
              {data.leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  ref={entry.isCurrentUser ? currentUserRef : undefined}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-bg-primary transition-colors",
                    entry.isCurrentUser && "bg-accent-cyan/10 border-l-4 border-accent-cyan"
                  )}
                >
                  {/* Rank Badge */}
                  <div className="w-12 flex items-center justify-center">
                    {entry.rank === 1 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold to-accent-orange flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    ) : entry.rank === 2 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <Medal className="w-6 h-6 text-white" />
                      </div>
                    ) : entry.rank === 3 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <span className="text-xl font-display font-bold text-text-tertiary">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-bg-tertiary"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan font-bold text-lg">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-semibold truncate",
                      entry.isCurrentUser ? "text-accent-cyan" : "text-text-primary"
                    )}>
                      {entry.displayName}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-accent-cyan">(Vous)</span>
                      )}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      @{entry.username}
                    </p>
                  </div>

                  {/* Level Badge */}
                  <div className="hidden md:block">
                    <div className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-sm font-semibold">
                      Niv. {entry.level}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-accent-gold">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {leaderboardType === "points" && "points"}
                      {leaderboardType === "level" && "niveau"}
                      {leaderboardType === "lifetime" && "total"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">
                Aucun classement disponible
              </p>
            </div>
          )}
        </div>

        {/* User Position Summary */}
        {data && (
          <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-2xl border border-accent-cyan/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-tertiary mb-1">Votre position</p>
                <p className="text-3xl font-display font-bold text-text-primary">
                  #{data.currentUserRank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-tertiary mb-1">Sur</p>
                <p className="text-3xl font-display font-bold text-text-primary">
                  {data.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                style={{
                  width: `${Math.max(1, 100 - (data.currentUserRank / data.totalUsers) * 100)}%`,
                }}
              />
            </div>
            <p className="text-center text-xs text-text-tertiary mt-2">
              Top {((data.currentUserRank / data.totalUsers) * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}

function FilterButton({ active, onClick, icon: Icon, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all min-h-[48px]",
        active
          ? "bg-accent-cyan text-bg-primary"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}

interface TimeButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function TimeButton({ active, onClick, label }: TimeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-2 rounded-xl font-semibold transition-all text-sm min-h-[40px]",
        active
          ? "bg-accent-purple text-white"
          : "bg-bg-tertiary text-text-secondary hover:bg-bg-primary hover:text-text-primary"
      )}
    >
      {label}
    </button>
  )
}
