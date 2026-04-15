"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

export type FeedbackType = "positive" | "negative" | null

interface AgentFeedbackProps {
  responseId: string
  onFeedback?: (responseId: string, type: FeedbackType, details?: string) => void
  className?: string
}

export function AgentFeedback({
  responseId,
  onFeedback,
  className,
}: AgentFeedbackProps) {
  const [feedback, setFeedback] = React.useState<FeedbackType>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [details, setDetails] = React.useState("")

  const handlePositive = () => {
    const newFeedback = feedback === "positive" ? null : "positive"
    setFeedback(newFeedback)
    if (newFeedback === "positive") {
      onFeedback?.(responseId, "positive")
      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const handleNegative = () => {
    if (feedback === "negative") {
      setFeedback(null)
    } else {
      setFeedback("negative")
      setShowModal(true)
      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const submitNegativeFeedback = () => {
    onFeedback?.(responseId, "negative", details || undefined)
    setShowModal(false)
    setDetails("")
  }

  const skipDetails = () => {
    onFeedback?.(responseId, "negative")
    setShowModal(false)
    setDetails("")
  }

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Thumbs Up */}
        <button
          type="button"
          onClick={handlePositive}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            feedback === "positive"
              ? "bg-accent-green/20 text-accent-green"
              : "text-text-tertiary hover:text-accent-green hover:bg-accent-green/10"
          )}
          aria-label="Réponse utile"
          title="Réponse utile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={feedback === "positive" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m7.744-9.75H15a.75.75 0 0 0 .75-.75V10a2.25 2.25 0 0 0-2.25-2.25h-2.25a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75h2.25a2.25 2.25 0 0 0 2.25-2.25v-.25a.75.75 0 0 0-.75-.75z"
            />
          </svg>
        </button>

        {/* Thumbs Down */}
        <button
          type="button"
          onClick={handleNegative}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            feedback === "negative"
              ? "bg-accent-red/20 text-accent-red"
              : "text-text-tertiary hover:text-accent-red hover:bg-accent-red/10"
          )}
          aria-label="Réponse pas utile"
          title="Réponse pas utile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={feedback === "negative" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 2.25 12c0-1.586.313-3.1.88-4.486a4.503 4.503 0 0 1 1.653-1.715 9.041 9.041 0 0 1 2.861-2.4A9.41 9.41 0 0 1 9.7 2.748c.498-.634 1.225-1.08 2.031-1.08h.25a.75.75 0 0 1 .75.75v.318c0 .576.113 1.146.322 1.672.303.759.93 1.331 1.653 1.715a9.04 9.04 0 0 1 2.861 2.4c.498.634 1.225 1.08 2.031 1.08h.25m-7.744 9.75v-5.25m0 5.25v.75a2.25 2.25 0 0 1-2.25 2.25H9a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h2.25"
            />
          </svg>
        </button>

        {/* Feedback status */}
        {feedback && (
          <span className="text-xs text-text-tertiary ml-1">
            {feedback === "positive" ? "Merci !" : "Feedback envoyé"}
          </span>
        )}
      </div>

      {/* Negative Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-bg-secondary rounded-xl p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
              Qu&apos;est-ce qui n&apos;allait pas ?
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Votre feedback nous aide à améliorer les agents.
            </p>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="La réponse était incorrecte, incomplète..."
              className={cn(
                "w-full bg-bg-tertiary rounded-lg px-4 py-3 resize-none",
                "font-body text-sm text-text-primary placeholder:text-text-tertiary",
                "border border-bg-tertiary focus:border-accent-cyan/50",
                "focus:outline-none transition-colors"
              )}
              rows={3}
            />

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={skipDetails}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg",
                  "bg-bg-tertiary text-text-secondary",
                  "font-display text-sm font-medium",
                  "transition-colors hover:bg-bg-primary",
                  "min-h-[44px]"
                )}
              >
                Ignorer
              </button>
              <button
                type="button"
                onClick={submitNegativeFeedback}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg",
                  "bg-accent-cyan text-bg-primary",
                  "font-display text-sm font-semibold",
                  "transition-colors hover:bg-accent-cyan/80",
                  "min-h-[44px]"
                )}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
