"use client"

/**
 * Live Mode Page
 * Story 7.3: Dedicated Live Mode interface for real-time match tracking
 */

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, TrendingUp } from "lucide-react"
import { api } from "~/trpc/react"
import { useLiveModeStore } from "~/stores/liveMode"
import { useLiveRefresh } from "~/hooks/useLiveRefresh"
import { LiveModeToggle } from "~/components/features/live/LiveModeToggle"
import { LiveRefreshIndicator } from "~/components/features/live/LiveRefreshIndicator"

export default function LiveModePage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string

  const { isMatchLive } = useLiveModeStore()
  const isActive = isMatchLive(matchId)

  const matchQuery = api.match.getById.useQuery(
    { matchId },
    { enabled: !!matchId }
  )

  const { isRefreshing, lastRefresh, nextRefreshIn } = useLiveRefresh({
    matchId,
    onRefresh: async () => {
      await matchQuery.refetch()
    },
    enabled: isActive,
  })

  if (!matchQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-text-tertiary">Chargement...</div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const match = matchQuery.data as {
    homeTeam: string
    awayTeam: string
    homeScore?: number
    awayScore?: number
    status: string
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <LiveModeToggle matchId={matchId} isMatchLive={match.status === "LIVE"} />
        </div>
      </header>

      {/* Live Score */}
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border-b border-accent-cyan/20 p-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex-1 text-right">
            <h2 className="font-display text-lg font-bold text-text-primary truncate">
              {match.homeTeam}
            </h2>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-bg-secondary/50 backdrop-blur-sm rounded-xl border border-accent-cyan/30">
            <span className="font-display text-3xl font-bold text-accent-cyan">
              {match.homeScore ?? 0}
            </span>
            <span className="text-text-tertiary">-</span>
            <span className="font-display text-3xl font-bold text-accent-purple">
              {match.awayScore ?? 0}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-text-primary truncate">
              {match.awayTeam}
            </h2>
          </div>
        </div>
      </div>

      {/* Refresh Indicator */}
      {isActive && (
        <div className="flex justify-center py-3 bg-bg-secondary/50">
          <LiveRefreshIndicator
            isRefreshing={isRefreshing}
            lastRefresh={lastRefresh}
            nextRefreshIn={nextRefreshIn}
          />
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Recent Events Timeline */}
        <section className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
          <h3 className="font-display font-bold text-base text-text-primary mb-3">
            Événements récents
          </h3>
          <div className="space-y-2">
            <div className="text-sm text-text-tertiary text-center py-4">
              Timeline à venir (Story 7.5)
            </div>
          </div>
        </section>

        {/* LivePulse Commentary */}
        <section className="bg-gradient-to-br from-agent-livepulse/10 to-agent-livepulse/5 rounded-xl p-4 border border-agent-livepulse/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-agent-livepulse flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-bg-primary" />
            </div>
            <h3 className="font-display font-bold text-base text-text-primary">
              LivePulse
            </h3>
          </div>
          <div className="text-sm text-text-tertiary">
            Commentaires en temps réel à venir...
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-semibold text-text-secondary">
                Analysent ce match
              </span>
            </div>
            <span className="text-sm font-bold text-accent-cyan">142 personnes</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Over 2.5 buts</span>
              <span className="font-bold text-text-primary">78%</span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-accent-cyan rounded-full w-[78%]" />
            </div>
          </div>
        </section>

        {/* Mini Predictions */}
        <section className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary">
          <h3 className="font-display font-bold text-base text-text-primary mb-3">
            Mini-Prédiction
          </h3>
          <div className="text-sm text-text-tertiary text-center py-2">
            Gamification à venir (Story 7.5)
          </div>
        </section>
      </main>
    </div>
  )
}
