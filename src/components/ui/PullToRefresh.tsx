"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { usePullToRefresh } from "~/hooks/usePullToRefresh"

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  maxPull?: number
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const {
    pullDistance,
    isRefreshing,
    isSuccess,
    progress,
    rotation,
    containerRef,
  } = usePullToRefresh({
    onRefresh,
    threshold,
    maxPull,
    disabled,
  })

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center",
          "w-10 h-10 rounded-full bg-bg-secondary",
          "transition-opacity duration-200",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: Math.max(pullDistance - 50, -50),
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transition: isRefreshing ? "none" : "top 0.2s ease-out",
        }}
      >
        {isSuccess ? (
          <svg
            className="w-6 h-6 text-accent-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : isRefreshing ? (
          <svg
            className="w-6 h-6 text-accent-cyan animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
          <svg
            className={cn(
              "w-6 h-6 transition-colors",
              progress >= 1 ? "text-accent-cyan" : "text-text-tertiary"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.2s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
