"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { useHaptic } from "~/hooks/useHaptic"

export type NavItem = "home" | "matches" | "analysis" | "paris" | "salles"

export interface BottomNavProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

const NAV_ITEMS: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "matches",
    label: "Matchs",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M12 2a10 10 0 0110 10M12 2a10 10 0 00-10 10" />
        <path strokeLinecap="round" strokeWidth={2} d="M2 12h4m12 0h4M12 2v4m0 12v4" />
      </svg>
    ),
  },
  {
    id: "analysis",
    label: "Analyse",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "paris",
    label: "Paris",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "salles",
    label: "Salles",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function BottomNav({ activeItem, onNavigate }: BottomNavProps) {
  const { trigger: triggerHaptic } = useHaptic({ duration: 10 })
  const [tappedItem, setTappedItem] = React.useState<NavItem | null>(null)
  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const navRef = React.useRef<HTMLDivElement>(null)

  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeItem)

  const handleTap = (item: NavItem) => {
    triggerHaptic()
    setTappedItem(item)
    setTimeout(() => setTappedItem(null), 150)
    onNavigate(item)
  }

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-bg-primary/95 backdrop-blur-sm",
        "border-t border-bg-tertiary"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative flex items-center justify-around h-16">
        {/* Sliding Indicator */}
        <div
          ref={indicatorRef}
          className="absolute top-0 h-0.5 bg-accent-cyan transition-all"
          style={{
            width: `${100 / NAV_ITEMS.length}%`,
            left: `${(activeIndex / NAV_ITEMS.length) * 100}%`,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            transitionDuration: "300ms",
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id
          const isTapped = tappedItem === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTap(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "w-full h-full",
                "transition-all duration-150",
                "min-h-[44px] min-w-[44px]"
              )}
              style={{
                transform: isTapped ? "scale(1.15)" : "scale(1)",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-accent-cyan" : "text-text-tertiary"
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive ? "text-accent-cyan" : "text-text-tertiary"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
