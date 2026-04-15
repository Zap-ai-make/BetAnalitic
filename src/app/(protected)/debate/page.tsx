/**
 * Story 8.7: DebateArena Page
 */

import { redirect } from "next/navigation"
import { auth } from "~/server/auth"
import { DebateCard, HotDebateBadge } from "~/components/features/debate/DebateCard"

// Mock data
const MOCK_DEBATES = [
  {
    id: "1",
    topic: "PSG remportera la Ligue des Champions cette saison",
    matchName: "PSG vs Bayern Munich",
    positions: [
      { agentId: "scout", agentName: "Scout", agentColor: "#22c55e", position: "for" as const, summary: "" },
      { agentId: "strategist", agentName: "Strategist", agentColor: "#3b82f6", position: "for" as const, summary: "" },
      { agentId: "sentinel", agentName: "Sentinel", agentColor: "#ef4444", position: "against" as const, summary: "" },
      { agentId: "oracle", agentName: "Oracle", agentColor: "#8b5cf6", position: "against" as const, summary: "" },
    ],
    voteCount: 234,
    participantCount: 156,
    status: "active" as const,
    endsAt: new Date(Date.now() + 45 * 60 * 1000),
    intensity: "high" as const,
  },
  {
    id: "2",
    topic: "Le Real Madrid est favori pour la Liga cette saison",
    positions: [
      { agentId: "scout", agentName: "Scout", agentColor: "#22c55e", position: "for" as const, summary: "" },
      { agentId: "historian", agentName: "Historian", agentColor: "#f59e0b", position: "against" as const, summary: "" },
    ],
    voteCount: 89,
    participantCount: 67,
    status: "voting" as const,
    endsAt: new Date(Date.now() + 15 * 60 * 1000),
    intensity: "medium" as const,
  },
  {
    id: "3",
    topic: "Haaland finira meilleur buteur de Premier League",
    positions: [
      { agentId: "strategist", agentName: "Strategist", agentColor: "#3b82f6", position: "for" as const, summary: "" },
      { agentId: "valuebet", agentName: "ValueBet", agentColor: "#10b981", position: "for" as const, summary: "" },
      { agentId: "sentinel", agentName: "Sentinel", agentColor: "#ef4444", position: "against" as const, summary: "" },
    ],
    voteCount: 312,
    participantCount: 201,
    status: "closed" as const,
    winner: "for" as const,
    intensity: "low" as const,
  },
]

export default async function DebatePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const activeDebates = MOCK_DEBATES.filter((d) => d.status === "active")
  const votingDebates = MOCK_DEBATES.filter((d) => d.status === "voting")
  const closedDebates = MOCK_DEBATES.filter((d) => d.status === "closed")

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-tertiary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
                🎭 DebateArena
              </h1>
              <p className="text-text-secondary mt-1">
                Les agents IA débattent, vous décidez
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-accent-cyan text-bg-primary rounded-xl font-medium hover:bg-accent-cyan/80 transition-colors min-h-[44px]"
            >
              + Nouveau débat
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Active Debates */}
        {activeDebates.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-red" />
              </span>
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Débats en cours
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeDebates.map((debate) => (
                <div key={debate.id} className="relative">
                  <HotDebateBadge
                    intensity={debate.intensity}
                    className="absolute top-4 right-4 z-10"
                  />
                  <DebateCard
                    id={debate.id}
                    topic={debate.topic}
                    matchName={debate.matchName}
                    positions={debate.positions}
                    voteCount={debate.voteCount}
                    participantCount={debate.participantCount}
                    status={debate.status}
                    endsAt={debate.endsAt}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Voting Open */}
        {votingDebates.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
              🗳️ Votes ouverts
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {votingDebates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  id={debate.id}
                  topic={debate.topic}
                  matchName={debate.matchName}
                  positions={debate.positions}
                  voteCount={debate.voteCount}
                  participantCount={debate.participantCount}
                  status={debate.status}
                  endsAt={debate.endsAt}
                />
              ))}
            </div>
          </section>
        )}

        {/* Closed Debates */}
        {closedDebates.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
              📜 Débats terminés
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedDebates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  id={debate.id}
                  topic={debate.topic}
                  matchName={debate.matchName}
                  positions={debate.positions}
                  voteCount={debate.voteCount}
                  participantCount={debate.participantCount}
                  status={debate.status}
                  winner={debate.winner}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {MOCK_DEBATES.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
              Aucun débat en cours
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Lancez un débat pour voir les agents IA argumenter sur un sujet
              controversé !
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
