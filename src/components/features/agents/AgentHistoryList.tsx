"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { AgentHistoryItem, type HistoryEntry } from "./AgentHistoryItem"
import { Loader2 } from "lucide-react"

interface AgentHistoryListProps {
  entries: HistoryEntry[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  className?: string
}

// Group entries by date
function groupByDate(entries: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {}

  for (const entry of entries) {
    const dateKey = entry.createdAt.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
  }

  return groups
}

// Format relative date
function formatRelativeDate(dateStr: string, entries: HistoryEntry[]): string {
  const entry = entries[0]
  if (!entry) return dateStr

  const today = new Date()
  const entryDate = entry.createdAt

  const diffDays = Math.floor(
    (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return dateStr.split(",")[0] ?? dateStr // Just weekday

  return dateStr
}

export function AgentHistoryList({
  entries,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: AgentHistoryListProps) {
  const observerTarget = React.useRef<HTMLDivElement>(null)

  // Infinite scroll observer
  React.useEffect(() => {
    if (!hasMore || isLoading || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTarget.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [hasMore, isLoading, onLoadMore])

  const groupedEntries = groupByDate(entries)
  const dateKeys = Object.keys(groupedEntries)

  if (entries.length === 0 && !isLoading) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-4xl mb-4">📭</div>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
          Aucun historique
        </h3>
        <p className="text-text-secondary text-sm">
          Vos conversations avec les agents apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {dateKeys.map((dateKey) => {
        const dateEntries = groupedEntries[dateKey]!
        const displayDate = formatRelativeDate(dateKey, dateEntries)

        return (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="sticky top-0 z-10 bg-bg-primary py-2 mb-3">
              <h3 className="text-sm font-semibold text-text-secondary capitalize">
                {displayDate}
              </h3>
            </div>

            {/* Entries for this date */}
            <div className="space-y-3">
              {dateEntries.map((entry) => (
                <AgentHistoryItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 flex justify-center">
          {isLoading && (
            <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && entries.length === 0 && (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
        </div>
      )}
    </div>
  )
}
