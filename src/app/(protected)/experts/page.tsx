"use client"

/**
 * Story 10.5 + Epic 13 Story 13.4: Experts Page with Discovery
 */

import * as React from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { Search, X } from "lucide-react"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"

export default function ExpertsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | "top-rated" | "rising">("all")

  const { data: experts, isLoading } = api.expert.getExperts.useQuery()

  // Filter experts
  const filteredExperts = React.useMemo(() => {
    if (!experts) return []

    let filtered = experts

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          (e.user.displayName?.toLowerCase().includes(query) ?? false) ||
          e.user.username.toLowerCase().includes(query) ||
          e.expertiseAreas.some((area) => area.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory === "top-rated") {
      filtered = filtered.sort((a, b) => b.followerCount - a.followerCount).slice(0, 10)
    } else if (selectedCategory === "rising") {
      filtered = filtered.filter((e) => e.followerCount >= 10 && e.followerCount < 100)
    }

    return filtered
  }, [experts, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      {/* Search & Filters */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-bg-tertiary">
        <div className="px-4 pt-4 space-y-3">
          <h1 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            👑 Programme Expert
          </h1>

          {/* Search Bar */}
          <div className="relative pb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un expert, spécialité..."
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

          {/* Category Filters */}
          <div className="flex gap-2 pb-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === "all"
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedCategory("top-rated")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === "top-rated"
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Top 10
            </button>
            <button
              onClick={() => setSelectedCategory("rising")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === "rising"
                  ? "bg-accent-cyan text-bg-primary"
                  : "bg-bg-tertiary text-text-secondary"
              )}
            >
              Étoiles Montantes
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Become Expert Banner */}
        <div className="mb-6 p-6 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 rounded-2xl border border-accent-cyan/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-text-primary text-lg">
                Devenez Expert
              </h2>
              <p className="text-text-secondary mt-1">
                Créez du contenu et monétisez vos analyses
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

        {/* Experts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-secondary rounded-xl p-4 animate-pulse h-32" />
            ))}
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-6xl">🔍</div>
            <h2 className="font-display text-xl text-text-primary">
              {searchQuery ? `Aucun expert trouvé pour "${searchQuery}"` : "Aucun expert trouvé"}
            </h2>
            <p className="text-text-tertiary text-center max-w-md">
              {searchQuery && "Essayez un autre terme de recherche"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-bg-secondary rounded-xl p-4 border border-bg-tertiary hover:border-accent-cyan transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center text-xl">
                    {expert.user.avatarUrl ? (
                      <img
                        src={expert.user.avatarUrl}
                        alt={expert.user.displayName ?? expert.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-text-primary">
                      {expert.user.displayName ?? expert.user.username}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {expert.followerCount} abonnés
                    </p>
                    {expert.expertiseAreas.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {expert.expertiseAreas.slice(0, 3).map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-bg-tertiary text-text-tertiary text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
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
