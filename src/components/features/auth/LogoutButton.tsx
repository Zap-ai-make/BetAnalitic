"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { clearLocalData } from "~/lib/logout"
import { cn } from "~/lib/utils"

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // Clear all local data first
      await clearLocalData()

      // Sign out via Auth.js - redirect handled by signOut
      await signOut({ redirect: false })

      // Replace history to prevent back navigation
      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-text-primary text-center">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmation(false)}
            disabled={isLoggingOut}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium",
              "bg-bg-tertiary text-text-primary",
              "hover:bg-bg-tertiary/80 transition-colors",
              "min-h-[48px]",
              "disabled:opacity-50"
            )}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-medium",
              "bg-accent-red text-white",
              "hover:bg-accent-red/90 transition-colors",
              "min-h-[48px]",
              "disabled:opacity-50"
            )}
          >
            {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirmation(true)}
      className={cn(
        "w-full flex items-center justify-center gap-3 p-4",
        "text-accent-red hover:bg-accent-red/10",
        "transition-colors min-h-[56px]"
      )}
    >
      <span className="text-xl">🚪</span>
      <span className="font-medium">Se déconnecter</span>
    </button>
  )
}
