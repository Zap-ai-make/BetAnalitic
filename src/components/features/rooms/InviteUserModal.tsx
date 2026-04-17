"use client"

/**
 * Invite User Modal
 * Story 6.11: Invite users to room by username
 */

import * as React from "react"
import { X, UserPlus, Search } from "lucide-react"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

interface InviteUserModalProps {
  roomId: string
  onClose: () => void
}

export function InviteUserModal({ roomId, onClose }: InviteUserModalProps) {
  const [username, setUsername] = React.useState("")
  const [error, setError] = React.useState("")

  const inviteMutation = api.room.inviteUser.useMutation({
    onSuccess: () => {
      setUsername("")
      setError("")
      alert("Utilisateur invité avec succès!")
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleInvite = () => {
    if (!username.trim()) {
      setError("Entrez un nom d'utilisateur")
      return
    }
    setError("")
    inviteMutation.mutate({ roomId, username: username.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bg-tertiary">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent-cyan" />
            <h2 className="font-display font-bold text-lg text-text-primary">Inviter un utilisateur</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nom d&apos;utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite()
                }}
                placeholder="@username"
                className={cn(
                  "w-full bg-bg-tertiary text-text-primary rounded-lg pl-10 pr-4 py-3",
                  "outline-none focus:ring-2 focus:ring-accent-cyan",
                  "placeholder:text-text-tertiary text-sm"
                )}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-bg-tertiary text-text-primary rounded-lg font-semibold text-sm hover:bg-bg-tertiary/70 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-colors",
                inviteMutation.isPending
                  ? "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                  : "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
              )}
            >
              {inviteMutation.isPending ? "Envoi..." : "Inviter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
