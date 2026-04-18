"use client"

/**
 * Epic 10 Story 10.2: Expert Application Review (Admin)
 * Admin interface to review and approve/reject expert applications
 */

import * as React from "react"
import { Check, X, ExternalLink, Calendar, User, FileText, Award } from "lucide-react"
import { cn } from "~/lib/utils"

interface ExpertApplicationReviewProps {
  application: {
    id: string
    userId: string
    user: {
      username: string
      email: string | null
      displayName: string | null
      subscriptionTier: string
      createdAt: Date
    }
    bio: string
    expertiseAreas: string[]
    socialProofLinks: string[]
    trackRecord: string
    certifications: string | null
    mediaAppearances: string | null
    status: "PENDING" | "APPROVED" | "REJECTED"
    submittedAt: Date
  }
  onApprove: (applicationId: string) => Promise<void>
  onReject: (applicationId: string, reason: string) => Promise<void>
  className?: string
}

export function ExpertApplicationReview({
  application,
  onApprove,
  onReject,
  className,
}: ExpertApplicationReviewProps) {
  const [showRejectModal, setShowRejectModal] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(application.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    setIsProcessing(true)
    try {
      await onReject(application.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason("")
    } finally {
      setIsProcessing(false)
    }
  }

  const daysSinceSubmission = Math.floor(
    (Date.now() - application.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <>
      <div className={cn("bg-bg-secondary rounded-2xl border border-bg-tertiary", className)}>
        {/* Header */}
        <div className="p-6 border-b border-bg-tertiary">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">
                  {application.user.displayName ?? application.user.username}
                </h3>
                <p className="text-sm text-text-tertiary">@{application.user.username}</p>
                {application.user.email && (
                  <p className="text-sm text-text-tertiary">{application.user.email}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full font-semibold">
                    {application.user.subscriptionTier}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    Membre depuis{" "}
                    {application.user.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-text-tertiary mb-1">
                <Calendar className="w-4 h-4" />
                <span>Il y a {daysSinceSubmission} jour{daysSinceSubmission > 1 ? "s" : ""}</span>
              </div>
              <div
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-bold",
                  application.status === "PENDING" &&
                    "bg-accent-orange/20 text-accent-orange",
                  application.status === "APPROVED" &&
                    "bg-accent-green/20 text-accent-green",
                  application.status === "REJECTED" && "bg-accent-red/20 text-accent-red"
                )}
              >
                {application.status === "PENDING" && "EN ATTENTE"}
                {application.status === "APPROVED" && "APPROUVÉ"}
                {application.status === "REJECTED" && "REJETÉ"}
              </div>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-cyan" />
              Bio
            </h4>
            <p className="text-sm text-text-secondary bg-bg-tertiary rounded-lg p-3">
              {application.bio}
            </p>
          </div>

          {/* Expertise Areas */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-cyan" />
              Domaines d&apos;expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {application.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Social Proof Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-accent-cyan" />
              Preuves sociales
            </h4>
            <div className="space-y-2">
              {application.socialProofLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-accent-cyan hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Track Record */}
          <div>
            <h4 className="font-semibold text-text-primary mb-2">Track Record</h4>
            <p className="text-sm text-text-secondary bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap">
              {application.trackRecord}
            </p>
          </div>

          {/* Certifications */}
          {application.certifications && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Certifications</h4>
              <p className="text-sm text-text-secondary bg-bg-tertiary rounded-lg p-3">
                {application.certifications}
              </p>
            </div>
          )}

          {/* Media Appearances */}
          {application.mediaAppearances && (
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Apparitions médias</h4>
              <p className="text-sm text-text-secondary bg-bg-tertiary rounded-lg p-3 whitespace-pre-wrap">
                {application.mediaAppearances}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {application.status === "PENDING" && (
          <div className="p-6 border-t border-bg-tertiary flex gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-bg-tertiary text-accent-red font-semibold hover:bg-accent-red/10 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 inline mr-2" />
              Rejeter
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-green to-accent-cyan text-bg-primary font-semibold hover:shadow-lg transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 inline mr-2" />
              {isProcessing ? "Traitement..." : "Approuver"}
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                Rejeter la candidature
              </h3>

              <p className="text-sm text-text-secondary mb-4">
                Veuillez fournir une raison pour le rejet. L&apos;utilisateur sera notifié.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Track record insuffisant, manque de preuves sociales..."
                rows={4}
                className={cn(
                  "w-full px-4 py-3 bg-bg-tertiary rounded-xl border border-bg-tertiary",
                  "text-text-primary placeholder:text-text-tertiary resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 mb-4"
                )}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-tertiary text-text-primary font-semibold hover:bg-bg-tertiary/70 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl font-semibold transition-colors",
                    rejectionReason.trim() && !isProcessing
                      ? "bg-accent-red text-bg-primary hover:bg-accent-red/80"
                      : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                  )}
                >
                  {isProcessing ? "Envoi..." : "Confirmer le rejet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
