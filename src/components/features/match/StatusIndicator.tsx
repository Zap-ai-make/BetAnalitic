"use client"

import * as React from "react"

export interface StatusIndicatorProps {
  status: "live" | "upcoming" | "finished"
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "live") {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-red"></span>
        </span>
        <span className="font-display font-bold text-accent-red uppercase text-xs">
          LIVE
        </span>
      </div>
    )
  }

  if (status === "finished") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-3 w-3 rounded-full bg-text-tertiary"></span>
        <span className="font-display font-medium text-text-tertiary uppercase text-xs">
          Terminé
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-3 w-3 rounded-full bg-accent-cyan/50"></span>
      <span className="font-display font-medium text-text-secondary uppercase text-xs">
        Bientôt
      </span>
    </div>
  )
}
