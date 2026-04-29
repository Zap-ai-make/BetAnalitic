"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { cn } from "~/lib/utils"
import { useCouponStore } from "~/lib/stores/couponStore"
import {
  ChevronDown, Search, X, Brain, TicketPlus, Calendar,
  Check, Loader2, ChevronRight,
} from "lucide-react"

// ── Types ───────────────────────────────────────────────────────────────────

interface VpsMatch {
  match_id: string
  home_team: string
  away_team: string
  competition: string
  country: string
  date_iso: string
  status: string
  odds: { "1": number | null; X: number | null; "2": number | null }
  home_score?: number
  away_score?: number
}

// ── Mock data (fallback / dev) ───────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0]!
const MOCK_MATCHES: VpsMatch[] = [
  {
    match_id: "mock-1",
    home_team: "PSG",
    away_team: "Olympique de Marseille",
    competition: "Ligue 1",
    country: "France",
    date_iso: `${TODAY}T20:00:00Z`,
    status: "upcoming",
    odds: { "1": 1.85, X: 3.40, "2": 4.20 },
  },
  {
    match_id: "mock-2",
    home_team: "Manchester City",
    away_team: "Arsenal",
    competition: "Premier League",
    country: "Angleterre",
    date_iso: `${TODAY}T16:30:00Z`,
    status: "inprogress",
    odds: { "1": 1.70, X: 3.60, "2": 4.80 },
    home_score: 1,
    away_score: 0,
  },
  {
    match_id: "mock-3",
    home_team: "Real Madrid",
    away_team: "FC Barcelona",
    competition: "La Liga",
    country: "Espagne",
    date_iso: `${TODAY}T19:00:00Z`,
    status: "upcoming",
    odds: { "1": 2.10, X: 3.30, "2": 3.50 },
  },
  {
    match_id: "mock-4",
    home_team: "Bayern Munich",
    away_team: "Borussia Dortmund",
    competition: "Bundesliga",
    country: "Allemagne",
    date_iso: `${TODAY}T17:30:00Z`,
    status: "final",
    odds: { "1": 1.60, X: 3.80, "2": 5.50 },
    home_score: 2,
    away_score: 1,
  },
  {
    match_id: "mock-5",
    home_team: "Inter Milan",
    away_team: "Juventus",
    competition: "Serie A",
    country: "Italie",
    date_iso: `${TODAY}T20:45:00Z`,
    status: "upcoming",
    odds: { "1": 2.20, X: 3.20, "2": 3.40 },
  },
]

// Competition priority: special comps first, then by country
const COMP_PRIORITY: Record<string, number> = {
  "Ligue des Champions": 0,
  "Ligue Europa": 1,
  "Coupe du Monde": 2,
  "Euro": 3,
  "Coupe d'Afrique": 4,
  "Premier League": 10,
  "La Liga": 11,
  "Bundesliga": 12,
  "Serie A": 13,
  "Ligue 1": 14,
}

const COUNTRY_FLAG: Record<string, string> = {
  "International": "🌍",
  "Angleterre": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Espagne": "🇪🇸",
  "Allemagne": "🇩🇪",
  "Italie": "🇮🇹",
  "France": "🇫🇷",
  "Portugal": "🇵🇹",
  "Pays-Bas": "🇳🇱",
  "Belgique": "🇧🇪",
  "Turquie": "🇹🇷",
  "Russie": "🇷🇺",
  "Brésil": "🇧🇷",
  "Argentine": "🇦🇷",
  "Maroc": "🇲🇦",
  "Sénégal": "🇸🇳",
  "Côte d'Ivoire": "🇨🇮",
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function vpsStatus(s: string): "live" | "upcoming" | "finished" {
  if (s === "inprogress" || s === "halftime") return "live"
  if (s === "final" || s === "finished" || s === "ft") return "finished"
  return "upcoming"
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(d: Date) {
  return d.toISOString().split("T")[0]!
}

// ── Match Card ───────────────────────────────────────────────────────────────
function MatchRow({ match }: { match: VpsMatch }) {
  const router = useRouter()
  const { addMatch, removeMatch, isSelected } = useCouponStore()
  const selected = isSelected(match.match_id)
  const status = vpsStatus(match.status)

  const handleCoupon = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selected) {
      removeMatch(match.match_id)
    } else {
      addMatch({
        id: match.match_id,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        league: match.competition,
        time: fmtTime(match.date_iso),
        addedAt: new Date(),
        odds: (match.odds["1"] != null && match.odds.X != null && match.odds["2"] != null)
          ? { "1": match.odds["1"]!, X: match.odds.X!, "2": match.odds["2"]! }
          : undefined,
      })
      router.push("/paris")
    }
  }

  const handleAnalyse = (e: React.MouseEvent) => {
    e.stopPropagation()
    sessionStorage.setItem("pending_match", JSON.stringify({
      id: match.match_id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      competition: match.competition,
      country: match.country ?? "",
      time: fmtTime(match.date_iso),
      status,
    }))
    router.push("/dashboard")
  }

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-xl border transition-all duration-200",
        selected ? "border-accent-cyan/50 shadow-[0_0_16px_rgba(0,212,255,0.12)]" : "border-bg-tertiary"
      )}
    >
      {/* Match body */}
      <div className="px-4 pt-3 pb-2">
        {/* Time + status */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-text-tertiary text-xs font-mono">{fmtTime(match.date_iso)}</span>
          {status === "live" ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          ) : status === "finished" ? (
            <span className="text-xs text-text-tertiary font-medium">Terminé</span>
          ) : (
            <span className="text-xs text-text-tertiary font-medium">À venir</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary text-sm leading-tight">{match.home_team}</span>
            {match.home_score !== undefined ? (
              <span className={cn("font-bold text-base font-mono", status === "live" && "text-accent-cyan")}>
                {match.home_score}
              </span>
            ) : (
              match.odds["1"] && <span className="text-xs text-text-tertiary">{match.odds["1"].toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary text-sm leading-tight">{match.away_team}</span>
            {match.away_score !== undefined ? (
              <span className={cn("font-bold text-base font-mono", status === "live" && "text-accent-cyan")}>
                {match.away_score}
              </span>
            ) : (
              match.odds["2"] && <span className="text-xs text-text-tertiary">{match.odds["2"].toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex border-t border-bg-tertiary">
        <button
          onClick={handleAnalyse}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/5 transition-colors rounded-bl-xl"
        >
          <Brain className="w-3.5 h-3.5" />
          Analyser
        </button>
        <div className="w-px bg-bg-tertiary" />
        <button
          onClick={handleCoupon}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors rounded-br-xl",
            selected
              ? "text-accent-cyan bg-accent-cyan/5"
              : "text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/5"
          )}
        >
          {selected ? <Check className="w-3.5 h-3.5" /> : <TicketPlus className="w-3.5 h-3.5" />}
          {selected ? "Ajouté" : "Coupon"}
        </button>
      </div>
    </div>
  )
}

// ── Competition group header ─────────────────────────────────────────────────
function CompHeader({ country, competition }: { country: string; competition: string }) {
  const flag = COUNTRY_FLAG[country] ?? "⚽"
  return (
    <div className="flex items-center gap-2 mb-2 mt-5 first:mt-0">
      <span className="text-base leading-none">{flag}</span>
      <div className="min-w-0">
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{country} · </span>
        <span className="text-sm font-semibold text-text-primary">{competition}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-text-tertiary ml-auto shrink-0" />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [matches, setMatches] = useState<VpsMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [competitionFilter, setCompetitionFilter] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(fmtDate(new Date()))
  const [showCountries, setShowCountries] = useState(false)
  const [showCompetitions, setShowCompetitions] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/beta/matches?days=7`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { matches_by_competition?: Record<string, VpsMatch[]> }
      const flat = Object.values(data.matches_by_competition ?? {}).flat()
      if (flat.length === 0) throw new Error("no_data")
      setMatches(flat)
      setUsingMock(false)
    } catch {
      setMatches(MOCK_MATCHES)
      setUsingMock(true)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // Derive unique countries sorted
  const countries = useMemo(() => {
    const seen = new Set<string>()
    matches.forEach((m) => { if (m.country) seen.add(m.country) })
    return [...seen].sort((a, b) => a.localeCompare(b, "fr"))
  }, [matches])

  // Derive unique competitions sorted by priority
  const competitions = useMemo(() => {
    const map = new Map<string, string>() // competition → country
    matches
      .filter((m) => !countryFilter || m.country === countryFilter)
      .forEach((m) => map.set(m.competition, m.country ?? ""))
    return [...map.entries()].sort((a, b) => {
      const pa = COMP_PRIORITY[a[0]] ?? 99
      const pb = COMP_PRIORITY[b[0]] ?? 99
      return pa - pb || a[0].localeCompare(b[0])
    })
  }, [matches, countryFilter])

  // Filtered + grouped
  const grouped = useMemo(() => {
    const filtered = matches.filter((m) => {
      const mDate = m.date_iso.split("T")[0]
      if (mDate !== selectedDate) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !m.home_team.toLowerCase().includes(q) &&
          !m.away_team.toLowerCase().includes(q) &&
          !m.competition.toLowerCase().includes(q)
        ) return false
      }

      if (countryFilter && m.country !== countryFilter) return false
      if (competitionFilter && m.competition !== competitionFilter) return false

      return true
    })

    const groups: Record<string, { country: string; matches: VpsMatch[] }> = {}
    filtered.forEach((m) => {
      if (!groups[m.competition]) groups[m.competition] = { country: m.country ?? "", matches: [] }
      groups[m.competition]!.matches.push(m)
    })
    return groups
  }, [matches, selectedDate, searchQuery, countryFilter, competitionFilter])

  const totalFiltered = useMemo(
    () => Object.values(grouped).reduce((s, g) => s + g.matches.length, 0),
    [grouped]
  )

  const activeFilters = (countryFilter ? 1 : 0) + (competitionFilter ? 1 : 0)

  const clearFilters = () => {
    setCountryFilter(null)
    setCompetitionFilter(null)
    setSearchQuery("")
    setSelectedDate(fmtDate(new Date()))
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-primary">Matchs</h1>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-accent-cyan"
            >
              <X className="w-3.5 h-3.5" />
              Effacer ({activeFilters})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Équipe, compétition..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-cyan focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

          {/* Date picker */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bg-tertiary text-text-secondary text-sm font-medium shrink-0 cursor-pointer">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {selectedDate === fmtDate(new Date())
                ? "Aujourd'hui"
                : new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="sr-only"
            />
          </label>

          {/* Country filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setShowCountries(!showCountries); setShowCompetitions(false) }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium max-w-35",
                countryFilter
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              {countryFilter
                ? <><span>{COUNTRY_FLAG[countryFilter] ?? "⚽"}</span><span className="truncate">{countryFilter}</span></>
                : "Pays"
              }
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            {showCountries && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCountries(false)} />
                <div className="absolute top-full left-0 mt-2 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-xl z-20 min-w-45 max-h-70 overflow-y-auto">
                  <button
                    onClick={() => { setCountryFilter(null); setCompetitionFilter(null); setShowCountries(false) }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors",
                      !countryFilter ? "text-accent-cyan" : "text-text-primary"
                    )}
                  >
                    Tous les pays
                  </button>
                  <div className="border-t border-bg-tertiary" />
                  {countries.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCountryFilter(c); setCompetitionFilter(null); setShowCountries(false) }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors flex items-center gap-2",
                        countryFilter === c ? "text-accent-cyan" : "text-text-primary"
                      )}
                    >
                      <span>{COUNTRY_FLAG[c] ?? "⚽"}</span>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Competition filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setShowCompetitions(!showCompetitions); setShowCountries(false) }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium max-w-40",
                competitionFilter
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              <span className="truncate">{competitionFilter ?? "Compétition"}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            {showCompetitions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCompetitions(false)} />
                <div className="absolute top-full left-0 mt-2 bg-bg-secondary border border-bg-tertiary rounded-xl shadow-xl z-20 min-w-55 max-h-75 overflow-y-auto">
                  <button
                    onClick={() => { setCompetitionFilter(null); setShowCompetitions(false) }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors",
                      !competitionFilter ? "text-accent-cyan" : "text-text-primary"
                    )}
                  >
                    Toutes les compétitions
                  </button>
                  <div className="border-t border-bg-tertiary" />
                  {competitions.map(([comp, country]) => {
                    const flag = COUNTRY_FLAG[country] ?? "⚽"
                    return (
                      <button
                        key={comp}
                        onClick={() => { setCompetitionFilter(comp); setShowCompetitions(false) }}
                        className={cn(
                          "w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors flex items-center gap-2",
                          competitionFilter === comp ? "text-accent-cyan" : "text-text-primary"
                        )}
                      >
                        <span>{flag}</span>
                        <div className="min-w-0">
                          <p className="truncate">{comp}</p>
                          <p className="text-xs text-text-tertiary">{country}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
            <p className="text-sm text-text-tertiary">Chargement des matchs…</p>
          </div>
        )}

        {!loading && usingMock && (
          <div className="mt-3 mb-1 px-3 py-2 bg-bg-tertiary rounded-lg text-xs text-text-tertiary text-center">
            Données de démonstration · <button onClick={() => void load()} className="text-accent-cyan underline">Réessayer</button>
          </div>
        )}

        {!loading && totalFiltered === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">⚽</span>
            <p className="text-text-secondary mt-4 text-sm">
              {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucun match pour cette période"}
            </p>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-medium">
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {!loading && Object.entries(grouped).map(([competition, group]) => (
          <div key={competition}>
            <CompHeader country={group.country} competition={competition} />
            <div className="space-y-2 mb-2">
              {group.matches.map((m) => <MatchRow key={m.match_id} match={m} />)}
            </div>
          </div>
        ))}
      </main>

      <DashboardNav />
    </div>
  )
}
