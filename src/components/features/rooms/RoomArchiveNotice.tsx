"use client"

/**
 * Story 6.14: Room Archival Notice
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Archive, Clock, AlertCircle } from "lucide-react"

interface RoomArchiveNoticeProps {
  roomName: string
  archiveDate: Date
  messageCount: number
  reason?: "inactivity" | "manual" | "expired"
  onRestore?: () => Promise<void>
  canRestore?: boolean
  className?: string
}

export function RoomArchiveNotice({
  roomName: _roomName,
  archiveDate,
  messageCount,
  reason = "inactivity",
  onRestore,
  canRestore = false,
  className,
}: RoomArchiveNoticeProps) {
  const [isRestoring, setIsRestoring] = React.useState(false)

  const reasonText = {
    inactivity: "Ce salon a été archivé pour inactivité.",
    manual: "Ce salon a été archivé par un modérateur.",
    expired: "Ce salon a expiré (événement terminé).",
  }

  const handleRestore = async () => {
    if (!onRestore) return
    setIsRestoring(true)
    try {
      await onRestore()
    } catch {
      // Handle error silently
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div
      className={cn(
        "p-6 bg-bg-secondary border border-bg-tertiary rounded-2xl",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-bg-tertiary rounded-xl">
          <Archive className="w-6 h-6 text-text-tertiary" />
        </div>

        <div className="flex-1">
          <h3 className="font-display font-semibold text-text-primary mb-1">
            Salon archivé
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {reasonText[reason]}
          </p>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Clock className="w-4 h-4" />
              <span>
                Archivé le{" "}
                {archiveDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-text-tertiary">
              <AlertCircle className="w-4 h-4" />
              <span>{messageCount} messages conservés</span>
            </div>
          </div>

          {canRestore && onRestore && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={isRestoring}
              className={cn(
                "mt-4 px-4 py-2 rounded-lg font-medium text-sm",
                "bg-accent-cyan text-bg-primary",
                "hover:bg-accent-cyan/80 transition-colors",
                "min-h-[44px]",
                isRestoring && "opacity-50 cursor-not-allowed"
              )}
            >
              {isRestoring ? "Restauration..." : "Restaurer le salon"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Story 6.14: Room Archival Warning
 * Shown when room is about to be archived
 */
interface RoomArchiveWarningProps {
  daysUntilArchive: number
  lastActivityDate: Date
  onDismiss?: () => void
  className?: string
}

export function RoomArchiveWarning({
  daysUntilArchive,
  lastActivityDate,
  onDismiss,
  className,
}: RoomArchiveWarningProps) {
  if (daysUntilArchive > 7) return null

  return (
    <div
      className={cn(
        "p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-xl",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          <p className="text-sm text-text-primary">
            <strong>Archivage prévu</strong> — Ce salon sera archivé dans{" "}
            {daysUntilArchive} jour{daysUntilArchive > 1 ? "s" : ""} pour
            inactivité.
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Dernière activité:{" "}
            {lastActivityDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-text-tertiary hover:text-text-primary text-sm"
          >
            OK
          </button>
        )}
      </div>
    </div>
  )
}
