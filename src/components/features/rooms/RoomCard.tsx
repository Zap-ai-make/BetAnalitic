"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Users, Circle } from "lucide-react"
import type { Room } from "~/lib/realtime/types"

interface RoomCardProps {
  room: Room
  onClick?: () => void
  isJoined?: boolean
  className?: string
}

export function RoomCard({ room, onClick, isJoined = false, className }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-bg-secondary rounded-xl text-left",
        "border-2 transition-all duration-200",
        isJoined
          ? "border-accent-cyan/30"
          : "border-transparent hover:border-accent-cyan/20",
        "hover:bg-bg-tertiary",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Room Badge/Color */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${room.color}20` }}
        >
          {room.badge ?? "💬"}
        </div>

        {/* Room Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-text-primary truncate">
              {room.name}
            </h3>
            {room.type === "official" && (
              <span className="px-1.5 py-0.5 bg-accent-cyan/20 text-accent-cyan text-xs rounded">
                Officiel
              </span>
            )}
            {isJoined && (
              <span className="px-1.5 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded">
                Rejoint
              </span>
            )}
          </div>

          {room.description && (
            <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">
              {room.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <Circle className="w-2 h-2 fill-accent-green text-accent-green" />
              <span>{room.onlineCount} en ligne</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <Users className="w-3 h-3" />
              <span>{room.memberCount} membres</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact version for lists
export function RoomCardCompact({
  room,
  onClick,
  className,
}: Omit<RoomCardProps, "isJoined">) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2 bg-bg-secondary rounded-lg",
        "flex items-center gap-3 text-left",
        "hover:bg-bg-tertiary transition-colors",
        className
      )}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${room.color}20` }}
      >
        {room.badge ?? "💬"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display font-medium text-text-primary text-sm truncate">
          {room.name}
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs text-text-tertiary">
        <Circle className="w-2 h-2 fill-accent-green text-accent-green" />
        <span>{room.onlineCount}</span>
      </div>
    </button>
  )
}
