"use client"

/**
 * Story 6.12: Content Reporting
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { Flag, X, AlertTriangle, Check } from "lucide-react"

type ReportReason =
  | "spam"
  | "harassment"
  | "misinformation"
  | "illegal"
  | "other"

interface ReportMessageProps {
  messageId: string
  messageContent: string
  authorName: string
  onReport: (
    messageId: string,
    reason: ReportReason,
    details?: string
  ) => Promise<void>
  className?: string
}

const REPORT_REASONS: { value: ReportReason; label: string; icon: string }[] = [
  { value: "spam", label: "Spam ou publicité", icon: "📢" },
  { value: "harassment", label: "Harcèlement ou insultes", icon: "🚫" },
  { value: "misinformation", label: "Désinformation", icon: "⚠️" },
  { value: "illegal", label: "Contenu illégal", icon: "🔒" },
  { value: "other", label: "Autre raison", icon: "📝" },
]

export function ReportMessage({
  messageId,
  messageContent,
  authorName,
  onReport,
  className,
}: ReportMessageProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedReason, setSelectedReason] = React.useState<ReportReason | null>(null)
  const [details, setDetails] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async () => {
    if (!selectedReason) return

    setIsSubmitting(true)
    try {
      await onReport(messageId, selectedReason, details || undefined)
      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setSelectedReason(null)
        setDetails("")
      }, 2000)
    } catch {
      // Handle silently
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "p-1.5 rounded text-text-tertiary hover:text-accent-red",
          "hover:bg-accent-red/10 transition-colors",
          "opacity-0 group-hover:opacity-100",
          className
        )}
        title="Signaler ce message"
      >
        <Flag className="w-3.5 h-3.5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Content */}
          <div className="relative w-full max-w-md bg-bg-secondary rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-tertiary">
              <div className="flex items-center gap-2 text-accent-red">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-semibold">Signaler un message</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-accent-green" />
                </div>
                <h4 className="font-display font-semibold text-text-primary mb-2">
                  Signalement envoyé
                </h4>
                <p className="text-sm text-text-secondary">
                  Merci pour votre signalement. Notre équipe va examiner ce message.
                </p>
              </div>
            ) : (
              <>
                {/* Message preview */}
                <div className="px-6 py-4 bg-bg-tertiary/50">
                  <p className="text-xs text-text-tertiary mb-1">
                    Message de {authorName}
                  </p>
                  <p className="text-sm text-text-primary line-clamp-2">
                    {messageContent}
                  </p>
                </div>

                {/* Reasons */}
                <div className="p-6 space-y-3">
                  <p className="text-sm font-medium text-text-primary mb-3">
                    Raison du signalement
                  </p>

                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setSelectedReason(reason.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                        "text-left transition-colors",
                        selectedReason === reason.value
                          ? "bg-accent-red/10 border-2 border-accent-red/50"
                          : "bg-bg-tertiary hover:bg-bg-tertiary/80 border-2 border-transparent"
                      )}
                    >
                      <span className="text-lg">{reason.icon}</span>
                      <span className="text-sm text-text-primary">
                        {reason.label}
                      </span>
                    </button>
                  ))}

                  {selectedReason === "other" && (
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Décrivez le problème..."
                      className={cn(
                        "w-full px-4 py-3 bg-bg-tertiary rounded-xl",
                        "text-text-primary placeholder:text-text-tertiary",
                        "resize-none h-24",
                        "focus:outline-none focus:ring-2 focus:ring-accent-red/50"
                      )}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 py-4 border-t border-bg-tertiary">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-bg-tertiary text-text-primary font-medium hover:bg-bg-tertiary/80 transition-colors min-h-[44px]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedReason || isSubmitting}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl font-medium min-h-[44px]",
                      "transition-colors",
                      selectedReason && !isSubmitting
                        ? "bg-accent-red text-white hover:bg-accent-red/80"
                        : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? "Envoi..." : "Signaler"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
