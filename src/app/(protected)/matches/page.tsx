"use client"

import { useState } from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { MatchCard } from "~/components/features/match/MatchCard"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

export default function MatchesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [competitionFilter] = useState<string | null>(null)
  const [liveOnly, setLiveOnly] = useState(false)

  // Calculate date range (7 days from selected date)
  const fromDate = new Date(selectedDate)
  fromDate.setHours(0, 0, 0, 0)
  const toDate = new Date(selectedDate)
  toDate.setDate(toDate.getDate() + 7)
  toDate.setHours(23, 59, 59, 999)

  const { data: matches, isLoading } = api.match.getMatchesByDateRange.useQuery({
    from: fromDate,
    to: toDate,
    competitionIds: competitionFilter ? [competitionFilter] : undefined,
  })

  const { data: liveMatches } = api.match.getLiveMatches.useQuery(undefined, {
    enabled: liveOnly,
  })

  const displayMatches = liveOnly ? liveMatches : matches

  // Group by date
  const groupedByDate = displayMatches?.reduce((acc, match) => {
    const date = match.kickoffTime.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(match)
    return acc
  }, {} as Record<string, typeof displayMatches>)

  const dates = groupedByDate ? Object.keys(groupedByDate) : []

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary p-4">
        <div className="space-y-3">
          <h1 className="font-display text-xl font-bold text-text-primary">
            Matchs
          </h1>

          <div className="flex gap-2 overflow-x-auto">
            {/* Live Toggle */}
            <button
              onClick={() => setLiveOnly(!liveOnly)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                liveOnly
                  ? "bg-accent-red text-white"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              {liveOnly && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />}
              Live
            </button>

            {/* Date Quick Filters */}
            <button
              onClick={() => setSelectedDate(new Date())}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                selectedDate.toDateString() === new Date().toDateString()
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Aujourd&apos;hui
            </button>

            <button
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                setSelectedDate(tomorrow)
              }}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-bg-tertiary text-text-secondary"
            >
              Demain
            </button>

            <button
              onClick={() => {
                const weekend = new Date()
                weekend.setDate(weekend.getDate() + (6 - weekend.getDay()))
                setSelectedDate(weekend)
              }}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-bg-tertiary text-text-secondary"
            >
              Week-end
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-bg-tertiary rounded w-1/3 animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="bg-bg-secondary rounded-xl p-4 animate-pulse h-32"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!displayMatches || displayMatches.length === 0) && (
          <div className="text-center py-12">
            <span className="text-6xl">⚽</span>
            <p className="text-text-secondary mt-4">
              {liveOnly
                ? "Aucun match en direct"
                : "Aucun match trouvé pour cette période"}
            </p>
            {liveOnly && (
              <button
                onClick={() => setLiveOnly(false)}
                className="mt-4 text-accent-cyan text-sm hover:underline"
              >
                Voir tous les matchs
              </button>
            )}
          </div>
        )}

        {/* Matches List Grouped by Date */}
        {!isLoading && groupedByDate && dates.length > 0 && (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date} className="space-y-3">
                <h2 className="font-display font-semibold text-text-primary sticky top-0 bg-bg-primary py-2">
                  {date}
                </h2>
                <div className="space-y-3">
                  {groupedByDate[date]?.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={{
                        id: match.id,
                        homeTeam: match.homeTeam.name,
                        awayTeam: match.awayTeam.name,
                        homeScore: match.homeScore ?? undefined,
                        awayScore: match.awayScore ?? undefined,
                        time: match.kickoffTime.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        league: match.competition.name,
                        status: match.status === "LIVE" || match.status === "HALFTIME"
                          ? "live"
                          : match.status === "FINISHED"
                          ? "finished"
                          : "upcoming",
                        analysisCount: match.analysisCount,
                        tags: match.tags.map((t) => t.tag),
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DashboardNav />
    </div>
  )
}
