"use client"

import * as React from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"
import { cn } from "~/lib/utils"
import { Trash2, Send } from "lucide-react"
import { Button } from "~/components/ui/button"
import { AGENTS } from "~/lib/agents/config"

interface ConversationMessage {
  id: string
  type: "user" | "agent"
  agentId?: string
  agentName?: string
  content: string
  timestamp: Date
}

export default function AnalysisPage() {
  const { matches, removeMatch, clearCoupon, mode, setMode } = useCouponStore()
  const [agentInput, setAgentInput] = React.useState("")
  const [showAgentSuggestions, setShowAgentSuggestions] = React.useState(false)
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ConversationMessage[]>([])
  const [isInvoking, setIsInvoking] = React.useState(false)
  const [isFullAnalysis, setIsFullAnalysis] = React.useState(false)
  const [fullAnalysisProgress, setFullAnalysisProgress] = React.useState(0)
  const [showFullAnalysisConfirm, setShowFullAnalysisConfirm] = React.useState(false)
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)

  // Filter agents based on input
  const filteredAgents = React.useMemo(() => {
    if (!agentInput.startsWith("@")) return []
    const query = agentInput.slice(1).toLowerCase()
    return AGENTS.filter((agent) =>
      agent.name.toLowerCase().includes(query)
    )
  }, [agentInput])

  React.useEffect(() => {
    setShowAgentSuggestions(
      agentInput.startsWith("@") && filteredAgents.length > 0
    )
  }, [agentInput, filteredAgents])

  const handleAgentSelect = (agentId: string, agentName: string) => {
    setSelectedAgent(agentId)
    setAgentInput(`@${agentName}`)
    setShowAgentSuggestions(false)
  }

  const handleInvokeAgent = async () => {
    if (!selectedAgent || matches.length === 0) return

    setIsInvoking(true)

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: agentInput,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate agent response (mock for now)
    setTimeout(() => {
      const agent = AGENTS.find((a) => a.id === selectedAgent)
      const agentMessage: ConversationMessage = {
        id: `msg-${Date.now() + 1}`,
        type: "agent",
        agentId: selectedAgent,
        agentName: agent?.name,
        content: `${agent?.emoji} Analyse de vos ${matches.length} match(s) en cours... (Mode: ${mode})\n\nRéponse simulée de ${agent?.name}. L'intégration backend sera ajoutée prochainement.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentMessage])
      setIsInvoking(false)
      setAgentInput("")
      setSelectedAgent(null)
    }, 1500)
  }

  const handleClearCoupon = () => {
    if (messages.length > 0) {
      setShowClearConfirm(true)
    } else {
      clearCoupon()
    }
  }

  const confirmClearCoupon = () => {
    clearCoupon()
    setMessages([])
    setShowClearConfirm(false)
  }

  const handleFullAnalysis = async () => {
    if (matches.length === 0) return

    setShowFullAnalysisConfirm(false)
    setIsFullAnalysis(true)
    setFullAnalysisProgress(0)

    const startTime = Date.now()

    // Add system message
    const systemMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: "⚡ Analyse Complète (14 agents)",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, systemMessage])

    // Invoke all agents sequentially
    for (let i = 0; i < AGENTS.length; i++) {
      const agent = AGENTS[i]

      await new Promise((resolve) => setTimeout(resolve, 800))

      const agentMessage: ConversationMessage = {
        id: `msg-${Date.now()}-${i}`,
        type: "agent",
        agentId: agent.id,
        agentName: agent.name,
        content: `${agent.emoji} Analyse ${agent.category} de vos ${matches.length} match(s)...\n\nRéponse simulée (mode ${mode}).`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentMessage])
      setFullAnalysisProgress(i + 1)
    }

    // Add summary message
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const summaryMessage: ConversationMessage = {
      id: `msg-summary-${Date.now()}`,
      type: "agent",
      agentId: "advisor",
      agentName: "Synthèse",
      content: `🎓 Analyse complète terminée en ${duration}s\n\n✅ ${AGENTS.length} agents consultés\n📊 ${matches.length} match(s) analysés\n\nRésumé des insights clés (backend à implémenter)`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, summaryMessage])

    setIsFullAnalysis(false)
    setFullAnalysisProgress(0)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />

      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-text-primary">
                Mon Coupon
              </h1>
              <p className={cn(
                "text-text-secondary text-sm",
                matches.length >= 10 && "text-accent-orange font-medium"
              )}>
                {matches.length} / 10 matchs sélectionnés
              </p>
            </div>
            {matches.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCoupon}
                className="text-accent-red hover:bg-accent-red/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider
              </Button>
            )}
          </div>

          {/* Mode Toggle */}
          {matches.length > 0 && (
            <div className="flex items-center gap-2 bg-bg-secondary rounded-lg p-1 w-fit">
              <button
                onClick={() => setMode("analytique")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  mode === "analytique"
                    ? "bg-accent-cyan text-bg-primary scale-105"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                📊 Analytique
              </button>
              <button
                onClick={() => setMode("supporter")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  mode === "supporter"
                    ? "bg-accent-cyan text-bg-primary scale-105"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                ⚽ Supporter
              </button>
            </div>
          )}

          {/* Agent Input with Autocomplete */}
          {matches.length > 0 && (
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-text-secondary">
                Interroger un agent spécifique
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedAgent) {
                      handleInvokeAgent()
                    }
                  }}
                  placeholder="@AgentName"
                  className={cn(
                    "w-full px-4 py-3 pr-12 rounded-lg",
                    "bg-bg-secondary border-2 border-bg-tertiary",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:border-accent-cyan",
                    "transition-colors"
                  )}
                />
                <button
                  onClick={handleInvokeAgent}
                  disabled={!selectedAgent || isInvoking}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    "p-2 rounded-full transition-colors",
                    selectedAgent && !isInvoking
                      ? "text-accent-cyan hover:bg-accent-cyan/10"
                      : "text-text-tertiary cursor-not-allowed"
                  )}
                >
                  <Send className="h-5 w-5" />
                </button>

                {/* Agent Autocomplete Dropdown */}
                {showAgentSuggestions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAgentSuggestions(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto">
                      {filteredAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent.id, agent.name)}
                          className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-start gap-3"
                        >
                          <span className="text-2xl">{agent.emoji}</span>
                          <div className="flex-1">
                            <div className="font-display font-semibold text-text-primary">
                              {agent.name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {agent.description}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">
                              {agent.category}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {matches.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="font-display text-lg font-semibold text-text-primary mb-2">
                Aucun match sélectionné
              </h2>
              <p className="text-text-secondary">
                Ajoutez des matchs depuis l&apos;onglet Matchs pour commencer votre analyse
              </p>
            </div>
          )}

          {/* Matches List */}
          {matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={cn(
                    "bg-bg-secondary rounded-lg p-4",
                    "border border-bg-tertiary",
                    "hover:border-accent-cyan/30 transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-text-primary">
                          {match.homeTeam}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-text-primary">
                          {match.awayTeam}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <span>{match.league}</span>
                        <span>•</span>
                        <span>{match.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMatch(match.id)}
                      className={cn(
                        "p-2 rounded-full",
                        "text-text-secondary hover:text-accent-red hover:bg-accent-red/10",
                        "transition-colors min-w-11 min-h-11"
                      )}
                      aria-label="Retirer du coupon"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Full Analysis Button */}
              <Button
                size="lg"
                onClick={() => setShowFullAnalysisConfirm(true)}
                className={cn(
                  "w-full mt-6",
                  "bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90",
                  "font-display font-semibold text-lg",
                  "min-h-14"
                )}
                disabled={matches.length === 0 || isFullAnalysis}
              >
                {isFullAnalysis
                  ? `⚡ Analyse en cours... ${fullAnalysisProgress}/${AGENTS.length}`
                  : "⚡ Analyse Complète (14 agents)"}
              </Button>

              {/* Full Analysis Confirmation Modal */}
              {showFullAnalysisConfirm && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowFullAnalysisConfirm(false)}
                  />
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
                    <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 space-y-4">
                      <h3 className="font-display text-lg font-bold text-text-primary">
                        Lancer l&apos;analyse complète ?
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Les {AGENTS.length} agents vont analyser vos {matches.length} match(s) en
                        mode <span className="font-semibold text-accent-cyan">{mode}</span>.
                      </p>
                      <div className="bg-bg-primary rounded-lg p-3 text-xs text-text-tertiary space-y-1">
                        <div>• Data ({AGENTS.filter((a) => a.category === "Data").length} agents)</div>
                        <div>• Analyse ({AGENTS.filter((a) => a.category === "Analyse").length} agents)</div>
                        <div>• Marché ({AGENTS.filter((a) => a.category === "Marché").length} agents)</div>
                        <div>• Intel ({AGENTS.filter((a) => a.category === "Intel").length} agents)</div>
                        <div>• Live ({AGENTS.filter((a) => a.category === "Live").length} agents)</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowFullAnalysisConfirm(false)}
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleFullAnalysis}
                          className="flex-1 bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90"
                        >
                          Lancer
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Conversation Thread */}
              <div className="mt-6 space-y-3">
                <h2 className="font-display font-semibold text-text-primary text-sm">
                  Historique des analyses
                </h2>
                <div className={cn(
                  "bg-bg-secondary rounded-lg p-4 border border-bg-tertiary",
                  "min-h-[200px] max-h-[500px] overflow-y-auto",
                  "space-y-3"
                )}>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-text-tertiary text-sm">
                      Aucune analyse effectuée pour ce coupon
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "rounded-lg p-3",
                          message.type === "user"
                            ? "bg-bg-tertiary ml-auto max-w-[80%]"
                            : "bg-bg-primary border border-bg-tertiary"
                        )}
                      >
                        {message.type === "agent" && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">
                              {AGENTS.find((a) => a.id === message.agentId)?.emoji}
                            </span>
                            <span className="font-display font-semibold text-text-primary text-sm">
                              {message.agentName}
                            </span>
                            <span className="text-xs text-text-tertiary ml-auto">
                              {message.timestamp.toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-text-primary whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.type === "user" && (
                          <div className="text-xs text-text-tertiary mt-1 text-right">
                            {message.timestamp.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isInvoking && (
                    <div className="rounded-lg p-3 bg-bg-primary border border-bg-tertiary">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                        <span className="text-sm text-text-secondary">
                          Agent en cours d&apos;analyse...
                        </span>
                      </div>
                    </div>
                  )}

                  {isFullAnalysis && (
                    <div className="rounded-lg p-4 bg-bg-primary border-2 border-accent-cyan/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display font-semibold text-text-primary">
                          ⚡ Analyse Complète
                        </span>
                        <span className="text-sm font-mono text-accent-cyan">
                          {fullAnalysisProgress}/{AGENTS.length}
                        </span>
                      </div>
                      <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-accent-cyan transition-all duration-300"
                          style={{
                            width: `${(fullAnalysisProgress / AGENTS.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clear Coupon Confirmation Modal */}
      {showClearConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
            <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-text-primary">
                Vider le coupon ?
              </h3>
              <p className="text-sm text-text-secondary">
                Vous avez {messages.length} message(s) dans l&apos;historique de conversation.
                Voulez-vous vraiment vider le coupon et effacer l&apos;historique ?
              </p>
              <div className="bg-bg-primary rounded-lg p-3 text-xs text-text-tertiary">
                💡 L&apos;historique sera perdu définitivement.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmClearCoupon}
                  className="flex-1 bg-accent-red text-white hover:bg-accent-red/90"
                >
                  Vider tout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <DashboardNav />
    </div>
  )
}
