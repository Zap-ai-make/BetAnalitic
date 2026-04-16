"use client"

import * as React from "react"
import { Header } from "~/components/shared/Header"
import { DashboardNav } from "~/components/shared/DashboardNav"
import { useCouponStore } from "~/lib/stores/couponStore"
import { cn } from "~/lib/utils"
import { Trash2, Send, Mic, Volume2, Pause } from "lucide-react"
import { Button } from "~/components/ui/button"
import { AGENTS } from "~/lib/agents/config"

interface ConversationMessage {
  id: string
  type: "user" | "agent"
  agentId?: string
  agentName?: string
  content: string
  timestamp: Date
  confidence?: number // 0-100
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
  const [showComparison, setShowComparison] = React.useState(false)
  const [accuracyModalAgent, setAccuracyModalAgent] = React.useState<string | null>(null)

  // User preferences
  const [expertiseLevel, setExpertiseLevel] = React.useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">("INTERMEDIATE")
  const [analysisDepth, setAnalysisDepth] = React.useState<"QUICK" | "STANDARD" | "DETAILED">("STANDARD")

  // Voice input
  const [isRecording, setIsRecording] = React.useState(false)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)

  // Text-to-Speech
  const [playingMessageId, setPlayingMessageId] = React.useState<string | null>(null)
  const [speechRate, setSpeechRate] = React.useState(1)
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)

  // Load preferences from localStorage
  React.useEffect(() => {
    const savedExpertiseLevel = localStorage.getItem("expertiseLevel") as typeof expertiseLevel | null
    const savedAnalysisDepth = localStorage.getItem("analysisDepth") as typeof analysisDepth | null
    if (savedExpertiseLevel) setExpertiseLevel(savedExpertiseLevel)
    if (savedAnalysisDepth) setAnalysisDepth(savedAnalysisDepth)
  }, [])

  // Filter agents based on input
  const filteredAgents = React.useMemo(() => {
    if (!agentInput.startsWith("@")) return []
    const query = agentInput.slice(1).toLowerCase()
    return AGENTS.filter((agent) =>
      agent.name.toLowerCase().includes(query)
    )
  }, [agentInput])

  // Get agent messages for comparison
  const agentMessages = React.useMemo(() => {
    return messages.filter((m) => m.type === "agent" && m.agentId)
  }, [messages])

  const uniqueAgentCount = React.useMemo(() => {
    const uniqueIds = new Set(agentMessages.map((m) => m.agentId))
    return uniqueIds.size
  }, [agentMessages])

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

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 80) {
      return {
        label: "Haute",
        bgColor: "bg-green-500/20",
        textColor: "text-green-500",
        borderColor: "border-green-500/30",
      }
    } else if (confidence >= 50) {
      return {
        label: "Moyenne",
        bgColor: "bg-yellow-500/20",
        textColor: "text-yellow-500",
        borderColor: "border-yellow-500/30",
      }
    } else {
      return {
        label: "Faible",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-500",
        borderColor: "border-orange-500/30",
      }
    }
  }

  const getAccuracyStyle = (accuracy: number) => {
    if (accuracy >= 70) {
      return {
        label: "Excellente",
        bgColor: "bg-green-500/20",
        textColor: "text-green-500",
        borderColor: "border-green-500/30",
      }
    } else if (accuracy >= 60) {
      return {
        label: "Bonne",
        bgColor: "bg-yellow-500/20",
        textColor: "text-yellow-500",
        borderColor: "border-yellow-500/30",
      }
    } else {
      return {
        label: "Moyenne",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-500",
        borderColor: "border-orange-500/30",
      }
    }
  }

  const getPersonalizedResponse = (
    agentEmoji: string,
    agentName: string,
    matchCount: number,
    currentMode: typeof mode,
    expertise: typeof expertiseLevel,
    depth: typeof analysisDepth
  ) => {
    const baseIntro = `${agentEmoji} Analyse de vos ${matchCount} match(s)`

    // Expertise level variations
    let expertiseContext = ""
    if (expertise === "BEGINNER") {
      expertiseContext = "\n\n📚 Mode Débutant: Je vais vous expliquer simplement les concepts clés et leurs implications pour vos paris."
    } else if (expertise === "EXPERT") {
      expertiseContext = "\n\n🎯 Analyse Experte: xG, PPDA, variance, tendances avancées. Données denses."
    }

    // Analysis depth variations
    let depthContext = ""
    if (depth === "QUICK") {
      depthContext = "\n\n⚡ Analyse Rapide: Points clés uniquement."
    } else if (depth === "DETAILED") {
      depthContext = "\n\n📊 Analyse Détaillée: Exploration approfondie de tous les facteurs."
    }

    // Mode variations
    const modeContext = currentMode === "analytique"
      ? "\n\n📈 Mode Analytique: Approche data-driven, statistiques objectives."
      : "\n\n⚽ Mode Supporter: Perspective passionnée, contexte émotionnel."

    return `${baseIntro}${expertiseContext}${depthContext}${modeContext}\n\n${agentName} (Mock): Réponse simulée. Backend à implémenter.`
  }

  const startRecording = () => {
    // Check browser support
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents
    const win = window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const SpeechRecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale. Veuillez utiliser Chrome, Edge ou Safari.")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const recognitionInstance = new SpeechRecognitionClass()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.lang = 'fr-FR'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.continuous = true
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.interimResults = true

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join('')

      // Auto-add @ if not present and not empty
      if (transcript.trim()) {
        const finalText = transcript.trim().startsWith('@') ? transcript.trim() : `@${transcript.trim()}`
        setAgentInput(finalText)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
      if (event.error === 'not-allowed') {
        alert("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.")
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    recognitionInstance.onend = () => {
      setIsRecording(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    recognitionInstance.start()
    setIsRecording(true)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    recognitionRef.current = recognitionInstance
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const startTTS = (messageId: string, content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop any current speech

      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = 'fr-FR'
      utterance.rate = speechRate

      utterance.onend = () => {
        setPlayingMessageId(null)
        utteranceRef.current = null
      }

      utterance.onerror = () => {
        setPlayingMessageId(null)
        utteranceRef.current = null
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setPlayingMessageId(messageId)
    } else {
      alert("Votre navigateur ne supporte pas la synthèse vocale")
    }
  }

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setPlayingMessageId(null)
      utteranceRef.current = null
    }
  }

  // Cleanup TTS on unmount
  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
        content: getPersonalizedResponse(
          agent?.emoji ?? "",
          agent?.name ?? "",
          matches.length,
          mode,
          expertiseLevel,
          analysisDepth
        ),
        timestamp: new Date(),
        confidence: Math.floor(Math.random() * 55) + 40, // Random 40-95
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
      if (!agent) continue

      await new Promise((resolve) => setTimeout(resolve, 800))

      const agentMessage: ConversationMessage = {
        id: `msg-${Date.now()}-${i}`,
        type: "agent",
        agentId: agent.id,
        agentName: agent.name,
        content: getPersonalizedResponse(
          agent.emoji,
          agent.name,
          matches.length,
          mode,
          expertiseLevel,
          analysisDepth
        ),
        timestamp: new Date(),
        confidence: Math.floor(Math.random() * 55) + 40,
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
      confidence: Math.floor(Math.random() * 20) + 75, // Higher for summary: 75-95
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
                      void handleInvokeAgent()
                    }
                  }}
                  placeholder="@AgentName"
                  className={cn(
                    "w-full px-4 py-3 pr-24 rounded-lg",
                    "bg-bg-secondary border-2 border-bg-tertiary",
                    "text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:border-accent-cyan",
                    "transition-colors"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isInvoking}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      isRecording
                        ? "bg-accent-red text-white animate-pulse"
                        : "text-text-secondary hover:text-accent-cyan hover:bg-bg-tertiary",
                      isInvoking && "opacity-50 cursor-not-allowed"
                    )}
                    title={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => void handleInvokeAgent()}
                    disabled={!selectedAgent || isInvoking}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      selectedAgent && !isInvoking
                        ? "text-accent-cyan hover:bg-accent-cyan/10"
                        : "text-text-tertiary cursor-not-allowed"
                    )}
                    title="Envoyer"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

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

              {/* Compare Agents Button */}
              {uniqueAgentCount >= 2 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowComparison(true)}
                  className="w-full mt-4"
                >
                  🔄 Comparer les agents ({uniqueAgentCount})
                </Button>
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
                            <button
                              onClick={() => setAccuracyModalAgent(message.agentId ?? null)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                            >
                              <span className="text-xl">
                                {AGENTS.find((a) => a.id === message.agentId)?.emoji}
                              </span>
                              <span className="font-display font-semibold text-text-primary text-sm group-hover:text-accent-cyan transition-colors">
                                {message.agentName}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (playingMessageId === message.id) {
                                  stopTTS()
                                } else {
                                  startTTS(message.id, message.content)
                                }
                              }}
                              className={cn(
                                "p-1.5 rounded-full transition-colors",
                                playingMessageId === message.id
                                  ? "bg-accent-cyan/20 text-accent-cyan"
                                  : "text-text-tertiary hover:text-accent-cyan"
                              )}
                              title={playingMessageId === message.id ? "Arrêter la lecture" : "Lire à haute voix"}
                            >
                              {playingMessageId === message.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </button>
                            {playingMessageId === message.id && (
                              <div className="flex items-center gap-1 ml-2">
                                {[0.75, 1, 1.5, 2].map((rate) => (
                                  <button
                                    key={rate}
                                    onClick={() => {
                                      setSpeechRate(rate)
                                      // Restart with new rate
                                      stopTTS()
                                      setTimeout(() => startTTS(message.id, message.content), 100)
                                    }}
                                    className={cn(
                                      "px-2 py-0.5 rounded text-xs",
                                      speechRate === rate
                                        ? "bg-accent-cyan text-bg-primary"
                                        : "text-text-tertiary hover:text-text-primary"
                                    )}
                                  >
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                            )}
                            {message.confidence !== undefined && (() => {
                              const style = getConfidenceStyle(message.confidence)
                              return (
                                <div
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                                    style.bgColor,
                                    style.textColor,
                                    style.borderColor
                                  )}
                                  title={`Confiance: ${message.confidence}% - ${style.label} confiance basée sur les données disponibles`}
                                >
                                  {message.confidence}%
                                </div>
                              )
                            })()}
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

      {/* Agent Comparison Modal */}
      {showComparison && agentMessages.length >= 2 && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowComparison(false)}
          />
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Comparaison des Agents
                </h3>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentMessages.map((message) => {
                  const agent = AGENTS.find((a) => a.id === message.agentId)
                  const style = message.confidence
                    ? getConfidenceStyle(message.confidence)
                    : null

                  return (
                    <div
                      key={message.id}
                      className="bg-bg-primary rounded-lg border border-bg-tertiary p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{agent?.emoji}</span>
                        <div className="flex-1">
                          <div className="font-display font-semibold text-text-primary">
                            {message.agentName}
                          </div>
                          <div className="text-xs text-text-tertiary">
                            {agent?.category}
                          </div>
                        </div>
                        {message.confidence !== undefined && style && (
                          <div
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border",
                              style.bgColor,
                              style.textColor,
                              style.borderColor
                            )}
                          >
                            {message.confidence}%
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Agreement Indicator */}
              {agentMessages.length >= 2 && (() => {
                const confidences = agentMessages
                  .filter((m) => m.confidence !== undefined)
                  .map((m) => m.confidence!)
                const avg =
                  confidences.reduce((a, b) => a + b, 0) / confidences.length
                const variance =
                  confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) /
                  confidences.length
                const stdDev = Math.sqrt(variance)

                return (
                  <div className="mt-4 p-4 bg-bg-tertiary rounded-lg">
                    <div className="text-sm font-medium text-text-primary mb-2">
                      Indicateur de consensus
                    </div>
                    <div className="text-xs text-text-secondary">
                      {stdDev < 10
                        ? "✅ Fort consensus - Les agents sont largement d'accord"
                        : stdDev < 20
                          ? "⚖️ Consensus modéré - Quelques différences d'opinions"
                          : "⚠️ Opinions divergentes - Analyses significativement différentes"}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Confiance moyenne: {avg.toFixed(1)}% (écart-type: {stdDev.toFixed(1)})
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {/* Historical Accuracy Modal */}
      {accuracyModalAgent && (() => {
        const agent = AGENTS.find((a) => a.id === accuracyModalAgent)
        const accuracy = agent?.historicalAccuracy

        return (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setAccuracyModalAgent(null)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg">
              <div className="bg-bg-secondary rounded-lg border border-bg-tertiary p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{agent?.emoji}</span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-text-primary">
                        {agent?.name}
                      </h3>
                      <p className="text-xs text-text-tertiary">{agent?.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAccuracyModalAgent(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {!accuracy || accuracy.totalPredictions < 30 ? (
                  <div className="bg-bg-primary rounded-lg p-4 text-center">
                    <p className="text-text-secondary text-sm">
                      ⏳ Données insuffisantes
                    </p>
                    <p className="text-text-tertiary text-xs mt-1">
                      {accuracy?.totalPredictions ?? 0} prédictions (minimum 30 requis)
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Overall Accuracy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">
                          Précision Globale
                        </span>
                        {(() => {
                          const style = getAccuracyStyle(accuracy.overallAccuracy)
                          return (
                            <div
                              className={cn(
                                "px-3 py-1 rounded-full text-sm font-semibold border-2",
                                style.bgColor,
                                style.textColor,
                                style.borderColor
                              )}
                            >
                              {accuracy.overallAccuracy}%
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Recent Form */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">
                          Forme Récente (30j)
                        </span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const trend =
                              accuracy.recentForm > accuracy.overallAccuracy
                                ? "↑"
                                : accuracy.recentForm < accuracy.overallAccuracy
                                  ? "↓"
                                  : "→"
                            const trendColor =
                              trend === "↑"
                                ? "text-green-500"
                                : trend === "↓"
                                  ? "text-orange-500"
                                  : "text-text-tertiary"
                            return (
                              <>
                                <span className={cn("text-lg", trendColor)}>
                                  {trend}
                                </span>
                                <span className="text-text-primary font-semibold">
                                  {accuracy.recentForm}%
                                </span>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Prediction Breakdown */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-text-secondary">
                        Détail par Type de Prédiction
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Résultat", value: accuracy.predictionBreakdown.result },
                          { label: "Buts", value: accuracy.predictionBreakdown.goals },
                          { label: "Corners", value: accuracy.predictionBreakdown.corners },
                          { label: "Cartes", value: accuracy.predictionBreakdown.cards },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="bg-bg-primary rounded-lg p-3 border border-bg-tertiary"
                          >
                            <div className="text-xs text-text-tertiary mb-1">
                              {item.label}
                            </div>
                            <div className="text-text-primary font-semibold">
                              {item.value}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Value Added */}
                    <div className="bg-bg-primary rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          Valeur ajoutée vs hasard (50%)
                        </span>
                        <span className="text-accent-cyan font-semibold">
                          +{(accuracy.overallAccuracy - 50).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {accuracy.totalPredictions} prédictions analysées
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )
      })()}

      <DashboardNav />
    </div>
  )
}
