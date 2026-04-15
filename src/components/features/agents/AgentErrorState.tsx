"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react"
import { getAgentRegistry } from "~/lib/agents/registry"
import { getFallbackAgents } from "~/lib/agents/retryManager"

interface AgentErrorStateProps {
  agentId: string
  error: string
  onRetry?: () => void
  onTryAlternative?: (agentId: string) => void
  isRetrying?: boolean
  className?: string
}

// User-friendly error messages
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  timeout: {
    title: "Temps de réponse dépassé",
    description: "L'agent met plus de temps que prévu. Réessayez ou essayez un autre agent.",
  },
  network: {
    title: "Problème de connexion",
    description: "Vérifiez votre connexion internet et réessayez.",
  },
  unavailable: {
    title: "Agent temporairement indisponible",
    description: "Cet agent est en maintenance. Essayez un agent alternatif.",
  },
  rate_limit: {
    title: "Trop de requêtes",
    description: "Attendez quelques instants avant de réessayer.",
  },
  default: {
    title: "Une erreur est survenue",
    description: "L'agent n'a pas pu traiter votre demande. Réessayez ou contactez le support.",
  },
}

function getErrorInfo(error: string): { title: string; description: string } {
  const lowerError = error.toLowerCase()

  if (lowerError.includes("timeout")) {
    return ERROR_MESSAGES.timeout!
  }
  if (lowerError.includes("network") || lowerError.includes("connection")) {
    return ERROR_MESSAGES.network!
  }
  if (lowerError.includes("unavailable") || lowerError.includes("maintenance")) {
    return ERROR_MESSAGES.unavailable!
  }
  if (lowerError.includes("rate") || lowerError.includes("limit")) {
    return ERROR_MESSAGES.rate_limit!
  }

  return ERROR_MESSAGES.default!
}

export function AgentErrorState({
  agentId,
  error,
  onRetry,
  onTryAlternative,
  isRetrying = false,
  className,
}: AgentErrorStateProps) {
  const registry = getAgentRegistry()
  const agent = registry.getById(agentId)
  const fallbackIds = getFallbackAgents(agentId)
  const fallbackAgents = fallbackIds
    .map((id) => registry.getById(id))
    .filter(Boolean)

  const errorInfo = getErrorInfo(error)

  return (
    <div
      className={cn(
        "bg-bg-secondary rounded-lg p-4 border-l-4 border-accent-red",
        className
      )}
    >
      {/* Error Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-accent-red/20 rounded-full">
          <AlertTriangle className="w-5 h-5 text-accent-red" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-semibold text-text-primary">
            {errorInfo.title}
          </h4>
          <p className="text-sm text-text-secondary mt-1">
            {errorInfo.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {/* Retry Button */}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-accent-cyan text-bg-primary",
              "font-display text-sm font-semibold",
              "min-h-[44px] transition-all",
              isRetrying
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent-cyan/80"
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRetrying && "animate-spin")}
            />
            {isRetrying ? "Nouvelle tentative..." : "Réessayer"}
          </button>
        )}

        {/* Contact Support */}
        <button
          type="button"
          onClick={() => window.open("/support", "_blank")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-bg-tertiary text-text-secondary",
            "font-display text-sm",
            "min-h-[44px] transition-colors",
            "hover:bg-bg-primary hover:text-text-primary"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Contacter le support
        </button>
      </div>

      {/* Alternative Agents */}
      {fallbackAgents.length > 0 && onTryAlternative && (
        <div className="mt-4 pt-4 border-t border-bg-tertiary">
          <p className="text-xs text-text-tertiary uppercase tracking-wide mb-3">
            Agents alternatifs suggérés
          </p>
          <div className="flex flex-wrap gap-2">
            {fallbackAgents.map((alt) => (
              <button
                key={alt!.id}
                type="button"
                onClick={() => onTryAlternative(alt!.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  "bg-bg-tertiary",
                  "min-h-[44px] transition-colors",
                  "hover:bg-bg-primary"
                )}
              >
                <span className="text-lg">{alt!.emoji}</span>
                <span
                  className="font-display text-sm font-medium"
                  style={{ color: alt!.color }}
                >
                  {alt!.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Original agent info */}
      {agent && (
        <div className="mt-3 text-xs text-text-tertiary">
          Agent: {agent.emoji} {agent.name}
        </div>
      )}
    </div>
  )
}
