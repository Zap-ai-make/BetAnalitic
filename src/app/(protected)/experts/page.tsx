/**
 * Story 10.5: Experts Page
 */

import { redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { ExpertCard } from "~/components/features/expert/ExpertBadge"
import { ExpertLeaderboard } from "~/components/features/expert/ExpertLeaderboard"

// Mock data
const MOCK_EXPERTS = [
  {
    id: "1",
    name: "ProTipster",
    level: "diamond" as const,
    winRate: 78,
    totalPredictions: 1250,
    monthlyProfit: 34,
    streak: 12,
    specialties: ["Ligue 1", "Premier League", "Over/Under"],
  },
  {
    id: "2",
    name: "FootballGuru",
    level: "gold" as const,
    winRate: 72,
    totalPredictions: 890,
    monthlyProfit: 22,
    streak: 5,
    specialties: ["La Liga", "BTTS", "Handicap"],
  },
  {
    id: "3",
    name: "BetMaster",
    level: "gold" as const,
    winRate: 69,
    totalPredictions: 654,
    monthlyProfit: 18,
    streak: 0,
    specialties: ["Bundesliga", "Serie A"],
  },
]

const MOCK_LEADERBOARD = [
  { rank: 1, userId: "1", name: "ProTipster", winRate: 78, profit: 34, predictions: 1250 },
  { rank: 2, userId: "2", name: "FootballGuru", winRate: 72, profit: 22, predictions: 890 },
  { rank: 3, userId: "3", name: "BetMaster", winRate: 69, profit: 18, predictions: 654 },
  { rank: 4, userId: "4", name: "TipKing", winRate: 67, profit: 15, predictions: 456 },
  { rank: 5, userId: "5", name: "WinnerPro", winRate: 65, profit: 12, predictions: 321 },
]

export default async function ExpertsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            👑 Programme Expert
          </h1>
          <p className="text-text-secondary mt-1">
            Suivez les meilleurs parieurs et apprenez de leurs pronostics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Become Expert Banner */}
        <div className="p-6 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-2xl border border-accent-cyan/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-text-primary text-lg">
                Devenez Expert
              </h2>
              <p className="text-text-secondary mt-1">
                60%+ de réussite sur 50 pronostics = statut Expert Bronze
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
            >
              En savoir plus
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Experts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Top Experts
            </h2>
            <div className="space-y-4">
              {MOCK_EXPERTS.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  id={expert.id}
                  name={expert.name}
                  level={expert.level}
                  winRate={expert.winRate}
                  totalPredictions={expert.totalPredictions}
                  monthlyProfit={expert.monthlyProfit}
                  streak={expert.streak}
                  specialties={expert.specialties}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Leaderboard */}
          <div>
            <ExpertLeaderboard
              entries={MOCK_LEADERBOARD}
              period="month"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
