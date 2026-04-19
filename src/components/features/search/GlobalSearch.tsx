"use client"

/**
 * Story 13.1: Global Search
 */

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { Search, X, Users, Trophy, Bot, Calendar, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type SearchResultType = "match" | "room" | "expert" | "analysis"

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  url: string
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
  analysis: { icon: Bot, color: "text-accent-green", label: "Analyse" },
}

export function GlobalSearch({ isOpen, onClose, onSelect, className }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [history, setHistory] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Debounce search query (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // tRPC query
  const { data: results = [], isLoading } = api.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 }
  )

  // Load search history
  React.useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("search-history")
      if (stored) {
        try {
          setHistory(JSON.parse(stored) as string[])
        } catch {
          setHistory([])
        }
      }
    }
  }, [isOpen])

  // Auto-focus on open
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery("")
      setDebouncedQuery("")
    }
  }, [isOpen])

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
                      // Save to history
                      const newHistory = [
                        query,
                        ...history.filter((h) => h !== query).slice(0, 9),
                      ]
                      setHistory(newHistory)
                      localStorage.setItem("search-history", JSON.stringify(newHistory))

                      // Navigate
                      router.push(result.url)
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

          {/* Search History - Epic 13 Story 13.5 */}
          {!query && history.length > 0 && (
            <div className="p-4 border-b border-bg-tertiary">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">
                  Recherches récentes
                </p>
                <button
                  onClick={() => {
                    setHistory([])
                    localStorage.removeItem("search-history")
                  }}
                  className="text-xs text-accent-cyan hover:text-accent-cyan/80"
                >
                  Effacer l&apos;historique
                </button>
              </div>
              <div className="space-y-1">
                {history.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuery(item)}
                      className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
                    >
                      <Calendar className="w-4 h-4 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">{item}</span>
                    </button>
                    <button
                      onClick={() => {
                        const newHistory = history.filter((h) => h !== item)
                        setHistory(newHistory)
                        localStorage.setItem("search-history", JSON.stringify(newHistory))
                      }}
                      className="p-2 text-text-tertiary hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!query && (
            <div className="p-4 border-t border-bg-tertiary">
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-3">
                Actions rapides
              </p>
              <div className="grid grid-cols-2 gap-2">
                <QuickAction icon={Calendar} label="Matchs du jour" onClick={() => router.push("/matches")} />
                <QuickAction icon={Users} label="Mes salons" onClick={() => router.push("/salles")} />
                <QuickAction icon={Bot} label="Tous les agents" onClick={() => router.push("/agents")} />
                <QuickAction icon={Trophy} label="Top experts" onClick={() => router.push("/experts")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
