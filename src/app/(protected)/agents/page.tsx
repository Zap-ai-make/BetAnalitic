"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft } from "lucide-react"
import { AgentChat } from "~/components/features/agents/AgentChat"
import { api } from "~/trpc/react"

export default function AgentsPage() {
  useSession() // Verify auth
  const router = useRouter()
  const { data: agents = [] } = api.agents.getEnabled.useQuery()

  const [selectedAgentType, setSelectedAgentType] = React.useState<string>()

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg-primary border-b border-bg-tertiary">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-h-11"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <h1 className="font-display text-lg font-bold text-text-primary">
            Agents IA
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        {!selectedAgentType ? (
          // Agent selection grid
          <div className="p-4">
            <p className="text-text-secondary mb-4">
              Sélectionnez un agent pour commencer une conversation
            </p>
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentType(agent.id.toUpperCase())}
                  className="flex flex-col items-center gap-2 p-4 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors min-h-[120px] border border-bg-tertiary"
                  style={{
                    borderLeftColor: agent.color,
                    borderLeftWidth: "4px",
                  }}
                >
                  <span className="text-4xl">{agent.emoji}</span>
                  <span className="font-display font-semibold text-text-primary text-center">
                    {agent.name}
                  </span>
                  <span className="text-xs text-text-secondary text-center line-clamp-2">
                    {agent.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat interface
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border-b border-bg-tertiary">
              <button
                onClick={() => setSelectedAgentType(undefined)}
                className="min-h-11 min-w-11 flex items-center justify-center text-text-secondary hover:text-text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex-1">
                {(() => {
                  const agent = agents.find(
                    (a) => a.id.toUpperCase() === selectedAgentType
                  )
                  return agent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <div className="font-display font-semibold text-text-primary">
                          {agent.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {agent.category}
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            </div>
            <AgentChat agentType={selectedAgentType} className="flex-1" />
          </div>
        )}
      </main>
    </div>
  )
}
