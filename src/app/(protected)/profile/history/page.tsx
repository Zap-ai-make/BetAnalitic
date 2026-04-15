"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "~/lib/utils"
import { AgentHistoryList } from "~/components/features/agents/AgentHistoryList"
import type { HistoryEntry } from "~/components/features/agents/AgentHistoryItem"
import { getAgentRegistry } from "~/lib/agents/registry"

// Mock data - in production this would come from tRPC/API
function generateMockHistory(): HistoryEntry[] {
  const registry = getAgentRegistry()
  const agents = registry.getEnabled()

  const mockQueries = [
    "Quelles sont les stats de PSG contre Marseille ?",
    "Y a-t-il une value sur la cote de Lyon ?",
    "Météo pour le match de ce soir ?",
    "Qui sont les absents pour Monaco ?",
    "Analyse du momentum en 2ème période",
    "Mouvement de cotes sur le match de Nice",
    "Stats live du match en cours",
  ]

  const mockResponses = [
    "Basé sur les 10 derniers matchs, PSG a une domination nette avec 7 victoires...",
    "La cote actuelle de 2.10 présente une value de +4.2% selon notre modèle...",
    "Conditions météo favorables : 18°C, ciel dégagé, vent faible...",
    "Blessés : Tchouameni (cuisse), Camavinga (reprise)...",
    "Le momentum est clairement en faveur de l'équipe visiteuse depuis la 60ème...",
    "La cote a chuté de 2.30 à 1.95 en 24h, indiquant un fort mouvement...",
    "xG actuel : 1.8 vs 0.6. Possession : 62% vs 38%...",
  ]

  const entries: HistoryEntry[] = []
  const now = new Date()

  // Generate entries for the past week
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(i / 3)
    const hoursAgo = (i % 3) * 4
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(createdAt.getHours() - hoursAgo)

    const agent = agents[i % agents.length]!
    const query = mockQueries[i % mockQueries.length]!
    const response = mockResponses[i % mockResponses.length]!

    entries.push({
      id: `hist-${i}`,
      agent,
      query,
      response,
      matchContext:
        i % 2 === 0
          ? {
              homeTeam: "PSG",
              awayTeam: "Marseille",
              competition: "Ligue 1",
            }
          : undefined,
      createdAt,
    })
  }

  return entries
}

export default function HistoryPage() {
  const router = useRouter()
  const [entries, setEntries] = React.useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasMore, setHasMore] = React.useState(true)
  const [page, setPage] = React.useState(0)

  // Initial load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setEntries(generateMockHistory())
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Load more
  const loadMore = React.useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    setTimeout(() => {
      // Simulate loading more entries
      if (page >= 2) {
        setHasMore(false)
      } else {
        const moreEntries = generateMockHistory().map((e, i) => ({
          ...e,
          id: `hist-page${page + 1}-${i}`,
          createdAt: new Date(
            e.createdAt.getTime() - (page + 1) * 7 * 24 * 60 * 60 * 1000
          ),
        }))
        setEntries((prev) => [...prev, ...moreEntries])
        setPage((p) => p + 1)
      }
      setIsLoading(false)
    }, 800)
  }, [isLoading, page])

  return (
    <main className="flex min-h-screen flex-col bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur-sm border-b border-bg-tertiary">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "p-2 rounded-lg",
                "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
                "transition-colors",
                "min-w-[44px] min-h-[44px] flex items-center justify-center"
              )}
              aria-label="Retour"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-text-primary">
                Historique
              </h1>
              <p className="text-sm text-text-secondary">
                Vos conversations avec les agents
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <AgentHistoryList
          entries={entries}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </main>
  )
}
