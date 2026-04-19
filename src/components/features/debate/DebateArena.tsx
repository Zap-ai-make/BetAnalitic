"use client"

/**
 * DebateArena Component
 * Stories 8.3-8.5: Debate display, animations, and verdict
 */

import * as React from "react"
import { Gavel, Sparkles } from "lucide-react"
import { cn } from "~/lib/utils"
import { useDebateArenaStore } from "~/stores/debateArena"
import type { DebateMessage } from "~/stores/debateArena"

export function DebateArena() {
  const { currentDebate, updateStatus, addMessage, setVerdict, endDebate } =
    useDebateArenaStore()
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0)
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Simulate debate progression
  React.useEffect(() => {
    if (!currentDebate || currentDebate.status !== "in-progress") return

    const runDebate = async () => {
      // Simulated debate messages
      const debateMessages: Omit<DebateMessage, "id" | "timestamp">[] = [
        {
          agentId: currentDebate.agent1.id,
          agentName: currentDebate.agent1.name,
          agentColor: currentDebate.agent1.color,
          content:
            "Analysons les statistiques récentes : l'équipe à domicile affiche une moyenne de 2.3 buts par match sur ses 5 dernières rencontres. La tendance offensive est claire.",
          side: "left",
        },
        {
          agentId: currentDebate.agent2.id,
          agentName: currentDebate.agent2.name,
          agentColor: currentDebate.agent2.color,
          content:
            "Certes, mais leur adversaire n'a encaissé qu'un seul but lors de ses 3 derniers déplacements. La solidité défensive ne peut être ignorée.",
          side: "right",
        },
        {
          agentId: currentDebate.agent1.id,
          agentName: currentDebate.agent1.name,
          agentColor: currentDebate.agent1.color,
          content:
            "Les confrontations directes montrent 4 matchs sur 5 avec plus de 2.5 buts. L'historique plaide pour un match offensif.",
          side: "left",
        },
        {
          agentId: currentDebate.agent2.id,
          agentName: currentDebate.agent2.name,
          agentColor: currentDebate.agent2.color,
          content:
            "Mais le contexte actuel diffère : blessures clés, conditions météo défavorables. Les données brutes ne suffisent pas.",
          side: "right",
        },
        {
          agentId: currentDebate.agent1.id,
          agentName: currentDebate.agent1.name,
          agentColor: currentDebate.agent1.color,
          content:
            "Les xG (expected goals) suggèrent une sous-performance récente qui devrait se corriger. La régression vers la moyenne favorise mon analyse.",
          side: "left",
        },
        {
          agentId: currentDebate.agent2.id,
          agentName: currentDebate.agent2.name,
          agentColor: currentDebate.agent2.color,
          content:
            "Conclusion finale : mes sources internes confirment une approche tactique défensive. L'intelligence humaine complète vos statistiques.",
          side: "right",
        },
      ]

      // Add messages with delays
      for (let i = 0; i < debateMessages.length; i++) {
        setIsTyping(true)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Typing delay

        const message: DebateMessage = {
          ...debateMessages[i]!,
          id: `msg-${i}`,
          timestamp: new Date(),
        }

        addMessage(message)
        setCurrentMessageIndex(i + 1)
        setIsTyping(false)

        await new Promise((resolve) => setTimeout(resolve, 8000)) // Pause between messages
      }

      // Show verdict
      updateStatus("verdict")
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Suspense animation

      setVerdict({
        winner: currentDebate.agent1.id,
        agent1Score: 62,
        agent2Score: 38,
        summary:
          "Les données statistiques et l'analyse xG l'emportent sur l'approche tactique. Avantage aux modèles prédictifs.",
      })

      await new Promise((resolve) => setTimeout(resolve, 8000)) // Display verdict

      endDebate()
    }

    void runDebate()
  }, [currentDebate?.id, currentDebate, addMessage, setCurrentMessageIndex, setIsTyping, updateStatus, setVerdict, endDebate]) // Only run when debate ID changes

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentDebate?.messages.length])

  if (!currentDebate) return null

  return (
    <>
      {/* Gray Overlay - Story 8.3 */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300" />

      {/* Debate Container */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col bg-bg-primary animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border-b border-accent-cyan/30 p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent-cyan animate-pulse" />
            <h2 className="font-display font-bold text-lg text-text-primary">
              {currentDebate.status === "verdict"
                ? "🎯 Verdict"
                : "⚔️ Débat en cours..."}
            </h2>
            <Sparkles className="w-5 h-5 text-accent-purple animate-pulse" />
          </div>
          <p className="text-sm text-center text-text-secondary">
            {currentDebate.topic}
          </p>
        </div>

        {/* Agents Header */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-bg-secondary border-b border-bg-tertiary">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-bg-primary font-display font-bold text-lg shrink-0 animate-in zoom-in duration-300"
              style={{ backgroundColor: currentDebate.agent1.color }}
            >
              {currentDebate.agent1.name[0]}
            </div>
            <div>
              <p className="font-semibold text-text-primary">
                {currentDebate.agent1.name}
              </p>
              {currentDebate.verdict && (
                <p className="text-xs text-accent-cyan font-bold">
                  {currentDebate.verdict.agent1Score}%
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <p className="font-semibold text-text-primary">
                {currentDebate.agent2.name}
              </p>
              {currentDebate.verdict && (
                <p className="text-xs text-accent-purple font-bold">
                  {currentDebate.verdict.agent2Score}%
                </p>
              )}
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-bg-primary font-display font-bold text-lg shrink-0 animate-in zoom-in duration-300"
              style={{ backgroundColor: currentDebate.agent2.color }}
            >
              {currentDebate.agent2.name[0]}
            </div>
          </div>
        </div>

        {/* Messages - Story 8.4 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {currentDebate.messages.map((message, idx) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in slide-in-from-left duration-500",
                message.side === "right" && "flex-row-reverse slide-in-from-right"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-bg-primary font-bold shrink-0"
                style={{ backgroundColor: message.agentColor }}
              >
                {message.agentName[0]}
              </div>
              <div
                className={cn(
                  "flex-1 max-w-[80%] rounded-2xl p-4 border",
                  message.side === "left"
                    ? "rounded-tl-none bg-accent-cyan/10 border-accent-cyan/30"
                    : "rounded-tr-none bg-accent-purple/10 border-accent-purple/30"
                )}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: message.agentColor }}>
                  {message.agentName}
                </p>
                <p className="text-sm text-text-primary leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse" />
              <div className="flex items-center gap-1 bg-bg-tertiary/50 rounded-2xl px-4 py-2">
                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Verdict - Story 8.5 */}
        {currentDebate.status === "verdict" && currentDebate.verdict && (
          <div className="p-6 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border-t border-accent-cyan/30 animate-in slide-in-from-bottom duration-700">
            {/* Gavel Animation */}
            <div className="flex justify-center mb-4 animate-in zoom-in duration-500">
              <div className="relative">
                <Gavel className="w-16 h-16 text-accent-gold animate-pulse" />
                <div className="absolute inset-0 bg-accent-gold/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>

            {/* Verdict Title */}
            <h3 className="font-display font-bold text-2xl text-center text-text-primary mb-4 animate-in slide-in-from-bottom duration-500">
              🏆 Verdict Final
            </h3>

            {/* Score Bar */}
            <div className="bg-bg-tertiary rounded-full h-8 overflow-hidden mb-4 animate-in slide-in-from-bottom duration-700">
              <div className="flex h-full">
                <div
                  className="bg-gradient-to-r from-accent-cyan to-accent-cyan/80 flex items-center justify-center text-bg-primary font-bold text-sm transition-all duration-1000"
                  style={{ width: `${currentDebate.verdict.agent1Score}%` }}
                >
                  {currentDebate.verdict.agent1Score}%
                </div>
                <div
                  className="bg-gradient-to-r from-accent-purple/80 to-accent-purple flex items-center justify-center text-bg-primary font-bold text-sm transition-all duration-1000"
                  style={{ width: `${currentDebate.verdict.agent2Score}%` }}
                >
                  {currentDebate.verdict.agent2Score}%
                </div>
              </div>
            </div>

            {/* Winner */}
            <div className="flex items-center justify-center gap-2 mb-4 animate-in zoom-in duration-700 delay-500">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-bg-primary font-display font-bold text-2xl relative",
                  "animate-pulse"
                )}
                style={{
                  backgroundColor:
                    currentDebate.verdict.winner === currentDebate.agent1.id
                      ? currentDebate.agent1.color
                      : currentDebate.agent2.color,
                }}
              >
                {currentDebate.verdict.winner === currentDebate.agent1.id
                  ? currentDebate.agent1.name[0]
                  : currentDebate.agent2.name[0]}
                <div className="absolute inset-0 bg-accent-gold/30 rounded-full blur-lg animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-text-tertiary">Vainqueur</p>
                <p className="font-display font-bold text-xl text-text-primary">
                  {currentDebate.verdict.winner === currentDebate.agent1.id
                    ? currentDebate.agent1.name
                    : currentDebate.agent2.name}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-bg-tertiary animate-in slide-in-from-bottom duration-700 delay-700">
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {currentDebate.verdict.summary}
              </p>
            </div>

            {/* Confetti would be rendered here via a library like react-confetti */}
          </div>
        )}

        {/* Progress Indicator */}
        {currentDebate.status === "in-progress" && (
          <div className="px-4 py-3 bg-bg-secondary border-t border-bg-tertiary">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>Échange {currentMessageIndex} / 6</span>
              <span>
                {isTyping ? "En train d'écrire..." : "Pause de réflexion..."}
              </span>
            </div>
            <div className="h-1 bg-bg-tertiary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-500"
                style={{ width: `${(currentMessageIndex / 6) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
