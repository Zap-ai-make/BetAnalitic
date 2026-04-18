"use client"

/**
 * Expert Custom DebateArena Creator
 * Story 8.6: Expert-tier custom debate scenarios
 */

import * as React from "react"
import { Swords, X, Sparkles, Crown } from "lucide-react"
import { cn } from "~/lib/utils"
import { useDebateArenaStore } from "~/stores/debateArena"
import { DEBATE_AGENTS } from "~/lib/debate/agentSelection"
import type { DebateSession } from "~/stores/debateArena"

interface ExpertDebateCreatorProps {
  matchId?: string
  matchLabel?: string
  isExpert: boolean
  onClose?: () => void
}

export function ExpertDebateCreator({
  matchId = "match-1",
  matchLabel = "Match de test",
  isExpert,
  onClose,
}: ExpertDebateCreatorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedAgent1, setSelectedAgent1] = React.useState<string | null>(null)
  const [selectedAgent2, setSelectedAgent2] = React.useState<string | null>(null)
  const [topic, setTopic] = React.useState("")
  const [showUpsell, setShowUpsell] = React.useState(false)

  const { startDebate } = useDebateArenaStore()

  const handleOpen = () => {
    if (!isExpert) {
      setShowUpsell(true)
      return
    }
    setIsOpen(true)
  }

  const handleCreate = () => {
    if (!selectedAgent1 || !selectedAgent2 || !topic) return

    const agent1 = DEBATE_AGENTS.find((a) => a.id === selectedAgent1)!
    const agent2 = DEBATE_AGENTS.find((a) => a.id === selectedAgent2)!

    const session: DebateSession = {
      id: `expert-debate-${Date.now()}`,
      matchId,
      matchLabel,
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
      topic,
      messages: [],
      status: "in-progress",
    }

    startDebate(session)
    setIsOpen(false)
    onClose?.()
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-linear-to-r from-accent-gold to-accent-orange text-bg-primary hover:shadow-lg hover:scale-105 transition-all"
      >
        <Crown className="w-4 h-4" />
        <span>Débat Personnalisé</span>
      </button>

      {/* Expert Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-secondary rounded-2xl shadow-2xl border border-accent-gold/30 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-accent-gold to-accent-orange flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-bg-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-2">
                Fonctionnalité Expert
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Les débats personnalisés sont réservés aux utilisateurs du Programme
                Expert. Créez vos propres scénarios de débat et partagez-les avec
                votre audience.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span>Sélection d&apos;agents personnalisée</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span>Définition du sujet de débat</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  <span>Publication dans votre salle</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpsell(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70 transition-colors"
                >
                  Fermer
                </button>
                <button className="flex-1 px-4 py-2 rounded-lg font-semibold bg-linear-to-r from-accent-gold to-accent-orange text-bg-primary hover:shadow-lg transition-all">
                  Devenir Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Debate Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-bg-secondary border-b border-bg-tertiary p-6 z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-accent-gold to-accent-orange flex items-center justify-center">
                  <Swords className="w-6 h-6 text-bg-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-text-primary">
                    Créer un Débat
                  </h3>
                  <p className="text-sm text-text-tertiary">Scénario personnalisé</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Sujet du débat
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Prédiction Over 2.5 buts"
                  className="w-full px-4 py-2 rounded-lg bg-bg-tertiary border border-bg-tertiary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              {/* Agent 1 Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Agent 1 (Côté gauche)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEBATE_AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent1(agent.id)}
                      disabled={selectedAgent2 === agent.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        selectedAgent1 === agent.id
                          ? "border-accent-cyan bg-accent-cyan/10"
                          : "border-bg-tertiary bg-bg-tertiary/50 hover:border-accent-cyan/50",
                        selectedAgent2 === agent.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-bg-primary font-bold text-sm"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {agent.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent 2 Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Agent 2 (Côté droit)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEBATE_AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent2(agent.id)}
                      disabled={selectedAgent1 === agent.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        selectedAgent2 === agent.id
                          ? "border-accent-purple bg-accent-purple/10"
                          : "border-bg-tertiary bg-bg-tertiary/50 hover:border-accent-purple/50",
                        selectedAgent1 === agent.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-bg-primary font-bold text-sm"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {agent.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {selectedAgent1 && selectedAgent2 && topic && (
                <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-text-primary mb-2">
                    Aperçu du débat
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span
                      className="font-bold"
                      style={{
                        color: DEBATE_AGENTS.find((a) => a.id === selectedAgent1)
                          ?.color,
                      }}
                    >
                      {DEBATE_AGENTS.find((a) => a.id === selectedAgent1)?.name}
                    </span>
                    {" vs "}
                    <span
                      className="font-bold"
                      style={{
                        color: DEBATE_AGENTS.find((a) => a.id === selectedAgent2)
                          ?.color,
                      }}
                    >
                      {DEBATE_AGENTS.find((a) => a.id === selectedAgent2)?.name}
                    </span>
                  </p>
                  <p className="text-sm text-text-tertiary mt-1">Sujet: {topic}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-bg-tertiary">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/70 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedAgent1 || !selectedAgent2 || !topic}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-linear-to-r from-accent-gold to-accent-orange text-bg-primary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer le Débat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
