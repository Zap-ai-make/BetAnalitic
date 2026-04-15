"use client"

import { useState } from "react"

import { cn } from "~/lib/utils"

// Mock teams data - in production, this would come from an API
const SPORTS = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "rugby", name: "Rugby", emoji: "🏉" },
  { id: "hockey", name: "Hockey", emoji: "🏒" },
  { id: "baseball", name: "Baseball", emoji: "⚾" },
]

const POPULAR_TEAMS: Record<string, { id: string; name: string; league: string }[]> = {
  football: [
    { id: "psg", name: "Paris Saint-Germain", league: "Ligue 1" },
    { id: "om", name: "Olympique de Marseille", league: "Ligue 1" },
    { id: "ol", name: "Olympique Lyonnais", league: "Ligue 1" },
    { id: "asm", name: "AS Monaco", league: "Ligue 1" },
    { id: "losc", name: "LOSC Lille", league: "Ligue 1" },
    { id: "rma", name: "Real Madrid", league: "La Liga" },
    { id: "fcb", name: "FC Barcelona", league: "La Liga" },
    { id: "manu", name: "Manchester United", league: "Premier League" },
    { id: "mancity", name: "Manchester City", league: "Premier League" },
    { id: "liverpool", name: "Liverpool FC", league: "Premier League" },
    { id: "chelsea", name: "Chelsea FC", league: "Premier League" },
    { id: "bayern", name: "Bayern Munich", league: "Bundesliga" },
    { id: "juve", name: "Juventus", league: "Serie A" },
    { id: "inter", name: "Inter Milan", league: "Serie A" },
    { id: "acmilan", name: "AC Milan", league: "Serie A" },
  ],
  basketball: [
    { id: "lakers", name: "LA Lakers", league: "NBA" },
    { id: "warriors", name: "Golden State Warriors", league: "NBA" },
    { id: "celtics", name: "Boston Celtics", league: "NBA" },
    { id: "bulls", name: "Chicago Bulls", league: "NBA" },
    { id: "heat", name: "Miami Heat", league: "NBA" },
  ],
  tennis: [],
  rugby: [
    { id: "stade-fr", name: "Stade Français", league: "Top 14" },
    { id: "toulouse", name: "Stade Toulousain", league: "Top 14" },
    { id: "racing", name: "Racing 92", league: "Top 14" },
  ],
  hockey: [],
  baseball: [],
}

interface FavoriteTeamsStepProps {
  selectedSports: string[]
  selectedTeams: string[]
  onSportsChange: (sports: string[]) => void
  onTeamsChange: (teams: string[]) => void
}

export function FavoriteTeamsStep({
  selectedSports,
  selectedTeams,
  onSportsChange,
  onTeamsChange,
}: FavoriteTeamsStepProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      onSportsChange(selectedSports.filter((s) => s !== sportId))
      // Remove teams from that sport
      const sportTeams = POPULAR_TEAMS[sportId] ?? []
      const teamIds = sportTeams.map((t) => t.id)
      onTeamsChange(selectedTeams.filter((t) => !teamIds.includes(t)))
    } else if (selectedSports.length < 3) {
      onSportsChange([...selectedSports, sportId])
    }
  }

  const toggleTeam = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      onTeamsChange(selectedTeams.filter((t) => t !== teamId))
    } else if (selectedTeams.length < 5) {
      onTeamsChange([...selectedTeams, teamId])
    }
  }

  // Get teams for selected sports
  const availableTeams = selectedSports.flatMap(
    (sportId) => POPULAR_TEAMS[sportId] ?? []
  )

  // Filter teams by search
  const filteredTeams = searchQuery
    ? availableTeams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.league.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTeams

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Vos sports et équipes
        </h2>
        <p className="text-text-secondary">
          Sélectionnez jusqu&apos;à 3 sports et 5 équipes favorites
        </p>
      </div>

      {/* Sports Selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-text-primary">Sports</h3>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              disabled={!selectedSports.includes(sport.id) && selectedSports.length >= 3}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                "flex items-center gap-2",
                selectedSports.includes(sport.id)
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80",
                !selectedSports.includes(sport.id) &&
                  selectedSports.length >= 3 &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              <span>{sport.emoji}</span>
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-text-tertiary">
          {selectedSports.length}/3 sports sélectionnés
        </p>
      </div>

      {/* Teams Selection */}
      {selectedSports.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-text-primary">Équipes</h3>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une équipe..."
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-bg-tertiary border-2 border-transparent",
              "text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:border-accent-cyan"
            )}
          />

          {/* Teams Grid */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  disabled={!selectedTeams.includes(team.id) && selectedTeams.length >= 5}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    "flex items-center justify-between",
                    selectedTeams.includes(team.id)
                      ? "bg-accent-cyan/10 border-2 border-accent-cyan"
                      : "bg-bg-tertiary border-2 border-transparent hover:border-bg-tertiary",
                    !selectedTeams.includes(team.id) &&
                      selectedTeams.length >= 5 &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div>
                    <div className="font-medium text-text-primary">{team.name}</div>
                    <div className="text-xs text-text-tertiary">{team.league}</div>
                  </div>
                  {selectedTeams.includes(team.id) && (
                    <span className="text-accent-cyan">✓</span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-center text-text-tertiary py-4">
                Aucune équipe trouvée
              </p>
            )}
          </div>

          <p className="text-xs text-text-tertiary">
            {selectedTeams.length}/5 équipes sélectionnées
          </p>
        </div>
      )}

      {selectedSports.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          Sélectionnez un sport pour voir les équipes populaires
        </div>
      )}
    </div>
  )
}
