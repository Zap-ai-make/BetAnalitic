"use client"

/**
 * Story 13.1: Global Search
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Search, X, Users, Trophy, Bot, Calendar, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type SearchResultType = "match" | "room" | "expert" | "agent"

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  icon?: LucideIcon
  href?: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (result: SearchResult) => void
  className?: string
}

const typeConfig: Record<SearchResultType, { icon: LucideIcon; color: string; label: string }> = {
  match: { icon: Calendar, color: "text-accent-cyan", label: "Match" },
  room: { icon: Users, color: "text-accent-purple", label: "Salon" },
  expert: { icon: Trophy, color: "text-accent-orange", label: "Expert" },
  agent: { icon: Bot, color: "text-accent-green", label: "Agent" },
}

// Mock search function
const mockSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return []

  // Simulate API delay
  await new Promise((r) => setTimeout(r, 200))

  const results: SearchResult[] = []

  if (query.toLowerCase().includes("psg")) {
    results.push(
      { id: "1", type: "match", title: "PSG vs Bayern Munich", subtitle: "Champions League - 20h00" },
      { id: "2", type: "room", title: "Fans PSG", subtitle: "234 membres" }
    )
  }

  if (query.toLowerCase().includes("expert")) {
    results.push(
      { id: "3", type: "expert", title: "ProTipster", subtitle: "Expert Diamant • 78% win rate" }
    )
  }

  results.push(
    { id: "4", type: "agent", title: "Scout", subtitle: "Analyse de matchs" },
    { id: "5", type: "agent", title: "ValueBet", subtitle: "Détection de value bets" }
  )

  return results.slice(0, 8)
}

export function GlobalSearch({ isOpen, onClose, onSelect, className }: GlobalSearchProps) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  React.useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const data = await mockSearch(query)
        setResults(data)
      } finally {
        setIsLoading(false)
      }
    }

    const timeout = setTimeout(() => void search(), 300)
    return () => clearTimeout(timeout)
  }, [query])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Search Panel */}
      <div
        className={cn(
          "absolute top-4 left-4 right-4 max-w-2xl mx-auto",
          "bg-bg-secondary rounded-2xl shadow-2xl overflow-hidden",
          className
        )}
      >
        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-b border-bg-tertiary">
          <Search className="w-5 h-5 text-text-tertiary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher matchs, salons, experts..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-text-tertiary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-text-tertiary">Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-2">
              {results.map((result) => {
                const config = typeConfig[result.type]
                const Icon = config.icon

                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      onSelect?.(result)
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-tertiary transition-colors text-left"
                  >
                    <div className={cn("p-2 rounded-lg bg-bg-tertiary", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-text-tertiary truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-text-tertiary px-2 py-0.5 bg-bg-tertiary rounded">
                      {config.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-tertiary" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Quick Actions */}
          {!query && (
            <div className="p-4">
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-3">
                Actions rapides
              </p>
              <div className="grid grid-cols-2 gap-2">
                <QuickAction icon={Calendar} label="Matchs du jour" />
                <QuickAction icon={Users} label="Mes salons" />
                <QuickAction icon={Bot} label="Tous les agents" />
                <QuickAction icon={Trophy} label="Top experts" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 p-3 bg-bg-tertiary rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

/**
 * Story 13.2: Search Trigger Button
 */
interface SearchTriggerProps {
  onClick: () => void
  className?: string
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-bg-tertiary rounded-xl",
        "text-text-tertiary hover:text-text-primary transition-colors",
        "min-h-[44px]",
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="text-sm">Rechercher...</span>
      <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-bg-secondary rounded text-xs">
        ⌘K
      </kbd>
    </button>
  )
}
