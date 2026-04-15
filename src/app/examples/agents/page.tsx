"use client"

import { useState } from "react"
import {
  AgentPillRow,
  AgentMessage,
  AgentInvokeInput,
  AGENTS,
  type Agent,
  type AgentId,
} from "~/components/features/analysis"
import type { AgentMetadata } from "~/lib/agents/types"

export default function AgentsExamplesPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null)
  const [inputValue, setInputValue] = useState("")

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)
  }

  const handleSubmit = (value: string, mentionedAgent?: AgentMetadata) => {
    console.log("Submit:", value, mentionedAgent)
    setInputValue("")
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg-primary text-text-primary font-body p-8">
      <div className="container mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Agent Components Examples
          </h1>
          <p className="font-body text-base text-text-secondary">
            AgentPill, AgentMessage, et AgentInvokeInput
          </p>
        </div>

        {/* AgentPillRow */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-cyan pl-4">
            AgentPillRow - Sélection d&apos;agents
          </h2>

          <div className="bg-bg-secondary rounded-lg p-6">
            <p className="text-text-secondary text-sm mb-4">
              Scroll horizontal avec les 14 agents. Cliquez pour sélectionner.
            </p>
            <AgentPillRow
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
            />
            {selectedAgentId && (
              <p className="text-accent-cyan text-sm mt-4">
                Agent sélectionné:{" "}
                <strong>
                  {AGENTS.find((a) => a.id === selectedAgentId)?.name}
                </strong>
              </p>
            )}
          </div>
        </section>

        {/* AgentMessage Examples */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-orange pl-4">
            AgentMessage - Réponses des agents
          </h2>

          <div className="space-y-4">
            {/* Scout message */}
            <AgentMessage
              agent={AGENTS[0]!}
              timestamp={new Date()}
              content={`## Analyse du match PSG vs OM

**Contexte:** Derby classique avec une forte rivalité historique.

### Points clés:
- PSG en forme (5 victoires consécutives)
- OM avec 3 joueurs clés blessés
- Arbitre: M. Turpin (moyenne de 4.2 cartons/match)

Le **momentum** favorise clairement le PSG dans ce contexte.`}
            />

            {/* Tactic message */}
            <AgentMessage
              agent={AGENTS[3]!}
              timestamp={new Date(Date.now() - 300000)}
              content={`### Formation probable PSG
\`4-3-3\` avec Mbappé en pointe

- Défense haute avec pressing
- Transitions rapides sur les ailes
- Milieu de terrain compact`}
            />

            {/* Streaming message */}
            <AgentMessage
              agent={AGENTS[5]!}
              timestamp={new Date()}
              isStreaming={true}
              content={`Le momentum actuel montre une tendance favorable pour l'équipe à domicile. Les dernières statistiques indiquent...`}
            />
          </div>
        </section>

        {/* AgentInvokeInput */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-green pl-4">
            AgentInvokeInput - Invocation d&apos;agents
          </h2>

          <div className="bg-bg-secondary rounded-lg p-6 space-y-4">
            <p className="text-text-secondary text-sm">
              Tapez <code className="text-accent-cyan">@</code> pour voir
              l&apos;autocomplete des agents.
            </p>
            <AgentInvokeInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
            />
          </div>
        </section>

        {/* Real-world Example */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary border-l-4 border-accent-gold pl-4">
            Exemple réel: Conversation avec agents
          </h2>

          <div className="bg-bg-tertiary rounded-lg p-6 space-y-6">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              Analyse Solo - PSG vs OM
            </h3>

            {/* Agent selector */}
            <div>
              <p className="text-text-tertiary text-xs mb-2 uppercase tracking-wider">
                Sélectionner un agent
              </p>
              <AgentPillRow
                selectedAgentId={selectedAgentId}
                onAgentSelect={handleAgentSelect}
              />
            </div>

            {/* Messages */}
            <div className="space-y-4">
              <AgentMessage
                agent={AGENTS[0]!}
                timestamp={new Date(Date.now() - 600000)}
                content={`Les données récentes montrent que **PSG** a une possession moyenne de 62% à domicile cette saison. L'OM peine en déplacement avec seulement 2 victoires sur 10.`}
              />
              <AgentMessage
                agent={AGENTS[3]!}
                timestamp={new Date(Date.now() - 300000)}
                content={`La tactique de Luis Enrique privilégie le \`pressing haut\`. Attention aux contres rapides de l'OM qui restent dangereux.`}
              />
            </div>

            {/* Input */}
            <div>
              <p className="text-text-tertiary text-xs mb-2 uppercase tracking-wider">
                Poser une question
              </p>
              <AgentInvokeInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder="@Scout Quelle est la forme récente du PSG?"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
