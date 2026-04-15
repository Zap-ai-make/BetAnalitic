"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export interface RoomCardProps {
  room: {
    id: string
    name: string
    badge?: string
    accentColor: string
    onlineCount: number
    memberCount: number
  }
  onClick?: () => void
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-lg p-4 cursor-pointer transition-all",
        "hover:bg-bg-tertiary border-l-4",
        "min-h-[44px]"
      )}
      onClick={onClick}
      style={{ borderLeftColor: `var(--color-${room.accentColor})` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {room.badge && <span className="text-xl">{room.badge}</span>}
          <h3 className="font-display font-semibold text-lg text-text-primary">
            {room.name}
          </h3>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
          </span>
          <span className="text-text-secondary text-sm">
            {room.onlineCount} online
          </span>
        </div>
        <span className="text-text-tertiary text-sm">
          {room.memberCount} membres
        </span>
      </div>
    </div>
  )
}
