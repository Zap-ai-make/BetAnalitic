"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Crown, Shield, Circle, MoreVertical, UserMinus } from "lucide-react"
import type { RoomMember, MemberRole } from "~/lib/realtime/types"

interface RoomMemberListProps {
  members: RoomMember[]
  currentUserId: string
  currentUserRole: MemberRole
  onRemoveMember?: (userId: string) => void
  onPromoteMember?: (userId: string, role: MemberRole) => void
  className?: string
}

const roleIcons: Record<MemberRole, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-accent-gold" />,
  admin: <Shield className="w-4 h-4 text-accent-cyan" />,
  member: null,
}

const roleLabels: Record<MemberRole, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  member: "Membre",
}

export function RoomMemberList({
  members,
  currentUserId,
  currentUserRole,
  onRemoveMember,
  onPromoteMember,
  className,
}: RoomMemberListProps) {
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null)

  // Sort: online first, then by role
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1
    const roleOrder = { owner: 0, admin: 1, member: 2 }
    return roleOrder[a.role] - roleOrder[b.role]
  })

  const canManage = currentUserRole === "owner" || currentUserRole === "admin"

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          Membres ({members.length})
        </span>
        <span className="text-xs text-text-tertiary">
          {members.filter((m) => m.isOnline).length} en ligne
        </span>
      </div>

      {sortedMembers.map((member) => {
        const isCurrentUser = member.userId === currentUserId
        const canManageMember =
          canManage &&
          !isCurrentUser &&
          member.role !== "owner" &&
          (currentUserRole === "owner" || member.role === "member")

        return (
          <div
            key={member.userId}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              "hover:bg-bg-tertiary transition-colors"
            )}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-lg">
                {member.userAvatar ?? member.userName.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              <Circle
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5",
                  member.isOnline
                    ? "fill-accent-green text-accent-green"
                    : "fill-text-tertiary text-text-tertiary"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary truncate">
                  {member.userName}
                </span>
                {roleIcons[member.role]}
                {isCurrentUser && (
                  <span className="text-xs text-text-tertiary">(vous)</span>
                )}
              </div>
              <p className="text-xs text-text-tertiary">
                {roleLabels[member.role]}
              </p>
            </div>

            {/* Actions */}
            {canManageMember && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(menuOpen === member.userId ? null : member.userId)
                  }
                  className={cn(
                    "p-2 rounded-lg text-text-tertiary hover:text-text-primary",
                    "hover:bg-bg-secondary transition-colors",
                    "min-w-[44px] min-h-[44px] flex items-center justify-center"
                  )}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {menuOpen === member.userId && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-50">
                    {currentUserRole === "owner" && member.role === "member" && (
                      <button
                        type="button"
                        onClick={() => {
                          onPromoteMember?.(member.userId, "admin")
                          setMenuOpen(null)
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Promouvoir admin
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveMember?.(member.userId)
                        setMenuOpen(null)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-accent-red hover:bg-bg-tertiary flex items-center gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      Retirer du salon
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
