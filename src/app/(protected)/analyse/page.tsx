"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { ChevronLeft, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "~/components/shared/DashboardNav"

interface CouponMatch {
  id: string
  homeTeam: string
  awayTeam: string
  tags: string[]
}

interface AgentMessage {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  content: string
  timestamp: Date
  isThinking?: boolean
}

// Mock data
const MOCK_COUPON: CouponMatch[] = [
  { id: "1", homeTeam: "PSG", awayTeam: "OM", tags: ["Derby", "Classico"] },
  { id: "2", homeTeam: "Lyon", awayTeam: "Monaco", tags: ["Course au titre"] },
]

const INITIAL_MESSAGES: AgentMessage[] = [
  {
    id: "1",
    agentId: "scout",
    agentName: "Scout",
    agentColor: "var(--color-agent-scout)",
    content: `**PSG vs OM - Historique H2H:**

Les 5 dernières confrontations:
• PSG 3-0 OM (Ligue 1)
• OM 0-2 PSG (Coupe)
• PSG 1-0 OM (Ligue 1)

**Tendance:** PSG domine avec 4 victoires sur 5.`,
    timestamp: new Date(Date.now() - 120000),
  },
]

export default function AnalysePage() {
  const router = useRouter()
  const [mode, setMode] = React.useState<"analytical" | "supporter">("analytical")
  const [coupon, setCoupon] = React.useState<CouponMatch[]>(MOCK_COUPON)
  const [messages, setMessages] = React.useState<AgentMessage[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [thinkingAgent, setThinkingAgent] = React.useState<string | null>("tactic")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const removeMatch = (matchId: string) => {
    setCoupon((prev) => prev.filter((m) => m.id !== matchId))
  }

  const handleInvokeAgent = (agentId: string, agentName: string, agentColor: string) => {
    setThinkingAgent(agentId)

    // Simulate agent response
    setTimeout(() => {
      const newMessage: AgentMessage = {
        id: `msg-${Date.now()}`,
        agentId,
        agentName,
        agentColor,
        content: `Analyse de ${agentName} pour votre coupon:\n\nJe détecte des patterns intéressants dans les données statistiques. Le match PSG vs OM présente une forte asymétrie...`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
      setThinkingAgent(null)
    }, 2000)
  }

  const handleFullAnalysis = () => {
    setIsAnalyzing(true)
    // Would trigger all 14 agents
    setTimeout(() => setIsAnalyzing(false), 3000)
  }

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Mon Analyse</span>
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Save className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-48">
        <div className="p-4 space-y-4">
          {/* Coupon Header */}
          <div className="bg-bg-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span className="font-mono text-sm text-text-primary">
                  Coupon ({coupon.length}/10 matchs)
                </span>
              </div>
            </div>
            {coupon.length >= 2 && (
              <p className="text-xs text-accent-gold flex items-center gap-1">
                <span>⚠️</span>
                Agents plus efficaces match par match
              </p>
            )}
          </div>

          {/* Coupon Matches */}
          <div className="space-y-2">
            {coupon.map((match) => (
              <div
                key={match.id}
                className="bg-bg-secondary rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-text-primary text-sm">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {match.tags.map((t, i) => (
                      <span key={t}>
                        {i > 0 && " • "}
                        {t === "Derby" && "🏆 "}
                        {t === "Classico" && "⚔️ "}
                        {t}
                      </span>
                    ))}
                  </p>
                </div>
                <button
                  onClick={() => removeMatch(match.id)}
                  className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Mode Toggle */}
          <div className="bg-bg-secondary rounded-full p-1 flex">
            <button
              onClick={() => setMode("analytical")}
              className={cn(
                "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
                mode === "analytical"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              📊 Analytique
            </button>
            <button
              onClick={() => setMode("supporter")}
              className={cn(
                "flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all",
                mode === "supporter"
                  ? "bg-accent-cyan text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              ⚽ Supporter
            </button>
          </div>

          {/* Agent Input */}
          <div className="bg-bg-secondary rounded-xl p-3 flex items-center gap-2">
            <span className="text-text-tertiary">@</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Invoquer un agent..."
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary outline-none text-sm"
            />
          </div>

          {/* Full Analysis Button */}
          <button
            onClick={handleFullAnalysis}
            disabled={isAnalyzing || coupon.length === 0}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-sm transition-all",
              "bg-gradient-to-r from-accent-cyan to-[#0099CC]",
              "text-bg-primary",
              "hover:opacity-90 disabled:opacity-50",
              "flex items-center justify-center gap-2"
            )}
          >
            <span>⚡</span>
            {isAnalyzing ? "Analyse en cours..." : "Analyse Complète (14 agents)"}
          </button>

          {/* Conversation */}
          <div className="space-y-4 pt-4">
            <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
              <span>💬</span>
              Conversation
            </h3>

            {messages.map((msg) => (
              <AgentMessageCard key={msg.id} message={msg} />
            ))}

            {/* Thinking Agent */}
            {thinkingAgent && (
              <div
                className="bg-bg-secondary rounded-xl p-4"
                style={{ borderLeft: `3px solid var(--color-agent-${thinkingAgent})` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: `var(--color-agent-${thinkingAgent})` }}
                  />
                  <span className="font-semibold text-text-primary text-sm">
                    {thinkingAgent === "tactic" ? "TacticMaster" : thinkingAgent}
                  </span>
                  <span className="text-xs text-text-tertiary ml-auto">À l&apos;instant</span>
                </div>
                <ThinkingDots />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Quick Agent Pills */}
      <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pt-8 pb-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "scout", name: "Scout", color: "var(--color-agent-scout)" },
            { id: "insider", name: "Insider", color: "var(--color-agent-insider)" },
            { id: "tactic", name: "TacticMaster", color: "var(--color-agent-tactic)" },
            { id: "momentum", name: "MomentumX", color: "var(--color-agent-momentum)" },
            { id: "goal", name: "GoalMaster", color: "var(--color-agent-goal)" },
          ].map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleInvokeAgent(agent.id, agent.name, agent.color)}
              className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-full border border-bg-tertiary hover:border-current transition-colors shrink-0"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <span className="text-sm font-medium text-text-primary whitespace-nowrap">
                {agent.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DashboardNav />
    </div>
  )
}

// Agent Message Card Component
function AgentMessageCard({ message }: { message: AgentMessage }) {
  return (
    <div
      className="bg-bg-secondary rounded-xl p-4"
      style={{ borderLeft: `3px solid ${message.agentColor}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: message.agentColor }}
        />
        <span className="font-semibold text-text-primary text-sm">
          {message.agentName}
        </span>
        <span className="text-xs text-text-tertiary ml-auto">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {message.content.split("**").map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-text-primary font-semibold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </div>
    </div>
  )
}

// Thinking Dots Animation
function ThinkingDots() {
  return (
    <div className="flex gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 200}ms`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}
