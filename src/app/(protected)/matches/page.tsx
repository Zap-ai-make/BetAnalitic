"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { useCouponStore } from "~/lib/stores/couponStore"
import {
  ChevronDown, Search, X, Brain, TicketPlus, Calendar,
  Check, Loader2, ChevronRight, PenLine,
} from "lucide-react"
import { useLang } from "~/lib/lang"

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

function fmtTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
}

function fmtDate(d: Date) {
  return d.toISOString().split("T")[0]!
}

// ── Match Card ───────────────────────────────────────────────────────────────
function MatchRow({ match }: { match: VpsMatch }) {
  const router = useRouter()
  const { addMatch, removeMatch, isSelected } = useCouponStore()
  const { t, lang } = useLang()
  const locale = lang === "FR" ? "fr-FR" : "en-US"
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
        time: fmtTime(match.date_iso, locale),
        addedAt: new Date(),
        odds: (match.odds["1"] != null && match.odds.X != null && match.odds["2"] != null)
          ? { "1": match.odds["1"], X: match.odds.X, "2": match.odds["2"] }
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
      time: fmtTime(match.date_iso, locale),
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
          <span className="text-text-tertiary text-xs font-mono">{fmtTime(match.date_iso, locale)}</span>
          {status === "live" ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          ) : status === "finished" ? (
            <span className="text-xs text-text-tertiary font-medium">{t.matches.finished}</span>
          ) : (
            <span className="text-xs text-text-tertiary font-medium">{t.matches.upcoming}</span>
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
          {t.matches.analyze}
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
          {selected ? t.matches.added : t.matches.addToCoupon}
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

// ── Manual match entry ───────────────────────────────────────────────────────
interface ManualForm { homeTeam: string; awayTeam: string; date: string; time: string; competition: string }
const EMPTY_FORM: ManualForm = { homeTeam: "", awayTeam: "", date: fmtDate(new Date()), time: "", competition: "" }

function ManualMatchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM)
  const { lang } = useLang()
  const locale = lang === "FR" ? "fr-FR" : "en-US"

  const canSubmit = form.homeTeam.trim() && form.awayTeam.trim() && form.competition.trim()

  function reset() { setForm(EMPTY_FORM); onClose() }

  function handleAnalyse() {
    if (!canSubmit) return
    const timeLabel = form.time
      ? new Date(`${form.date}T${form.time}`).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : "TBD"
    sessionStorage.setItem("pending_match", JSON.stringify({
      id: `custom-${Date.now()}`,
      homeTeam: form.homeTeam.trim(),
      awayTeam: form.awayTeam.trim(),
      competition: form.competition.trim(),
      country: "",
      time: timeLabel,
      status: "upcoming",
    }))
    reset()
    router.push("/dashboard")
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={reset} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary rounded-t-2xl border-t border-bg-tertiary pb-safe">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-bg-tertiary" />
        </div>

        <div className="px-4 pb-6 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="font-display font-bold text-lg text-text-primary">Saisir un match</h2>
            <button onClick={reset} className="p-2 text-text-tertiary hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Teams row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Équipe A</label>
              <input
                type="text"
                value={form.homeTeam}
                onChange={(e) => setForm((f) => ({ ...f, homeTeam: e.target.value }))}
                placeholder="Ex: PSG"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Équipe B</label>
              <input
                type="text"
                value={form.awayTeam}
                onChange={(e) => setForm((f) => ({ ...f, awayTeam: e.target.value }))}
                placeholder="Ex: Monaco"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Heure (optionnel)</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Championship */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Championnat</label>
            <input
              type="text"
              value={form.competition}
              onChange={(e) => setForm((f) => ({ ...f, competition: e.target.value }))}
              placeholder="Ex: Ligue 1, Premier League…"
              className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleAnalyse}
            disabled={!canSubmit}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all",
              canSubmit
                ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
                : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
            )}
          >
            <Brain className="w-4 h-4" />
            Analyser ce match
          </button>
        </div>
      </div>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const { t, lang } = useLang()
  const locale = lang === "FR" ? "fr-FR" : "en-US"
  const [searchQuery, setSearchQuery] = useState("")
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [competitionFilter, setCompetitionFilter] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(fmtDate(new Date()))
  const [showCountries, setShowCountries] = useState(false)
  const [showCompetitions, setShowCompetitions] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)

  const {
    data: matches = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["beta-matches"],
    queryFn: async (): Promise<VpsMatch[]> => {
      const res = await fetch("/api/beta/matches?days=7&flat=true")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { matches?: VpsMatch[]; matches_by_competition?: Record<string, VpsMatch[]> }
      return data.matches ?? Object.values(data.matches_by_competition ?? {}).flat()
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

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
    <div className="h-full bg-bg-primary flex flex-col">
      {/* Sub-header — sits at top of flex column, never scrolls */}
      <div className="shrink-0 z-10 bg-bg-primary border-b border-bg-tertiary px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-text-primary">{t.matches.title}</h1>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-accent-cyan"
            >
              <X className="w-3.5 h-3.5" />
              {t.matches.clear} ({activeFilters})
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
            placeholder={t.matches.searchPlaceholder}
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
                ? t.matches.today
                : new Date(selectedDate + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "short" })}
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
                : t.matches.country
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
                    {t.matches.allCountries}
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
              <span className="truncate">{competitionFilter ?? t.matches.competition}</span>
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
                    {t.matches.allCompetitions}
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

        {/* Manual entry shortcut */}
        <button
          onClick={() => setShowManualForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-bg-tertiary text-text-tertiary hover:border-accent-cyan/40 hover:text-accent-cyan transition-colors text-xs font-medium"
        >
          <PenLine className="w-3.5 h-3.5" />
          Match non listé ? Saisir manuellement
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {isFetching && matches.length === 0 && (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-bg-secondary animate-pulse" />
            ))}
          </div>
        )}
        {isFetching && matches.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Loader2 className="w-3.5 h-3.5 text-accent-cyan animate-spin" />
            <p className="text-xs text-text-tertiary">{t.matches.refreshing}</p>
          </div>
        )}

        {isError && !isFetching && (
          <div className="mt-3 mb-1 px-3 py-2 bg-bg-tertiary rounded-lg text-xs text-text-tertiary text-center">
            Impossible de charger les matchs ·{" "}
            <button onClick={() => void refetch()} className="text-accent-cyan underline">Réessayer</button>
          </div>
        )}

        {totalFiltered === 0 && (
          <div className="text-center py-16 space-y-4">
            <span className="text-5xl">⚽</span>
            <p className="text-text-secondary text-sm">
              {searchQuery ? `${t.matches.noResults} "${searchQuery}"` : t.matches.noMatchesPeriod}
            </p>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-lg text-sm font-medium">
                {t.matches.clearFilters}
              </button>
            )}
            <div className="pt-2">
              <p className="text-xs text-text-tertiary mb-3">Match non listé ?</p>
              <button
                onClick={() => setShowManualForm(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-bg-secondary border border-bg-tertiary rounded-xl text-sm font-medium text-text-primary hover:border-accent-cyan/50 transition-colors"
              >
                <PenLine className="w-4 h-4 text-accent-cyan" />
                Saisir manuellement
              </button>
            </div>
          </div>
        )}

        {Object.entries(grouped).map(([competition, group]) => (
          <div key={competition}>
            <CompHeader country={group.country} competition={competition} />
            <div className="space-y-2 mb-2">
              {group.matches.map((m) => <MatchRow key={m.match_id} match={m} />)}
            </div>
          </div>
        ))}
      </main>

      <ManualMatchModal open={showManualForm} onClose={() => setShowManualForm(false)} />
    </div>
  )
}
