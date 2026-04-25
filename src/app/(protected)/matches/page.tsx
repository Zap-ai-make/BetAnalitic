"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { MatchCard } from "~/components/features/match/MatchCard"
import { BetSlip } from "~/components/features/betting/BetSlip"
import { MatchBettingCard } from "~/components/features/betting/MatchBettingCard"
import { cn } from "~/lib/utils"
import { ChevronDown, Calendar, Search, X, Brain, TrendingUp } from "lucide-react"

type StatusFilter = "all" | "upcoming" | "live" | "finished"
type PageMode = "analyse" | "paris"

interface VpsMatch {
  match_id: string
  home_team: string
  away_team: string
  competition: string
  date_iso: string
  status: string
  odds: { "1": number | null; X: number | null; "2": number | null }
}

function vpsStatusToCard(status: string): "live" | "upcoming" | "finished" {
  if (status === "inprogress" || status === "halftime") return "live"
  if (status === "final" || status === "finished" || status === "ft") return "finished"
  return "upcoming"
}

export default function MatchesPage() {
  const [mode, setMode] = useState<PageMode>("analyse")
  const [vpsMatches, setVpsMatches] = useState<VpsMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [competitionFilter, setCompetitionFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCompetitions, setShowCompetitions] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)

  const loadVpsMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const days = 7
      const res = await fetch(`/api/beta/matches?days=${days}`)
      if (res.status === 403) {
        setError("Compte BetAnalytic non lié. Reconnectez-vous.")
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { matches_by_competition?: Record<string, VpsMatch[]> }
      setVpsMatches(Object.values(data.matches_by_competition ?? {}).flat())
    } catch {
      setError("Impossible de charger les matchs. Vérifiez votre connexion.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVpsMatches()
  }, [loadVpsMatches])

  // Derive competitions from VPS data
  const competitions = useMemo(() => {
    const seen = new Set<string>()
    return vpsMatches
      .map((m) => m.competition)
      .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true })
      .sort()
  }, [vpsMatches])

  // Filter matches
  const filteredMatches = useMemo(() => {
    const selDateStr = selectedDate.toDateString()
    return vpsMatches.filter((m) => {
      // Date filter
      const matchDate = new Date(m.date_iso)
      if (matchDate.toDateString() !== selDateStr) return false

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !m.home_team.toLowerCase().includes(q) &&
          !m.away_team.toLowerCase().includes(q) &&
          !m.competition.toLowerCase().includes(q)
        ) return false
      }

      // Competition filter
      if (competitionFilter && m.competition !== competitionFilter) return false

      // Status filter
      if (statusFilter !== "all") {
        const cardStatus = vpsStatusToCard(m.status)
        if (cardStatus !== statusFilter) return false
      }

      return true
    })
  }, [vpsMatches, selectedDate, searchQuery, competitionFilter, statusFilter])

  // Group by competition
  const grouped = useMemo(() => {
    return filteredMatches.reduce<Record<string, VpsMatch[]>>((acc, m) => {
      if (!acc[m.competition]) acc[m.competition] = []
      acc[m.competition]!.push(m)
      return acc
    }, {})
  }, [filteredMatches])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (competitionFilter) count++
    if (statusFilter !== "all") count++
    if (searchQuery.trim()) count++
    if (selectedDate.toDateString() !== new Date().toDateString()) count++
    return count
  }, [competitionFilter, statusFilter, searchQuery, selectedDate])

  const clearFilters = () => {
    setCompetitionFilter(null)
    setStatusFilter("all")
    setSearchQuery("")
    setSelectedDate(new Date())
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Mode Toggle */}
      <div className="flex border-b border-bg-tertiary">
        <button
          onClick={() => setMode("analyse")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
            mode === "analyse" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-tertiary"
          )}
        >
          <Brain className="w-4 h-4" />
          Analyse
        </button>
        <button
          onClick={() => setMode("paris")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
            mode === "paris" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-tertiary"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Paris
        </button>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-text-primary">Matchs</h1>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-cyan/80"
              >
                <X className="h-4 w-4" />
                Effacer filtres ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une équipe, compétition..."
              className={cn(
                "w-full pl-10 pr-10 py-3 rounded-xl bg-bg-secondary",
                "text-text-primary placeholder:text-text-tertiary",
                "border border-bg-tertiary focus:border-accent-cyan",
                "focus:outline-none transition-colors"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Status Filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2",
                  statusFilter !== "all"
                    ? "bg-accent-cyan text-bg-primary"
                    : "bg-bg-tertiary text-text-secondary"
                )}
              >
                {statusFilter === "live" && (
                  <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                {statusFilter === "all" ? "Statut" :
                 statusFilter === "live" ? "Live" :
                 statusFilter === "upcoming" ? "À venir" : "Terminés"}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showStatusFilter && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusFilter(false)} />
                  <div className="absolute top-full left-0 mt-2 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-20 min-w-[150px]">
                    {([
                      { value: "all", label: "Tous" },
                      { value: "live", label: "Live" },
                      { value: "upcoming", label: "À venir" },
                      { value: "finished", label: "Terminés" },
                    ] as const).map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setStatusFilter(s.value); setShowStatusFilter(false) }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors",
                          statusFilter === s.value ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-primary"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Competition Filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowCompetitions(!showCompetitions)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2",
                  competitionFilter
                    ? "bg-accent-cyan text-bg-primary"
                    : "bg-bg-tertiary text-text-secondary"
                )}
              >
                {competitionFilter ?? "Compétition"}
                <ChevronDown className="h-4 w-4" />
              </button>

              {showCompetitions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCompetitions(false)} />
                  <div className="absolute top-full left-0 mt-2 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                    <button
                      onClick={() => { setCompetitionFilter(null); setShowCompetitions(false) }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors text-text-primary"
                    >
                      Toutes les compétitions
                    </button>
                    {competitions.map((comp) => (
                      <button
                        key={comp}
                        onClick={() => { setCompetitionFilter(comp); setShowCompetitions(false) }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors",
                          competitionFilter === comp
                            ? "bg-accent-cyan/10 text-accent-cyan"
                            : "text-text-primary"
                        )}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Date Quick Filters */}
            <button
              onClick={() => setSelectedDate(new Date())}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0",
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
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-bg-tertiary text-text-secondary shrink-0"
            >
              Demain
            </button>

            <button
              onClick={() => {
                const weekend = new Date()
                weekend.setDate(weekend.getDate() + (6 - weekend.getDay()))
                setSelectedDate(weekend)
              }}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-bg-tertiary text-text-secondary shrink-0"
            >
              Week-end
            </button>

            <button
              onClick={() => {
                const dateInput = document.createElement("input")
                dateInput.type = "date"
                dateInput.value = selectedDate.toISOString().split("T")[0]!
                dateInput.onchange = (e) => {
                  const target = e.target as HTMLInputElement
                  if (target.value) setSelectedDate(new Date(target.value + "T12:00:00"))
                }
                dateInput.click()
              }}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-bg-tertiary text-text-secondary shrink-0 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Date
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
            <button onClick={() => void loadVpsMatches()} className="ml-2 underline">
              Réessayer
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-bg-secondary rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMatches.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl">⚽</span>
            <p className="text-text-secondary mt-4">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : statusFilter === "live"
                ? "Aucun match en direct"
                : "Aucun match pour cette période"}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-medium"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* Matches grouped by competition */}
        {!loading && !error && Object.entries(grouped).map(([competition, compMatches]) => (
          <div key={competition} className="mb-6 space-y-3">
            <h2 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wide">
              {competition}
            </h2>

            {mode === "analyse" && compMatches.map((m) => {
              const cardStatus = vpsStatusToCard(m.status)
              const matchDate = new Date(m.date_iso)
              return (
                <MatchCard
                  key={m.match_id}
                  match={{
                    id: m.match_id,
                    homeTeam: m.home_team,
                    awayTeam: m.away_team,
                    league: m.competition,
                    time: matchDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                    status: cardStatus,
                    analysisCount: 0,
                  }}
                />
              )
            })}

            {mode === "paris" && compMatches.map((m) => (
              <MatchBettingCard key={m.match_id} match={m} />
            ))}
          </div>
        ))}
      </main>

      <BetSlip />
      <DashboardNav />
    </div>
  )
}
