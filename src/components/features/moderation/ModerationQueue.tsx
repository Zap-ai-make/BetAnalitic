"use client"

/**
 * Story 14.1: Moderation Queue
 * Admin moderation interface for reported content
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Flag, Check, X, MessageSquare, User, Clock, AlertTriangle } from "lucide-react"

type ReportType = "message" | "user" | "room" | "prediction"
type ReportStatus = "pending" | "resolved" | "dismissed"

interface Report {
  id: string
  type: ReportType
  targetId: string
  targetContent: string
  reportedBy: string
  reporterName: string
  reason: string
  details?: string
  createdAt: Date
  status: ReportStatus
}

interface ModerationQueueProps {
  reports: Report[]
  onApprove: (reportId: string) => Promise<void>
  onDismiss: (reportId: string) => Promise<void>
  onViewDetails: (reportId: string) => void
  className?: string
}

const typeConfig: Record<ReportType, { icon: typeof MessageSquare; label: string; color: string }> = {
  message: { icon: MessageSquare, label: "Message", color: "text-accent-cyan" },
  user: { icon: User, label: "Utilisateur", color: "text-accent-orange" },
  room: { icon: Flag, label: "Salon", color: "text-accent-purple" },
  prediction: { icon: AlertTriangle, label: "Pronostic", color: "text-accent-red" },
}

export function ModerationQueue({
  reports,
  onApprove,
  onDismiss,
  onViewDetails: _onViewDetails,
  className,
}: ModerationQueueProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await onApprove(id)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDismiss = async (id: string) => {
    setProcessingId(id)
    try {
      await onDismiss(id)
    } finally {
      setProcessingId(null)
    }
  }

  const pendingReports = reports.filter((r) => r.status === "pending")

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-text-primary">
          File de modération
        </h2>
        <span className="px-3 py-1 bg-accent-red/20 text-accent-red text-sm font-medium rounded-full">
          {pendingReports.length} en attente
        </span>
      </div>

      {pendingReports.length === 0 ? (
        <div className="p-8 bg-bg-secondary rounded-xl text-center">
          <Check className="w-12 h-12 text-accent-green mx-auto mb-3" />
          <p className="text-text-primary font-medium">Tout est en ordre !</p>
          <p className="text-sm text-text-tertiary mt-1">
            Aucun signalement en attente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingReports.map((report) => {
            const config = typeConfig[report.type]
            const Icon = config.icon
            const isProcessing = processingId === report.id

            return (
              <div
                key={report.id}
                className="p-4 bg-bg-secondary rounded-xl border border-bg-tertiary"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg bg-bg-tertiary", config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-tertiary">
                        {config.label}
                      </span>
                      <span className="text-text-tertiary">•</span>
                      <span className="text-xs text-text-tertiary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(report.createdAt)}
                      </span>
                    </div>

                    <p className="text-text-primary line-clamp-2 mb-2">
                      {report.targetContent}
                    </p>

                    <p className="text-sm text-text-secondary">
                      <strong className="text-accent-orange">{report.reason}</strong>
                      {report.details && ` — ${report.details}`}
                    </p>

                    <p className="text-xs text-text-tertiary mt-2">
                      Signalé par {report.reporterName}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(report.id)}
                      disabled={isProcessing}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        "bg-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white",
                        isProcessing && "opacity-50 cursor-not-allowed"
                      )}
                      title="Supprimer le contenu"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismiss(report.id)}
                      disabled={isProcessing}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        "bg-bg-tertiary text-text-tertiary hover:text-text-primary",
                        isProcessing && "opacity-50 cursor-not-allowed"
                      )}
                      title="Rejeter le signalement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}j`
}

/**
 * Story 14.2: User Ban Card
 */
interface UserBanCardProps {
  userId: string
  userName: string
  userAvatar?: string
  reason: string
  bannedAt: Date
  expiresAt?: Date
  bannedBy: string
  onUnban?: () => Promise<void>
  className?: string
}

export function UserBanCard({
  userName,
  userAvatar,
  reason,
  bannedAt,
  expiresAt,
  bannedBy,
  onUnban,
  className,
}: UserBanCardProps) {
  const [isUnbanning, setIsUnbanning] = React.useState(false)
  const isPermanent = !expiresAt
  const isExpired = expiresAt && expiresAt < new Date()

  const handleUnban = async () => {
    if (!onUnban) return
    setIsUnbanning(true)
    try {
      await onUnban()
    } finally {
      setIsUnbanning(false)
    }
  }

  return (
    <div className={cn("p-4 bg-bg-secondary rounded-xl border border-accent-red/30", className)}>
      <div className="flex items-center gap-3 mb-3">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center text-accent-red font-bold">
            {userName.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-text-primary">{userName}</p>
          <p className="text-xs text-accent-red">
            {isPermanent ? "Banni définitivement" : isExpired ? "Ban expiré" : "Banni temporairement"}
          </p>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-2">
        <strong>Raison:</strong> {reason}
      </p>

      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          Banni le {bannedAt.toLocaleDateString("fr-FR")} par {bannedBy}
        </span>
        {expiresAt && !isExpired && (
          <span>Expire le {expiresAt.toLocaleDateString("fr-FR")}</span>
        )}
      </div>

      {onUnban && (
        <button
          type="button"
          onClick={handleUnban}
          disabled={isUnbanning}
          className="mt-3 w-full py-2 bg-bg-tertiary text-text-primary rounded-lg text-sm font-medium hover:bg-accent-green hover:text-white transition-colors"
        >
          {isUnbanning ? "Débannissement..." : "Débannir"}
        </button>
      )}
    </div>
  )
}
