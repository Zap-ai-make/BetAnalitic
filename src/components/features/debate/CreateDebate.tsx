"use client"

/**
 * Story 8.6: Create Debate Modal
 */

import * as React from "react"
import { cn } from "~/lib/utils"
import { X } from "lucide-react"

interface Agent {
  id: string
  name: string
  color: string
  specialty: string
}

interface CreateDebateProps {
  isOpen: boolean
  onClose: () => void
  availableAgents: Agent[]
  onSubmit: (data: {
    topic: string
    matchId?: string
    forAgents: string[]
    againstAgents: string[]
    duration: number
  }) => Promise<void>
  className?: string
}

export function CreateDebate({
  isOpen,
  onClose,
  availableAgents,
  onSubmit,
  className,
}: CreateDebateProps) {
  const [topic, setTopic] = React.useState("")
  const [forAgents, setForAgents] = React.useState<string[]>([])
  const [againstAgents, setAgainstAgents] = React.useState<string[]>([])
  const [duration, setDuration] = React.useState(30)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [step, setStep] = React.useState(1)

  const handleSubmit = async () => {
    if (!topic || forAgents.length === 0 || againstAgents.length === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        topic,
        forAgents,
        againstAgents,
        duration,
      })
      onClose()
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAgent = (agentId: string, side: "for" | "against") => {
    if (side === "for") {
      if (forAgents.includes(agentId)) {
        setForAgents(forAgents.filter((id) => id !== agentId))
      } else {
        setForAgents([...forAgents, agentId])
        setAgainstAgents(againstAgents.filter((id) => id !== agentId))
      }
    } else {
      if (againstAgents.includes(agentId)) {
        setAgainstAgents(againstAgents.filter((id) => id !== agentId))
      } else {
        setAgainstAgents([...againstAgents, agentId])
        setForAgents(forAgents.filter((id) => id !== agentId))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg bg-bg-secondary rounded-2xl shadow-xl",
          "max-h-[90vh] overflow-hidden flex flex-col",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-tertiary">
          <h2 className="font-display font-semibold text-text-primary">
            Créer un débat
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-tertiary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Sujet du débat
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: PSG va-t-il remporter la Ligue des Champions cette saison ?"
                  className={cn(
                    "w-full px-4 py-3 bg-bg-tertiary rounded-xl",
                    "text-text-primary placeholder:text-text-tertiary",
                    "resize-none h-24",
                    "focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  )}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Durée du débat
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        duration === mins
                          ? "bg-accent-cyan text-bg-primary"
                          : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                Sélectionnez les agents qui débattront pour et contre le sujet.
              </p>

              {/* Agents Grid */}
              <div className="space-y-4">
                {availableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {agent.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {agent.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent.id, "for")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          forAgents.includes(agent.id)
                            ? "bg-accent-green text-white"
                            : "bg-bg-secondary text-text-tertiary hover:text-accent-green"
                        )}
                      >
                        POUR
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAgent(agent.id, "against")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          againstAgents.includes(agent.id)
                            ? "bg-accent-red text-white"
                            : "bg-bg-secondary text-text-tertiary hover:text-accent-red"
                        )}
                      >
                        CONTRE
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-accent-green/10 rounded-xl">
                  <p className="text-xs text-accent-green font-medium mb-2">
                    POUR ({forAgents.length})
                  </p>
                  {forAgents.length === 0 ? (
                    <p className="text-xs text-text-tertiary">Aucun agent</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {forAgents.map((id) => {
                        const agent = availableAgents.find((a) => a.id === id)
                        return agent ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-bg-secondary rounded text-xs"
                          >
                            {agent.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
                <div className="p-3 bg-accent-red/10 rounded-xl">
                  <p className="text-xs text-accent-red font-medium mb-2">
                    CONTRE ({againstAgents.length})
                  </p>
                  {againstAgents.length === 0 ? (
                    <p className="text-xs text-text-tertiary">Aucun agent</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {againstAgents.map((id) => {
                        const agent = availableAgents.find((a) => a.id === id)
                        return agent ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 bg-bg-secondary rounded text-xs"
                          >
                            {agent.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-bg-tertiary">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-xl bg-bg-tertiary text-text-primary font-medium hover:bg-bg-tertiary/80 transition-colors min-h-[44px]"
            >
              Retour
            </button>
          )}

          <button
            type="button"
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={
              step === 1
                ? !topic.trim()
                : forAgents.length === 0 || againstAgents.length === 0 || isSubmitting
            }
            className={cn(
              "flex-1 px-4 py-3 rounded-xl font-medium min-h-[44px]",
              "transition-colors",
              (step === 1 ? topic.trim() : forAgents.length > 0 && againstAgents.length > 0) &&
                !isSubmitting
                ? "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80"
                : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Création..." : step === 1 ? "Suivant" : "Lancer le débat"}
          </button>
        </div>
      </div>
    </div>
  )
}
