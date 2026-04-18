"use client"

/**
 * DebateArena Invocation Component
 * Story 8.1: Trigger debates with confirmation dialog
 */

import * as React from "react"
import { Swords, Sparkles, X } from "lucide-react"
import { cn } from "~/lib/utils"
import { useDebateArenaStore } from "~/stores/debateArena"
import type { DebateSession } from "~/stores/debateArena"
import { selectDebateAgents } from "~/lib/debate/agentSelection"
import type { DebateContext } from "~/lib/debate/agentSelection"

interface DebateArenaInvocationProps {
  matchId: string
  matchLabel: string
  onStart?: () => void
  className?: string
}

export function DebateArenaInvocation({
  matchId,
  matchLabel,
  onStart,
  className,
}: DebateArenaInvocationProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(false)
  const [selectedAgents, setSelectedAgents] = React.useState<{
    agent1: { id: string; name: string; color: string }
    agent2: { id: string; name: string; color: string }
  } | null>(null)
  const [isSelecting, setIsSelecting] = React.useState(false)

  const { startDebate, isDebating } = useDebateArenaStore()

  const handleInvoke = React.useCallback(async () => {
    setIsSelecting(true)

    // Story 8.2: Agent selection with animation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const context: DebateContext = {
      matchId,
      marketType: "general",
    }

    const { agent1, agent2 } = selectDebateAgents(context)

    setSelectedAgents({
      agent1: {
        id: agent1.id,
        name: agent1.name,
        color: agent1.color,
      },
      agent2: {
        id: agent2.id,
        name: agent2.name,
        color: agent2.color,
      },
    })

    setIsSelecting(false)
    setShowConfirmation(true)
  }, [matchId])

  const handleConfirm = React.useCallback(() => {
    if (!selectedAgents) return

    const session: DebateSession = {
      id: `debate-${Date.now()}`,
      matchId,
      matchLabel,
      agent1: selectedAgents.agent1,
      agent2: selectedAgents.agent2,
      topic: `Pronostic du match ${matchLabel}`,
      messages: [],
      status: "in-progress",
    }

    startDebate(session)
    setShowConfirmation(false)
    onStart?.()
  }, [selectedAgents, matchId, matchLabel, startDebate, onStart])

  const handleCancel = React.useCallback(() => {
    setShowConfirmation(false)
    setSelectedAgents(null)
  }, [])

  return (
    <>
      {/* Invoke Button */}
      <button
        onClick={handleInvoke}
        disabled={isDebating || isSelecting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all",
          "bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-primary",
          "hover:shadow-lg hover:scale-105",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          className
        )}
      >
        {isSelecting ? (
          <>
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Sélection des agents...</span>
          </>
        ) : (
          <>
            <Swords className="w-4 h-4" />
            <span>@DebateArena</span>
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && selectedAgents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative p-6 border-b border-bg-tertiary">
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                  <Swords className="w-6 h-6 text-bg-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-text-primary">
                    Débat Imminent
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    Confirmation requise
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Debate Info */}
              <div className="bg-bg-tertiary/30 rounded-lg p-4 border border-bg-tertiary">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📢</span>
                  <span className="font-bold text-text-primary">
                    Débat programmé
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  <span
                    className="font-bold"
                    style={{ color: selectedAgents.agent1.color }}
                  >
                    {selectedAgents.agent1.name}
                  </span>
                  {" vs "}
                  <span
                    className="font-bold"
                    style={{ color: selectedAgents.agent2.color }}
                  >
                    {selectedAgents.agent2.name}
                  </span>
                </p>
                <p className="text-sm text-text-tertiary mt-1">
                  sur {matchLabel}
                </p>
              </div>

              {/* Agent Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-tertiary/20 rounded-lg p-3 border border-bg-tertiary">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-bg-primary font-bold"
                    style={{ backgroundColor: selectedAgents.agent1.color }}
                  >
                    {selectedAgents.agent1.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-center text-text-primary">
                    {selectedAgents.agent1.name}
                  </p>
                  <p className="text-xs text-center text-text-tertiary">
                    Côté gauche
                  </p>
                </div>
                <div className="bg-bg-tertiary/20 rounded-lg p-3 border border-bg-tertiary">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-bg-primary font-bold"
                    style={{ backgroundColor: selectedAgents.agent2.color }}
                  >
                    {selectedAgents.agent2.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-center text-text-primary">
                    {selectedAgents.agent2.name}
                  </p>
                  <p className="text-xs text-center text-text-tertiary">
                    Côté droit
                  </p>
                </div>
              </div>

              {/* Info Note */}
              <p className="text-xs text-text-tertiary text-center">
                Le débat durera environ 2-3 minutes. Les interactions seront
                bloquées pendant le débat.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-bg-tertiary">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-accent-cyan to-accent-purple text-bg-primary hover:shadow-lg transition-all"
              >
                Lancer le débat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
