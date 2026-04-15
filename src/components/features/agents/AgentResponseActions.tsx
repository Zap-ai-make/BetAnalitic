"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Copy, Share2, Check } from "lucide-react"

interface AgentResponseActionsProps {
  responseText: string
  agentName: string
  matchContext?: {
    homeTeam: string
    awayTeam: string
  }
  className?: string
}

export function AgentResponseActions({
  responseText,
  agentName,
  matchContext,
  className,
}: AgentResponseActionsProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(responseText)
      setCopied(true)

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = async () => {
    // Format text for sharing
    const shareTitle = matchContext
      ? `Analyse ${agentName} - ${matchContext.homeTeam} vs ${matchContext.awayTeam}`
      : `Analyse par ${agentName}`

    const shareText = `${shareTitle}\n\n${responseText}\n\n— via BetAnalytic`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        })
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err)
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "min-w-[44px] min-h-[44px] flex items-center justify-center",
          copied
            ? "bg-accent-green/20 text-accent-green"
            : "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"
        )}
        aria-label={copied ? "Copié !" : "Copier la réponse"}
        title={copied ? "Copié !" : "Copier"}
      >
        {copied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "min-w-[44px] min-h-[44px] flex items-center justify-center",
          "text-text-tertiary hover:text-accent-cyan hover:bg-accent-cyan/10"
        )}
        aria-label="Partager la réponse"
        title="Partager"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Copied Toast */}
      {copied && (
        <span className="text-xs text-accent-green ml-1 animate-in fade-in-0 duration-200">
          Copié !
        </span>
      )}
    </div>
  )
}
